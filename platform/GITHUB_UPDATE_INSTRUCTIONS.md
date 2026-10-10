# GitHub Update Instructions

Repository target:

```bash
git@github.com:Sierra-Warren-Developments-LLC/Amalgam_Platform.git
```

or

```bash
https://github.com/Sierra-Warren-Developments-LLC/Amalgam_Platform.git
```

## Important limitation

The sandbox could not clone or push to GitHub because `github.com` could not be resolved from this runtime. That means this package is prepared as a GitHub-ready update bundle, but it has not been pushed remotely from here.

## What is included

- `docs/CODE_AUDIT.md` — individual file-by-file analysis.
- `base44/GoLive.current.jsx` — current Go Live code provided by user.
- `base44/GoLive.patched.jsx` — corrected Go Live file.
- `base44/patches/GoLive.state-gating.patch` — unified diff patch.
- `backend/` — Node backend prototype scaffold.
- `.env.example` — frontend/backend environment template.

## Recommended manual push flow

```bash
git clone https://github.com/Sierra-Warren-Developments-LLC/Amalgam_Platform.git
cd Amalgam_Platform

git checkout -b fix/go-live-state-gating-backend-scaffold

# Copy files from this package into the repo.
# Replace or merge as appropriate.

cp -R /path/to/Amalgam_Platform_ready/docs .
cp -R /path/to/Amalgam_Platform_ready/backend .
cp -R /path/to/Amalgam_Platform_ready/base44 .
cp /path/to/Amalgam_Platform_ready/.env.example .

# If the true Base44 source contains src/pages/GoLive.jsx,
# apply the patch from the repository root or replace manually.

git apply base44/patches/GoLive.state-gating.patch || true

npm install
npm run build

git add .
git commit -m "Fix Go Live state gating and add backend scaffold"
git push -u origin fix/go-live-state-gating-backend-scaffold
```

## If `git apply` fails

The patch can fail if the repository file path or exact file content differs. In that case:

1. Open the actual Go Live file.
2. Compare it with `base44/GoLive.patched.jsx`.
3. Manually apply the same state-gating changes.
4. Confirm Rehearsal no longer displays `End Live Stream`.

## Test checklist

After applying changes:

1. Open `/go-live`.
2. Confirm session starts offline or rehearsal, not fake live.
3. Confirm `End Live Stream` is hidden during rehearsal.
4. Click `Connect Camera + Mic`.
5. Confirm browser permission prompt appears.
6. Confirm camera preview and mic meter work.
7. Start Rehearsal.
8. Confirm `Stop Rehearsal` appears.
9. Start Record Locally.
10. Confirm local recording does not set fake Live state.
11. Start Live only after checklist passes.
12. Confirm `End Live Stream` appears only during Live, Live with Warnings, or Reconnecting.
