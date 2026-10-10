# Amalgam recovery record — 2026-10-10

## Source boundary

This recovery uses the uploaded `Amalgam_Platform_GitHub_Update.zip` archive (`Amalgam_Platform_ready/`) as the **source of the application**. The uploaded Grok workspace's TanStack Start files were reviewed as reference implementations only. No TanStack dependencies or overwritten UI were imported into this Vite workspace. The separate `SWD-LLC/Amalgam-OS` repository has not been modified.

The underlying Amalgam product, studio, creator features, data schemas and research belong to the original user-contributed project. The new components here are implementation/recovery changes; this file is not a novelty or invention-priority claim.

## Changes delivered

- `services/whipClient.ts`: WHIP SDP POST, 201/Location validation, non-trickle ICE gathering, connection timeout, RTP-byte reporting, DELETE on stop, origin restrictions.
- `components/BroadcastTransport.tsx`: explicit publishing controls, session creation, media transport status, manual failure injection, republish and stop. Calls the existing `LiveStream` MediaStream without replacing Studio or other creator components.
- `components/LiveStream.tsx`: preview attachment corrected; preview is no longer mislabeled as broadcast live; emergency stop dispatches a transport stop event.
- `backend/server.cjs`: single-operator, bearer-protected local session ledger with bounded JSON bodies, fail-closed session transitions, validated client reports, atomic JSON persistence and static `dist/` serving. Original Node prototype is saved as inert text at `backend/legacy/server.js.txt` for provenance.
- `vite.config.ts`: private API keys are no longer embedded in the frontend; dev proxy to the ledger.
- `services/geminiService.ts` and `components/CoPilot.tsx`: AI UI waits for a secure server-side proxy instead of sending an API key from browser code. No fabricated topical-news fallback; moderation defers to manual review on failure.
- `package-lock.json`: 155 lockfile tarball URLs rewritten from inaccessible internal Artifactory to `registry.npmjs.org`. Package versions and integrity hashes retained.
- `Dockerfile`, `compose.yaml`, `.dockerignore`, `.env.example` and new npm scripts: reproducible-build definitions and explicit operator-token configuration.
- `backend/server.test.cjs`, `services/whipClient.test.mts`: tests added.

## Verification in this recovery session

- `node --test backend/server.test.cjs`: **2/2 passed**.
- `node --experimental-strip-types --test services/whipClient.test.mts`: **3/3 passed**.
- TypeScript parser over source `.ts` and `.tsx`: **passed**, no parse diagnostics.
- Offline `npm ci`: **failed** because `yallist@3.1.1` was not present in the offline cache.
- Online `npm ci` against the public registry: **timed out** in this environment; full `tsc`, Vite build, and Docker build remain **unverified**.
- No actual WHIP ingest server, media-server playback, cloud fan-out, or independent end-to-end recovery measurement was available for testing. Neither remote receipt nor consumer playback has been proven.

## Release gate

Do not describe the system as production live-streaming or automatic failover until the public-registry install, TypeScript type-check, Vite build, browser tests, authenticated media ingest, destination playback monitoring, and server-side recovery proof have passed. The current recovery ledger is specifically labeled **client-reported**, and its measured window only covers the times at which the server receives failure and recovery reports.
