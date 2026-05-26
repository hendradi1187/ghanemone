/**
 * Tailwind config untuk @ghanem/ui Storybook canvas.
 *
 * Extends @ghanem/config tailwind-base (single-source-of-truth design tokens).
 * Content scan terbatas pada source ui + storybook config — apps consumer
 * memiliki tailwind.config sendiri yang juga men-scan packages/ui src.
 */
import type { Config } from 'tailwindcss';
import { tailwindBase } from '@ghanem/config/tailwind-base';

const config: Config = {
  presets: [tailwindBase],
  content: [
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Storybook-specific extensions ditempatkan di sini. Saat ini kosong;
      // semua override harus naik ke @ghanem/config supaya semua consumer
      // dapat manfaat.
    },
  },
};

export default config;
