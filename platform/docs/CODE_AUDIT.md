# Amalgam Platform — Individual Code File Audit

Scope note: I could not clone `https://github.com/Sierra-Warren-Developments-LLC/Amalgam_Platform.git` from the sandbox because GitHub DNS resolution failed in this environment. This audit is based on the available uploaded project archives and the provided Base44 `GoLive.jsx` rewrite file.

## Build status

- `npm install` completed against the available Vite/React package.
- `npm run build` completed successfully.
- Vite reported one missing `/index.css` reference from `index.html`; this does not block the build, but it should be cleaned later.
- Vite reported a large bundle warning; this is expected because all feature modules are bundled into one chunk.

## Root files

### `package.json`

Role: Defines the Vite + React application.

Findings:
- Uses React 19 and Vite 6.
- Scripts are minimal: `dev`, `build`, `preview`.
- No lint, test, or typecheck script exists.

Recommended update:
- Add `typecheck` and `lint` later.
- Keep dependencies minimal until the live engine is stable.

### `vite.config.ts`

Role: Vite configuration.

Findings:
- Defines `process.env.API_KEY` and `process.env.GEMINI_API_KEY` from `GEMINI_API_KEY`.
- Uses alias `@` to project root.
- Dev server uses port `3000`, which conflicts with the backend prototype if both run locally.

Recommended update:
- Move frontend dev server to `5173` or backend to `3001`.
- Add `VITE_API_BASE_URL` support for backend integration.

### `tsconfig.json`

Role: TypeScript configuration.

Findings:
- Build currently succeeds.
- Type strictness should be increased gradually, not during the live-state fix.

Recommended update:
- Add stricter checks after routing and backend integration stabilize.

### `index.html`

Role: App shell.

Findings:
- References `/index.css`, which was not present at build time.
- Build does not fail, but runtime styling may be inconsistent if CSS is expected.

Recommended update:
- Either add `index.css` or remove the stale reference.

### `index.tsx`

Role: React entry point.

Findings:
- Clean root mounting logic.
- Throws if root is missing, which is appropriate.

Recommended update:
- No urgent change.

### `metadata.json`

Role: App metadata.

Findings:
- Stable.

Recommended update:
- Update metadata after final branding decisions.

### `.env.local`

Role: Local environment file.

Findings:
- Should not be committed with secrets.

Recommended update:
- Use `.env.example` for committed configuration.
- Keep `.env.local` ignored.

### `.gitignore`

Role: Ignore rules.

Findings:
- Should include `node_modules`, `dist`, `.env.local`, and backend runtime data.

Recommended update:
- Add `backend/data/` once backend persistence is active.

## Application files

### `App.tsx`

Role: Main layout and view switcher.

Findings:
- Uses internal enum-based view switching instead of router-based navigation.
- Demo chat generator injects simulated messages every 15 seconds.
- Navigation is clean but does not yet expose the newer `/go-live` route from Base44.

Recommended update:
- Keep existing views stable.
- Add route-aware Go Live integration only after current Base44 code is exported.
- Label demo chat as simulated.

### `types.ts`

Role: Shared domain types.

Findings:
- Defines message, stream, platform, clip, and stats types.
- Does not include current `StreamSession`, backend status, PayPal, Google SSO, or recovery types.

Recommended update:
- Add backend-aware types after the current Base44 source is exported.
- Keep `StreamSession` separate from legacy `StreamData`.

## Component files

### `components/Studio.tsx`

Role: Main studio wrapper.

Findings:
- Composes several major modules.
- Good as a legacy command center.

Recommended update:
- Keep as legacy Studio view.
- Do not merge it with `GoLive.jsx`; keep Go Live as its own route/page.

### `components/LiveStream.tsx`

Role: Legacy simulated livestream surface.

Findings:
- Large component.
- Contains platform, stream, and demo logic that should be separated later.
- Does not appear to be the same as the newer Base44 `GoLive.jsx` engine.

Recommended update:
- Treat as legacy livestream module.
- Avoid using it as the source of truth for production Go Live state.

### `components/Chat.tsx`

Role: Chat UI and AI moderation trigger.

Findings:
- Calls `moderateMessage` on sent messages.
- Has quota cooldown handling.
- Chat is currently simulated/local, not platform-connected.

Recommended update:
- Label as local/simulated chat unless OAuth chat integrations exist.
- Keep quota cooldown.

### `components/Dashboard.tsx`

Role: Creator dashboard.

Findings:
- Should remain creator-facing.
- Must not become backend API documentation.

Recommended update:
- Keep Dashboard clean.
- Move backend status to Settings > Developer/API Health.

### `components/ClipVault.tsx`

Role: Clip suggestion and clip asset display.

