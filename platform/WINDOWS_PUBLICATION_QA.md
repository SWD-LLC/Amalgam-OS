# Windows recovery QA, October 10, 2026

**Source:** extracted `Amalgam_Platform_Recovery_2026-10-10.zip` (45 original files) into an isolated GitHub recovery branch. **Project author:** Sierra N. Warren, Sierra Warren Developments, LLC.

## Passed on the owner's Windows development machine

- `node --test backend/server.test.cjs`: **2/2 tests passing**.
- `node --experimental-strip-types --test services/whipClient.test.mts`: **3/3 tests passing**.
- esbuild source syntax parsing using `platform/tsconfig.json`: **22/22 TypeScript/TSX/MTS source files pass**.
- ZIP entry-path inspection: **45 entries; no absolute paths or traversal entries**.
- Automated secret-name/value pattern scan: **no real token identified**; only environment-variable references and clearly labeled unit-test fixtures.

## Not yet verified

- `npm ci`, `npm run typecheck`, `npm run build` and browser interaction tests on this recovered source.
- WHIP handshake with a real media server, independently observed playback, ingestion fan-out, and end-to-end automatic failover.
- Production security, multi-creator authentication, cost, and deployment readiness.

## Repository and release boundaries

The older Creator OS application remains in the existing repository root. This source is added only under `platform/`. No credentials or runtime `.env` were added. The included `.env.example` is an instructional template. No claim of actual broadcast delivery or production reliability is made.

On case-insensitive Windows filesystems, the pre-existing repository paths `LICENSE` and `License/README.md` conflict; this clone shows an unstaged deletion of one of them depending on checkout order. Neither path is modified in the recovery commit. Both stay in the GitHub tree.
