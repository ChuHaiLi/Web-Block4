import { defineConfig } from 'vite';

// Dev/preview gọi cùng origin; Vite chuyển /api sang Express, không cần CORS.
const apiPort = process.env.API_PORT || 3004;
const proxy = { '/api': { target: 'http://127.0.0.1:' + apiPort } };

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  server: {
    port: 5173, strictPort: true, proxy,
    watch: { ignored: ['**/.tools/**', '**/docs/evidence/**', '**/data/students.json', '**/data/*.tmp'] },
  },
  preview: { port: 4173, strictPort: true, proxy },
});
