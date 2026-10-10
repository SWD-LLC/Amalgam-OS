# Codex execution handoff: Amalgam Creator OS QA + Platform recovery

**Owner and author:** Sierra N. Warren, Sierra Warren Developments, LLC  
**Date:** October 10, 2026  
**Work order:** Finish the QA pass and fix evidenced defects in the right source. Do not start a redesign.

## 1. Repository mapping, verified

| Checkout | What it contains | What to do with it |
|---|---|---|
| `https://github.com/swd-dev00/Amalgam-OS`, `main` | Older compiled Creator OS export ZIP and static-site deployment resources, with a 13-page HTML app | Continue behavior testing; do not assume full editable React source |
| `https://github.com/SWD-LLC/Amalgam-OS`, `main` | Original React 18/Vite app under `src/` | Examine source for an exact correspondence to each compiled-export defect before fixing |
| `https://github.com/SWD-LLC/Amalgam-OS`, `recovery/amalgam-platform-2026-10-10` | Root Creator OS source plus a different React 19/Vite Platform under `platform/` and recovery reports | Test Platform independently; review existing draft PR #1 |

The user already specified: **Test the available Creator OS export**. Do not re-ask that question. The recovered Platform is an additional, separate engineering validation target.

## 2. Resume the exact existing QA run

Find/reuse `.amalgam-qa/explore.py`, `.amalgam-qa/targeted.py` and `.amalgam-qa/fixtures.py` from the current Codex cloud workspace, if they still exist. Do not silently discard their observations or rerun identical tests without a reason.

Previously reported (from the Codex conversation, subject to reviewing the actual test logs):
- 13 navigation destinations render in the exported site.
- 280 browser interaction cases were attempted against the **actual export**.
- 170 additional cases were attempted against **isolated API fixtures**.
- Base44-backed requests fail in the static export because its live backend is not locally present.
- Settings changes do not persist after navigating away.
- Twitch Sync is inactive.
- Some recovery actions are not implemented.
- The growth chart uses randomly generated values.
- A category with zero active streamers produces `Infinity` and an `Act immediately` recommendation.
- End-session offers no recording download.
- Hard-coded `Online` and `Recovery Core Active` indicators appear without health checks.
- Synthetic camera/mic worked in Chromium; a local recording generated WebM bytes.

These are **reported findings**. The 280+170 figures are case counts, not passing-case counts. Restore detailed machine-readable pass/fail logs and reproduce high-risk defects.

## 3. Required output artifacts

Produce:
- `qa/creator-os/control-matrix.csv` with fields `version,route,control,precondition,action,expected,actual,status,evidence`.
- `qa/creator-os/defects.md` with numbered issues, reproduction, affected build, likely source correspondence, severity, and proposed verified fix.
- `qa/creator-os/run-summary.md` with exact `passed, failed, blocked, skipped` counts separated for real export and fixture-only runs.
- Screenshot/video/trace artifacts when generated, with references in the matrix.

A passing navigation test is **not** a passing functionality test. Fixture-backed success is **not** production integration. Buttons that toast but do not perform the advertised action fail the functional acceptance test.

## 4. Defects and acceptance tests

### Category safety, highest priority

Given `activeStreamers=0`, blank input, negative values, non-finite values, or unsafely large inputs, the UI must not output Infinity/NaN or provide an urgent recommendation based on an undefined ratio. Require validation with actionable messaging; add unit and Playwright regression cases. For positive inputs, verify the selected formula against source definitions rather than inventing a new metric.

### Settings persistence

Change a setting, save it, navigate to another route, return, and reload. Verify that the value persists where persistence is promised. Distinguish local-only persistence from backend account sync. Check that Save Settings really writes state and that UI shows failure if a write fails.

### Recording download

With synthetic media devices, create a nonempty local WebM recording, end the recording, and verify a named Blob/download with correct MIME type and intact bytes. Distinguish stop-preview, stop-recording, and end-broadcast actions. Ensure cleanup releases tracks and object URLs.

### Twitch Sync / connectors

When no Twitch connection is configured, do not imply synchronization. Either wire a real authorized integration with permission and status checks or label and disable the action as unavailable. Never solicit or embed Twitch keys in source.

### Growth chart

Remove unsupported random data masquerading as measurements. Use actual available data with timestamps and provenance, or show an explanatory no-data state. Mark explicitly illustrative datasets as sample rather than live forecasts.

### Error recovery and status

Simulate failed backend responses, refused camera access, disconnected transport, and retry. Assert a visible actionable failure state. `Online`, `Live`, `Healthy`, `Recovery Core Active`, and other operational badges need matching measurable evidence or must be removed/qualified.

## 5. Match source before changing code

Inspect the root `src/` and compare exports, routes, and behavior with the static bundle. If a matching implementation is found, make a fix branch from `main`: `codex/creator-os-qa-fixes`. Do **not** change the recovered Platform to make a test for the older compiled export appear green. When only minified code exists for the failing control, provide a reproducible failing case and list it as blocked for source-level repair.

The project owner wants real functional progress. Complete at least one source-matched high-priority fix with a regression test before expanding to additional feature work, provided a matching source exists and the environment permits testing.

## 6. Recovered Platform validation, independent track

Start from the protected branch and do not overwrite `main`:

```bash
git clone https://github.com/SWD-LLC/Amalgam-OS.git
cd Amalgam-OS
git switch recovery/amalgam-platform-2026-10-10
cd platform
node --test backend/server.test.cjs
node --experimental-strip-types --test services/whipClient.test.mts
npm ci --registry=https://registry.npmjs.org/
npm run typecheck
npm run build
```

If `npm ci` fails, capture npm/Node versions, exact error, effective registry, lockfile URLs and dependency resolution. Do not say the build passed. Run independent, dependency-free tests anyway.

**Earlier Windows results:** backend 2/2 pass; WHIP 3/3 pass; esbuild parsing 22/22 TypeScript/TSX/MTS files passes with the `platform/tsconfig.json` selected. Actual WHIP media-server receiving/playback and full production build remain unverified.

Report Platform results in `platform/qa/`, not in the older-export control matrix. The mock WHIP tests verify client state handling only, not playback. No real broadcast or external account modification without permission.

## 7. Integrity and author credit

Project by Sierra N. Warren, Sierra Warren Developments, LLC. Preserve existing histories, copyright/license files, application features, and separate research projects. No force pushes, automatic merge of PR #1, secret files, fake metrics, or premature production status. If Codex is running in a cloud environment for `swd-dev00/Amalgam-OS`, its environment setup must be retargeted to `SWD-LLC/Amalgam-OS` for editable source work. A checkout of the protected recovery branch is needed for the Platform tests.

## 8. Final handoff, no generic progress update

Report:
1. Exact repo, branch, commit SHA, and which version each test covered.
2. Numeric outcomes for real-export tests and fixture tests **separately**.
3. Changed source paths and tests for each verified fix.
4. Unresolved defects and external services blocking them.
5. Commands to reproduce and the next executable engineering action.