Findings:
- Lightweight and focused.
- Depends on `ClipSuggestion` types.

Recommended update:
- Later connect clip markers from Go Live to this view.

### `components/StreamDeck.tsx`

Role: Stream-board style controls.

Findings:
- Good product direction.
- Should eventually control real session state.

Recommended update:
- Wire buttons into `StreamSession` state instead of cosmetic actions.
- Add disabled states based on camera/mic/session status.

### `components/StreamRelay.tsx`

Role: Platform relay UI.

Findings:
- Appears placeholder-oriented.
- External platform streaming requires backend ingest/restream.

Recommended update:
- Keep honest labels.
- Do not show Twitch/YouTube/Kick as live until backend ingest exists.

### `components/Soundboard.tsx`

Role: Audio/sound effect controls.

Findings:
- UI component only.
- Should be disabled during unavailable audio state.

Recommended update:
- Gate with mic/session state later.

### `components/CoPilot.tsx`

Role: AI co-producer / assistant surface.

Findings:
- Valuable feature.
- Should not trigger public actions automatically.

Recommended update:
- Keep AI suggestions assistive only.
- Add explicit approval for stream actions.

### `components/TalkingPoints.tsx`

Role: AI talking point generation.

Findings:
- Uses external AI service.
- Includes cooldown logic.

Recommended update:
- Keep quota handling.
- Add backend proxy later if API key should be protected.

### `components/VisionEngine.tsx`

Role: Visual scan / hype analysis module.

Findings:
- Uses a canvas mock frame, not actual camera frames.
- Quota cooldown is handled.

Recommended update:
- Label as simulated unless connected to live camera frames.
- Avoid polling too aggressively.

### `components/VideoForge.tsx`

Role: Video generation feature.

Findings:
- Uses `window.aistudio` APIs with `@ts-ignore`.
- This is environment-specific and will fail outside that environment.

Recommended update:
- Add capability detection before calling `window.aistudio`.
- Show a clear unavailable state outside AI Studio.

### `components/DemoControls.tsx`

Role: Demo state control panel.

Findings:
- Useful for testing.

Recommended update:
- Make demo/simulation labels clear.

### `components/OtherViews.tsx`

Role: Bundles Discovery, Marketplace, Wallet, Governance.

Findings:
- Very large file.
- Multiple unrelated views are combined.

Recommended update:
- Split into individual files later.
- Avoid changing during Go Live state fix.

## Service files

### `services/geminiService.ts`

Role: AI service wrapper.

Findings:
- Handles quota detection.
- Directly uses frontend API key exposure through `process.env.API_KEY`.
- Includes video, talking points, moderation, and visual analysis in one service.

Recommended update:
- Eventually proxy AI calls through backend for key protection.
- Split service by feature later.

## Base44 provided file

### `base44/GoLive.current.jsx`

Role: Current Base44 Go Live file provided by user.

Findings:
- Real camera/mic hook is used.
- `StreamSession` state exists.
- Local recording exists.
- Recovery state exists.
- Bug: rehearsal branch renders the same block as live.
- Bug: `startLocalOnly()` sets `status: LIVE`, creating fake live state.

Update applied:
- Added explicit `isRehearsal`, `isGoingLive`, `isEnded`, `isRecovery`, and device booleans.
- Timer now runs during live, rehearsal, going live, and local recording.
- Added `stopRehearsal()`.
- `startLocalOnly()` now uses `REHEARSAL` with `recordLocally: true`.
- Rehearsal and Live control blocks are separated.
- `End Live Stream` is live-only.
- `Stop Rehearsal` appears during rehearsal/local recording.

### `base44/GoLive.patched.jsx`

Role: Patched version of the provided Go Live file.

Status:
- Ready to paste into the Base44 code editor as a replacement for the current Go Live page.

### `base44/patches/GoLive.state-gating.patch`

Role: Unified diff from current Go Live file to patched Go Live file.

Status:
- Ready for manual review or `git apply` once the true repository source is available.

## Backend files

### `backend/server.js`

Role: Prototype backend service.

Findings:
- Uses Node built-ins only.
- Provides basic health, user, session, Google stub, and PayPal stub routes.
- This is not a production backend.

Recommended update:
- Replace JSON file storage with a real database before production.
- Implement OAuth and PayPal server-side verification before monetization goes live.

### `backend/config.example.json`

Role: Backend config template.

Findings:
- Includes Google and PayPal placeholders.

Recommended update:
- Use environment variables for deployment.
- Never commit real credentials.

### `backend/README.md`

Role: Backend usage guide.

Findings:
- Clear prototype documentation.

Recommended update:
- Keep as developer documentation, not frontend Dashboard content.
