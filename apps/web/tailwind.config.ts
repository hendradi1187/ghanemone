/**
 * Tailwind config untuk apps/web (user-facing).
 * Extends @ghanem/config tailwind-base preset (design tokens single-source-of-truth).
 */
import type { Config } from 'tailwindcss';
import { tailwindBase } from '@ghanem/config/tailwind-base';

const config: Config = {
  presets: [tailwindBase],
  // Scan source files dari apps/web src + packages/ui src supaya komponen shared di-pickup.
  content: [
    './index.html',
    './src/**/*.{ts,tsx,html}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // App-specific overrides — kosong saat ini. Tambah di sini jika web punya
      // surface/density yang berbeda dari admin (misal hero typography variant).
    },
  },
};

export default config;
