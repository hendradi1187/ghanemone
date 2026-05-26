/**
 * Tailwind config untuk apps/admin (internal tools — user provisioning, audit log, ops).
 * Extends @ghanem/config tailwind-base preset (same design system as web).
 */
import type { Config } from 'tailwindcss';
import { tailwindBase } from '@ghanem/config/tailwind-base';

const config: Config = {
  presets: [tailwindBase],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,html}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Admin-specific overrides — kosong saat ini. Admin app intentionally
      // pakai design system identik dengan web untuk consistency cross-tool.
    },
  },
};

export default config;
