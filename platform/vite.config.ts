import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Never embed GEMINI_API_KEY or other server credentials in a browser bundle.
// Existing AI-only browser paths stay disabled until server-side proxy routes exist.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: { '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false } },
  },
  define: {
    'process.env.API_KEY': JSON.stringify(''),
    'process.env.GEMINI_API_KEY': JSON.stringify(''),
  },
  resolve: { alias: { '@': path.resolve(process.cwd(), '.') } },
});
