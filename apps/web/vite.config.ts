import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vite config untuk Ghanem.one web app.
// Target: ES2022. Output static `dist/` yang akan di-serve oleh nginx pod di k3s.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 5173,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    outDir: 'dist',
    // Bundle analyzer dapat ditambahkan via rollup-plugin-visualizer di Phase 8.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          tanstack: ['@tanstack/react-query'],
          // Leaflet + react-leaflet bundled together — keep MapPage chunk lean.
          map: ['leaflet', 'react-leaflet'],
          charts: ['recharts'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    css: false,
  },
});
