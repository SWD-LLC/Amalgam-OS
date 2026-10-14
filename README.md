# Amalgam Streaming Platform

PulseStream (Amalgam) is a next-generation live streaming creator operating system designed as resilient creator infrastructure: a unified system for streaming, production, interaction, growth, and collaboration.

## Ownership

PulseStream (Amalgam) is owned and developed by:

**Sierra N. Warren**  
**Sierra Warren Developments, LLC**

All core intellectual property, infrastructure design, and system architecture are attributed to Sierra Warren Developments, LLC.

## Creator OS Prototype (React + TypeScript + Tailwind)

This repository now includes a Creator-first dashboard prototype implementing the core flows:

- Dashboard command center with explicit connection/readiness states and a direct entry into Creator Studio.
- Stage-first Creator Studio with local camera/microphone preview, browser recording, downloadable local media, lower-third controls, solo/split layouts, and operational side panels inspired by modern production studios without copying their branding.
- Stream Pipeline lifecycle stages (`Idea → Recording → Editing → Published`) and platform targets (Twitch, YouTube, Kick, TikTok).
- Clip Pipeline workflow with posting state, ROI-oriented metrics, and diagnostics.
- Structured content-ops tables for pillar experiments, distribution states, short blueprints, timeline sections, and retention diagnostics.
- Clip pipeline has been split into feature modules (data hook + table components) to improve maintainability/debugging.
- Growth System tracking all six growth levers and weekly progress notes.
- Category Arbitrage calculations with viewer/streamer ratio and tier verdicting.
- Raid Network roster and reciprocity history view.
- AI Bestie panel with tone selector (`Hype`, `Sassy`, `Chill`, `Dramatic`, `Pro`) and saved scripts library.
- Architecture status page with Shadow Mode / Safe Mode / Modular Engine health and pre-flight checklist.
- Settings for Starter vs Pro mode, Safe Mode Live, Shadow Mode, and target platform devices.

### Integration boundary

Creator Studio currently verifies local browser capture and recording only. Platform chat, OAuth, external broadcast destinations, ingest confirmation, and remote guest transport remain unavailable until real services are connected. The interface does not fabricate live audience, bitrate, upload, or connection states.

### Data persistence

The app uses a lightweight **Base44-style entity layer** in `src/data/base44.ts` that persists entities to `localStorage` and includes malformed localStorage recovery + one-click seed reset support for entities:

- `StreamProject`
- `Clip`
- `RaidPartner`
- `Script`
- `GrowthEntry`
- `CategoryEntry`

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run test
```

## License

This project is licensed under the Apache License 2.0.

Copyright (c) 2026 Sierra N. Warren  
Sierra Warren Developments, LLC

See [LICENSE](./LICENSE) for full details.
