import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Base44 preview proxy reaches the dev server under the sandbox host name, which
// Vite's dev-server host check (Vite >= 5.4.12) rejects unless it is allowlisted.
// Only applied when the platform's preview flag is set to exactly "1"; otherwise the
// original configuration is used unchanged.
const previewAllowedHosts = [
  process.env.BASE44_SANDBOX_HOST_DOMAIN ? `.${process.env.BASE44_SANDBOX_HOST_DOMAIN}` : '',
  process.env.BASE44_PUBLIC_HOST_SUFFIX ? `3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}` : '',
].filter(Boolean);

export default defineConfig({
  plugins: [react()],
  server:
    process.env.BASE44_PREVIEW_MODE === '1' && previewAllowedHosts.length > 0
      ? { allowedHosts: previewAllowedHosts }
      : undefined,
});
