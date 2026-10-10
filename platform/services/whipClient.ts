/** WHIP publisher for a real, separately operated WHIP ingest endpoint.
 * A successful SDP exchange does NOT prove that remote viewers receive media.
 * Source tracks belong to the Studio and are not stopped by this client.
 */
export type WhipPublisher = {
  pc: RTCPeerConnection;
  resourceUrl: string;
  outboundBytes: () => Promise<number>;
  stop: () => Promise<void>;
};

export function normalizeWhipEndpoint(raw: string): URL {
  const url = new URL(raw);
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
    throw new Error("Use HTTPS for WHIP, except HTTP on localhost for development.");
  }
  if (url.username || url.password || url.hash) throw new Error("WHIP URL must not contain embedded credentials or a fragment.");
  return url;
}

function waitForEvent(
  pc: RTCPeerConnection,
  eventName: "icegatheringstatechange" | "connectionstatechange",
  accepted: () => boolean,
  timeoutMs: number,
  failure: string,
): Promise<void> {
  if (accepted()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      pc.removeEventListener(eventName, changed);
    };
    const changed = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        cleanup(); reject(new Error("WHIP peer connection failed"));
      } else if (accepted()) {
        cleanup(); resolve();
      }
    };
    const timer = setTimeout(() => { cleanup(); reject(new Error(failure)); }, timeoutMs);
    pc.addEventListener(eventName, changed);
    changed();
  });
}

export async function publishWhip(
  stream: MediaStream,
  endpoint: string,
  options: { connectionTimeoutMs?: number } = {},
): Promise<WhipPublisher> {
  const url = normalizeWhipEndpoint(endpoint);
  const tracks = stream.getTracks().filter((track) => track.readyState === "live");
  if (!tracks.length) throw new Error("No live media tracks to publish");

  const pc = new RTCPeerConnection({ iceServers: [] });
  let resourceUrl: string | null = null;
  try {
    for (const track of tracks) pc.addTrack(track, stream);
    await pc.setLocalDescription(await pc.createOffer());
    await waitForEvent(pc, "icegatheringstatechange", () => pc.iceGatheringState === "complete", 10000, "ICE gathering timed out");
    if (!pc.localDescription?.sdp) throw new Error("SDP offer is unavailable");

    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: "POST", headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription.sdp, signal: controller.signal,
        credentials: "omit", redirect: "error",
      });
    } finally { clearTimeout(deadline); }

    if (res.status !== 201) {
      throw new Error(`WHIP server must answer HTTP 201, returned ${res.status}: ${(await res.text()).slice(0, 250)}`);
    }
    const location = res.headers.get("Location");
    if (!location) throw new Error("WHIP response omitted the required Location header");
    const resource = new URL(location, url);
    if (resource.origin !== url.origin || !["http:", "https:"].includes(resource.protocol)) {
      throw new Error("WHIP resource Location must use the endpoint origin");
    }
    resourceUrl = resource.toString();
    const answer = await res.text();
    if (!answer.includes("v=0")) throw new Error("WHIP response contains no valid-looking SDP answer");
    await pc.setRemoteDescription({ type: "answer", sdp: answer });
    await waitForEvent(pc, "connectionstatechange", () => pc.connectionState === "connected", options.connectionTimeoutMs ?? 15000, "WHIP ICE/DTLS connection not established");

    return {
      pc,
      resourceUrl,
      outboundBytes: async () => {
        const stats = await pc.getStats();
        let total = 0;
        stats.forEach((raw) => {
          const entry = raw as { type: string; isRemote?: boolean; bytesSent?: number };
          if (entry.type === "outbound-rtp" && !entry.isRemote && typeof entry.bytesSent === "number") total += entry.bytesSent;
        });
        return total;
      },
      stop: async () => {
        pc.close();
        if (resourceUrl) await fetch(resourceUrl, { method: "DELETE", credentials: "omit", redirect: "error" }).catch(() => undefined);
      },
    };
  } catch (error) {
    pc.close();
    if (resourceUrl) await fetch(resourceUrl, { method: "DELETE", credentials: "omit", redirect: "error" }).catch(() => undefined);
    throw error;
  }
}
