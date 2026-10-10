# Codex working instructions for Amalgam

**Project author:** Sierra N. Warren  
**Organization:** Sierra Warren Developments, LLC  
**Canonical engineering repository:** `https://github.com/swd-dev00/Amalgam_OS`

Read `docs/CODEX_QA_HANDOFF.md` before modifying code. Treat it as the work order for the current QA/recovery task.

## Source boundaries

There are multiple Amalgam versions. Do not confuse or overwrite them.

- `swd-dev00/Amalgam_OS` at `main`: earlier editable Creator OS React/Vite source under `src/`.
- `swd-dev00/Amalgam_OS` at `recovery/amalgam-platform-2026-10-10`: all of the above plus the separately recovered Vite/React Platform in `platform/`; see draft PR #1.
- `swd-dev00/Amalgam-OS`: older compiled static Creator OS site, including 13 exported HTML pages and an archived JS bundle. Reference and QA target, **not** a complete editable source tree for the Platform.

Never assume the earlier `src/` application is the source used to build the exported static site without proving the match. Never treat the Platform app as an automatic replacement of either.

## Priorities

1. **Finish the actual Creator OS QA** in the existing Codex environment. Preserve and run `.amalgam-qa/explore.py`, `.amalgam-qa/targeted.py`, and `.amalgam-qa/fixtures.py` if they are present. Capture case-level outcomes, screenshots, console/network errors, and reproduction steps. Previous Codex work reported 280 real-export interaction cases and 170 isolated fixture cases; these are counts of attempted cases, not passes.
2. **Triage real defects:** persisted settings, disabled/inert Twitch Sync, random growth chart, zero-streamer Infinity recommendation, absent recording download, and broken retry/recovery flows. Include hardcoded Online / Recovery Core Active claims. Verify that the defect exists in the version being changed before editing.
3. **Fix verified defects in matching editable source**, on a dedicated branch from the correct base. If there is no matching source, document the limitation with evidence instead of patching minified output or claiming a fix. Prioritize the arithmetic safety problem, then settings and media-download handling.
4. **Validate the recovered Platform separately:** run `cd platform`, backend and WHIP tests, typecheck, Vite build, browser flows, media-server ingest, and observable playback as applicable. Do not claim any real ingest or recovery from mocked tests.

## Non-negotiable engineering conduct

- Do real implementation and verification. Do not spend the pass on more mockups or planning-only documentation.
- Do not ask again which Amalgam version to test; both versions have assigned scopes above.
- Preserve original Creator OS and Platform source. No destructive replacement, force push, branch merge, or public deployment without authorization.
- Never upload actual API keys or credentials, never place secrets in Vite's client bundle, and never initiate real platform broadcasts or paid actions in QA.
- Do not display fake live indicators, fabricated viewer counts or success statuses. Mock data and simulated transport results must be visibly labeled.
- Test using synthetic camera/mic where possible. A WHIP SDP 201 response or outbound RTP counter is not evidence of destination playback.
- Report **PASS / FAIL / BLOCKED / NOT APPLICABLE**, with exact version, command, evidence and why. Never call all attempted tests passed.
- Keep separate branches, commits, and QA reports for compiled-site issues versus the recovered Platform. Main is not to be merged with recovery until the owner explicitly approves.
- Keep user-authored intellectual work attributed to Sierra N. Warren / Sierra Warren Developments, LLC. No AI-generated boilerplate product claims.

## End-of-run format

Return the exact repository, branch, head SHA, files changed, tests run with numeric results, observed failures, unresolved blockers, and next runnable action. If the cloud environment is attached to the wrong repo, switch/clone the canonical repository before source repairs rather than assuming the compiled export has editable React source.
