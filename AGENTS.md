# Working notes for this repository

## What the app is

Pure frontend: Vite + React + TypeScript + Tailwind. There is **no backend, no API and no
database** — `src/data/base44.ts` persists all entities to the browser's `localStorage`.
The SQL/CSV files at the repo root (`amalgam_schema_postgres.sql`,
`amalgam_database_seed_combined.csv`, …) are reference data exports and are not read by the app.
No external service credentials are required.

## Running it (Base44 sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Everything runs in one service (`web`), a `node:22-slim` container with the repo bind-mounted at
`/app`, installing dependencies into a named `node_modules` volume and starting `vite` with
`--host 0.0.0.0 --port 3000`. Edits hot-reload; no rebuild needed for source changes.

## Non-obvious things

- Compose executes Vite directly with Node after dependency installation. An `npm run dev`
  wrapper reports normal Docker SIGTERM shutdowns as `npm error`; direct execution avoids
  that misleading noise and delivers signals to the actual dev server.

- **There is no lockfile in the repo**, so the startup command uses
  `npm install --no-package-lock` to avoid generating an untracked `package-lock.json` in the
  bind-mounted tree.
- **`vite.config.ts` extends `server.allowedHosts`** with the sandbox/preview host names — but
  only when `BASE44_PREVIEW_MODE === '1'` (otherwise the config is unchanged). Vite >= 5.4.12
  rejects requests whose `Host` header is not allowlisted, which blocks the preview proxy.
  The values come from `BASE44_SANDBOX_HOST_DOMAIN` / `BASE44_PUBLIC_HOST_SUFFIX`, passed through
  by compose.
- **`tsconfig.json` and three source files were syntactically broken** in the imported history
  (`tsconfig.json` had a duplicated `lib`/`include` key and a missing comma; `src/data/base44.ts`,
  `src/pages/ClipPipelinePage.tsx` and `src/pages/StreamPipelinePage.tsx` contained stale duplicate
  fragments concatenated onto the current code by a bad merge, which broke the dev server and left
  the page blank). They were repaired by restoring the last clean version from commit `5f22c6f`.

## Verifying

Run the project's own checks inside the container:

```bash
docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit
docker compose -f docker-compose.base44.yml exec -T web npm run lint
docker compose -f docker-compose.base44.yml exec -T web npm test
```

Then confirm the served page is live source (unhashed modules, `/@vite/client`) rather than a
prebuilt bundle:

```bash
curl -s http://localhost:3000/src/main.tsx | head
```
