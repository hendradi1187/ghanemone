import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vite config untuk Ghanem.one admin app.
// Port 5174 supaya tidak bentrok dengan web app (5173) saat dev parallel.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 5174,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    css: false,
  },
});
