# Amalgam Platform — recovered Studio + WHIP proof path

This is a **recovered continuation of `Amalgam_Platform_GitHub_Update.zip`**, not a replacement for the separate SWD-LLC Amalgam-OS repository. The original React 19 studio, creator components, and Base44 patch assets are retained. Grok's TanStack Start experiment remains a reference only and was **not** grafted into this application.

## What works and what does not

- The studio can request a local camera and microphone and display a **preview**. It does not call the preview "live".
- A new WHIP publisher negotiates SDP over HTTPS, waits for an ICE/DTLS connection, and measures **browser outbound RTP bytes**. The WHIP service is **not bundled**; you must provide an actual ingest endpoint with CORS enabled for the studio origin.
- A local Node studio ledger creates sessions, accepts authenticated browser telemetry, records injected failures, and measures recovery time from **server-received requests**. It does **not** accept media or verify destination playback.
- The Go Live controls do not claim Twitch, YouTube, Kick, or RTMP delivery. Real platform fan-out requires a separate media pipeline.
- The old backend prototype has been preserved under `backend/legacy/server.js.txt` so its permissive CORS and unauthenticated routes cannot be run by mistake.
- Browser Gemini API calls are deliberately **disabled** rather than shipping the Gemini secret in JavaScript. AI features require a future authenticated **server-side proxy**. Do not put API keys in `VITE_*` variables.
- `backend/data/` persists studio session logs and injected failover records as JSON; this is a single-operator development ledger, **not** production authentication or a production relational database.

## Windows development

Run in separate PowerShell terminals from the extracted folder:

```powershell
# Backend: generate a unique token, keep it private and use the SAME token in the UI.
$env:AMALGAM_STUDIO_TOKEN = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
npm run server
```

```powershell
# Frontend. The lockfile now points to the public registry and preserves integrity hashes.
npm ci --registry https://registry.npmjs.org/
npm run typecheck
npm run test:backend
npm run test:whip
npm run build
npm run dev
```

Visit `http://127.0.0.1:5173`. The Vite development proxy forwards `/api` to `127.0.0.1:8787`. Paste the operator token and your external WHIP ingest URL into the Broadcast Transport controls below the Studio preview. Do **not** use a production secret in an untrusted/shared browser. WHIP requires the browser and endpoint to be reachable and connected via HTTPS (localhost HTTP is allowed for testing).

To test failure recovery: publish actual RTP, check outbound bytes, press **Test recovery**, and inspect the session ledger in `backend/data/broadcast-ledger.json`. Recovery time measures when the backend received failure and recovery requests, not guaranteed outage duration at an external platform.

### Container build

```powershell
$env:AMALGAM_STUDIO_TOKEN = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
docker compose up --build
```

Open `http://127.0.0.1:8787` (container serves compiled site and ledger). The Docker build uses `npm ci` with the public registry and runs TypeScript validation, backend tests, WHIP tests and Vite build. It runs the studio, **not** a WHIP media server. The named Docker volume preserves the ledger. These files have not yet been confirmed in a completed Docker build in this environment.

## Acceptance boundary

1. `npm ci`, `npm run typecheck`, `npm run build` and both test suites pass.
2. A connected real WHIP peer reports an increasing outbound RTP counter for at least ten seconds.
3. A separate media-server playback/ingest monitor confirms the *remote* stream. This remains outstanding.
4. One injected failure produces a server timestamped event; successful republish and nonzero outbound RTP resolve it.
5. Test the emergency stop and restart. No production claims or automated failover SLOs until independent remote verification is implemented.

**Known limitation:** Public registry access is required for a fresh `npm ci`. The previously uploaded lockfile used an inaccessible internal registry for 155 package tarballs, which has now been normalized to `registry.npmjs.org`. The offline dependency install in the current recovery environment still failed because `yallist@3.1.1` was not cached. No full type-check, Vite or Docker success is claimed based on that failure.
