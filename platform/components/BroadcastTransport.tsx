import { useEffect, useRef, useState } from 'react';
import { publishWhip, type WhipPublisher } from '../services/whipClient';

type Session = { id: string; title: string; state: string; clientBytesSent: number; path: string };
type Failover = { id: string; downtimeMs: number | null; resolved: boolean };

type Phase = 'standby' | 'connecting' | 'publishing' | 'recovering' | 'failed';

export default function BroadcastTransport({ getStream }: { getStream: () => MediaStream | null }) {
  const [whipUrl, setWhipUrl] = useState('');
  const [token, setToken] = useState('');
  const [phase, setPhase] = useState<Phase>('standby');
  const [message, setMessage] = useState('Camera preview alone does not broadcast. Connect a real WHIP endpoint to publish.');
  const [bytes, setBytes] = useState(0);
  const [recoveryMs, setRecoveryMs] = useState<number | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const publishing = useRef<WhipPublisher | null>(null);
  const sessionId = useRef<string | null>(null);
  const operatorToken = useRef('');
  const busy = phase === 'connecting' || phase === 'recovering';

  async function api<T>(path: string, body?: object): Promise<T> {
    const response = await fetch(`/api/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Authorization': `Bearer ${operatorToken.current}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      credentials: 'same-origin',
    });
    const value = await response.json() as T & { error?: string };
    if (!response.ok) throw new Error(value.error || `Studio ledger error ${response.status}`);
    return value;
  }

  async function waitForMedia(pub: WhipPublisher) {
    for (let i = 0; i < 25; i += 1) {
      if (pub.pc.connectionState !== 'connected') throw new Error('WHIP peer connection was lost');
      const count = await pub.outboundBytes();
      if (count > 0) return count;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    throw new Error('No outbound RTP bytes were measured after connection');
  }

  async function start() {
    if (busy || publishing.current) return;
    const stream = getStream();
    if (!stream || !stream.getTracks().some(t => t.readyState === 'live')) { setMessage('Camera and microphone must be available first.'); return; }
    if (token.length < 24) { setMessage('Enter the studio operator token configured on the backend.'); return; }
    operatorToken.current = token;
    setPhase('connecting'); setMessage('Creating session and negotiating WHIP…');
    let createdId: string | null = null;
    try {
      const created = await api<{ session: Session }>('sessions', { title: 'Amalgam Studio Session' });
      createdId = created.session.id;
      sessionId.current = createdId;
      setSession(created.session);
      const pub = await publishWhip(stream, whipUrl);
      publishing.current = pub;
      const measured = await waitForMedia(pub);
      const result = await api<{ session: Session }>(`sessions/${createdId}/telemetry`, { connectionState: 'connected', bytesSent: measured });
      setBytes(measured); setSession(result.session);
      setPhase('publishing');
      setMessage('WHIP peer is connected and outbound RTP is measured. Destination reception has not been independently verified.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'WHIP publish failed');
      setPhase('failed');
      await publishing.current?.stop(); publishing.current = null;
      if (createdId) await api(`sessions/${createdId}/close`, {}).catch(() => undefined);
      sessionId.current = null;
    }
  }

  async function stop() {
    const id = sessionId.current;
    sessionId.current = null;
    const pub = publishing.current;
    publishing.current = null;
    await pub?.stop();
    if (id) await api(`sessions/${id}/close`, {}).catch(() => undefined);
    setSession(null); setBytes(0); setRecoveryMs(null); setPhase('standby');
    setMessage('Publishing stopped. Local camera preview can continue.');
  }

  async function injectFailure() {
    const id = sessionId.current;
    if (!id || !publishing.current || busy) return;
    setPhase('recovering'); setMessage('Injecting a transport failure and attempting republish…');
    let eventId: string | null = null;
    try {
      const failed = await api<{ event: Failover }>(`sessions/${id}/failure`, {});
      eventId = failed.event.id;
      await publishing.current.stop(); publishing.current = null;
      const stream = getStream();
      if (!stream) throw new Error('Original media stream is unavailable');
      const replacement = await publishWhip(stream, whipUrl);
      publishing.current = replacement;
      const fresh = await waitForMedia(replacement);
      const outcome = await api<{ session: Session; event: Failover }>(`sessions/${id}/recover`, { eventId, connectionState: 'connected', bytesSent: fresh });
      setSession(outcome.session); setBytes(fresh); setRecoveryMs(outcome.event.downtimeMs);
      setPhase('publishing');
      setMessage('WHIP republished. The server measured request-to-request recovery time; end-to-end viewer continuity remains unverified.');
    } catch (e) {
      setPhase('failed');
      setMessage((e instanceof Error ? e.message : 'Recovery failed') + '. The failure record remains open.');
    }
  }

  useEffect(() => {
    if (phase !== 'publishing') return;
    let alive = true; let inFlight = false;
    const timer = window.setInterval(() => {
      if (inFlight) return;
      const id = sessionId.current, pub = publishing.current;
      if (!id || !pub) return;
      inFlight = true;
      void (async () => {
        try {
          const value = await pub.outboundBytes();
          const result = await api<{ session: Session }>(`sessions/${id}/telemetry`, { connectionState: pub.pc.connectionState, bytesSent: value });
          if (alive) { setBytes(value); setSession(result.session); }
          if (pub.pc.connectionState !== 'connected') throw new Error('Transport is no longer connected; stop or test recovery before proceeding');
        } catch (e) {
          if (alive) { setPhase('failed'); setMessage(e instanceof Error ? e.message : 'Telemetry failed'); }
        } finally { inFlight = false; }
      })();
    }, 2000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [phase]);

  useEffect(() => {
    const onEmergency = () => { void stop(); };
    window.addEventListener('amalgam:emergency-stop', onEmergency);
    return () => window.removeEventListener('amalgam:emergency-stop', onEmergency);
  }, []);

  useEffect(() => () => {
    const pub = publishing.current;
    publishing.current = null;
    void pub?.stop();
    const id = sessionId.current;
    sessionId.current = null;
    if (id) void fetch(`/api/sessions/${id}/close`, { method: 'POST', headers: { Authorization: `Bearer ${operatorToken.current}`, 'Content-Type': 'application/json' }, body: '{}' }).catch(() => undefined);
  }, []);

  return (
    <section aria-label="Broadcast transport" className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-white">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Broadcast transport</h3>
        <span className="text-xs uppercase tracking-wider text-slate-300">{phase === 'publishing' ? 'WHIP publishing' : phase}</span>
      </div>
      <p className="mb-3 text-sm text-slate-300">The media server must be configured separately. These measurements are client-reported outbound RTP, not verified platform delivery.</p>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="text-xs text-slate-300">WHIP ingest URL
          <input aria-label="WHIP ingest URL" className="mt-1 w-full rounded-lg border border-white/20 bg-slate-900 p-2 text-white" type="url" placeholder="https://your-media-server/whip" value={whipUrl} onChange={e => setWhipUrl(e.target.value)} disabled={phase === 'publishing' || busy} />
        </label>
        <label className="text-xs text-slate-300">Local studio operator token
          <input aria-label="Local studio operator token" className="mt-1 w-full rounded-lg border border-white/20 bg-slate-900 p-2 text-white" type="password" autoComplete="off" placeholder="Set AMALGAM_STUDIO_TOKEN in backend" value={token} onChange={e => setToken(e.target.value)} disabled={phase === 'publishing' || busy} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => void start()} disabled={busy || phase === 'publishing'} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm disabled:opacity-40">Publish WHIP</button>
        <button type="button" onClick={() => void injectFailure()} disabled={phase !== 'publishing'} className="rounded-lg border border-amber-500 px-4 py-2 text-sm disabled:opacity-40">Test recovery</button>
        <button type="button" onClick={() => void stop()} disabled={!sessionId.current && !publishing.current} className="rounded-lg border border-slate-500 px-4 py-2 text-sm disabled:opacity-40">Stop</button>
      </div>
      <p role="status" className="mt-3 text-sm text-slate-300">{message}</p>
      <p className="mt-2 font-mono text-xs text-slate-400">Session: {session?.id.slice(0, 8) || 'none'} · Reported bytes: {bytes.toLocaleString()} · Recovery: {recoveryMs === null ? 'not measured' : `${recoveryMs} ms`}</p>
    </section>
  );
}
