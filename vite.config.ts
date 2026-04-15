import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/react', 'maplibre-gl'],
    exclude: ['rbush'],
  },
  server: {
    port: 5173,
  },
});
