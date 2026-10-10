/** Single-operator, local development broadcast-session ledger.
 * Does not ingest media or independently verify viewers/remote RTP reception.
 * Do not expose this prototype publicly without real user authentication.
 */
"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const TOKEN = process.env.AMALGAM_STUDIO_TOKEN || "";
const DATA_FILE = path.resolve(process.env.AMALGAM_LEDGER_PATH || path.join(__dirname, "data", "broadcast-ledger.json"));
if (TOKEN.length < 24) {
  console.error("AMALGAM_STUDIO_TOKEN is required (at least 24 characters). No default access token is provided.");
  process.exit(1);
}
if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) throw new Error("Invalid PORT");

function initial() { return { version: 1, sessions: {}, events: {} }; }
let ledger = initial();
try {
  if (fs.existsSync(DATA_FILE)) {
    const disk = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!disk || disk.version !== 1 || typeof disk.sessions !== "object" || typeof disk.events !== "object") throw new Error("Invalid ledger data");
    ledger = disk;
  }
} catch (e) { throw new Error(`Ledger could not be loaded; it was NOT overwritten: ${e.message}`); }

function persist() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(ledger, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, DATA_FILE);
}
function reply(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(JSON.stringify(value));
}
function equalToken(value) {
  const submitted = Buffer.from(value || "", "utf8");
  const expected = Buffer.from(TOKEN, "utf8");
  return submitted.length === expected.length && crypto.timingSafeEqual(submitted, expected);
}
function safeId(id) { return typeof id === "string" && /^[a-f0-9-]{36}$/.test(id); }
function parseNumber(v, max) { return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max ? v : null; }
async function bodyJson(req) {
  let total = 0; const buffers = [];
  for await (const part of req) {
    total += part.length;
    if (total > 16384) { const e = Error("Request too large"); e.code = 413; throw e; }
    buffers.push(part);
  }
  const value = JSON.parse(Buffer.concat(buffers).toString("utf8") || "{}");
  if (!value || Array.isArray(value) || typeof value !== "object") throw Error("Expected JSON object");
  return value;
}
function updateSession(session, changes) { Object.assign(session, changes, { updatedAt: new Date().toISOString() }); persist(); }
function getEvent(sessionId) { return Object.values(ledger.events).filter(e => e.sessionId === sessionId).sort((a,b)=>b.detectedAt.localeCompare(a.detectedAt)); }
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon" };
function serveSite(res, pathname) {
  if (!fs.existsSync(DIST)) return reply(res, 503, { error: "Build dist/ first: npm run build" });
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return reply(res, 400, { error: "Bad path" }); }
  if (decoded.includes("\\") || decoded.includes("\0") || decoded.split("/").includes("..")) return reply(res, 403, { error: "Forbidden" });
  const file = path.resolve(DIST, "." + (decoded === "/" ? "/index.html" : decoded));
  if (file !== DIST && !file.startsWith(DIST + path.sep)) return reply(res, 403, { error: "Forbidden" });
  const resolved = fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(DIST, "index.html");
  res.writeHead(200, { "Content-Type": types[path.extname(resolved)] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
  fs.createReadStream(resolved).pipe(res);
}
const server = http.createServer(async (req,res) => {
  const base = `http://${req.headers.host || "localhost"}`;
  let url;
  try { url = new URL(req.url,base); } catch { return reply(res,400,{error:"Invalid URL"}); }
  if (req.method === "GET" && url.pathname === "/api/status") return reply(res,200,{status:"ok",mediaIngest:false,source:"broadcast-ledger"});
  if (!url.pathname.startsWith("/api/")) return req.method === "GET" ? serveSite(res,url.pathname) : reply(res,405,{error:"Method not allowed"});
  if (!equalToken((req.headers.authorization || "").replace(/^Bearer\s+/i,""))) return reply(res,401,{error:"Studio token required"});
  const parts = url.pathname.split("/").filter(Boolean);
  try {
    if (parts.length === 2 && parts[1] === "sessions" && req.method === "POST") {
      const b = await bodyJson(req);
      if (typeof b.title !== "string" || b.title.trim().length < 1 || b.title.length > 120) return reply(res,400,{error:"Title must be 1–120 characters"});
      const id=crypto.randomUUID(); const now = new Date().toISOString();
      const session={id,title:b.title.trim(),state:"armed",path:"none",clientBytesSent:0,clientConnectionState:"new",createdAt:now,updatedAt:now};
      ledger.sessions[id]=session; persist(); return reply(res,201,{session});
    }
    if (parts.length !== 3 && parts.length !== 4) return reply(res,404,{error:"Not found"});
    const id = parts[2];
    if (parts[1] !== "sessions" || !safeId(id) || !ledger.sessions[id]) return reply(res,404,{error:"No such session"});
    const s=ledger.sessions[id];
    if (parts.length===3 && req.method==="GET") return reply(res,200,{session:s,events:getEvent(id)});
    if (parts.length!==4 || req.method!=="POST") return reply(res,405,{error:"Method not allowed"});
    const op=parts[3], b=await bodyJson(req);
    if (op==="telemetry") {
      if (s.state==="failed" || s.state==="closed") return reply(res,409,{error:"Session not receiving telemetry"});
      const bytes=parseNumber(b.bytesSent, Number.MAX_SAFE_INTEGER);
      if (bytes===null || !Number.isInteger(bytes) || typeof b.connectionState!=="string" || !["connected","connecting","disconnected","failed","closed","new"].includes(b.connectionState)) return reply(res,400,{error:"Invalid telemetry"});
      if (bytes<s.clientBytesSent) return reply(res,409,{error:"Byte counter went backwards"});
      const reportedLive=b.connectionState==="connected" && bytes>0;
      updateSession(s,{clientBytesSent:bytes,clientConnectionState:b.connectionState,state:reportedLive?"client-reported-publishing":"armed",path:reportedLive?"whip-client-reported":"none"});
      return reply(res,200,{session:s,verification:"client-reported-outbound-rtp; destination delivery not independently verified"});
    }
    if (op==="failure") {
      if (s.state==="closed" || s.state==="failed") return reply(res,409,{error:"Session cannot enter failed state"});
      const event={id:crypto.randomUUID(),sessionId:id,type:"injected_drop",recoveryAction:"republish_whip",detectedAt:new Date().toISOString(),recoveredAt:null,downtimeMs:null,resolved:false,verification:"client-reported-outbound-rtp"};
      ledger.events[event.id]=event;
      updateSession(s,{state:"failed",clientConnectionState:"failed",path:"none"});
      return reply(res,201,{event,session:s});
    }
    if (op==="recover") {
      const event=ledger.events[b.eventId];
      if (s.state!=="failed" || !event || event.sessionId!==id || event.resolved) return reply(res,409,{error:"No matching open failure"});
      const bytes=parseNumber(b.bytesSent, Number.MAX_SAFE_INTEGER);
      if (b.connectionState!=="connected" || !Number.isInteger(bytes) || bytes<=0) return reply(res,400,{error:"Recovery requires fresh connected peer and nonzero outbound bytes"});
      event.recoveredAt=new Date().toISOString();event.downtimeMs=Math.max(0,Date.parse(event.recoveredAt)-Date.parse(event.detectedAt));event.resolved=true;
      updateSession(s,{state:"client-reported-publishing",clientBytesSent:bytes,clientConnectionState:"connected",path:"whip-client-reported"});
      return reply(res,200,{session:s,event});
    }
    if (op==="close") {
      if (s.state==="closed") return reply(res,200,{session:s});
      updateSession(s,{state:"closed",clientConnectionState:"closed",path:"none"});
      return reply(res,200,{session:s});
    }
    return reply(res,404,{error:"Unknown operation"});
  } catch(e) { return reply(res,e.code===413?413:400,{error:e instanceof Error?e.message:"Invalid request"}); }
});
server.listen(PORT,HOST,()=> console.log(`Amalgam studio ledger on http://${HOST}:${server.address().port}; media delivery is external.`));
