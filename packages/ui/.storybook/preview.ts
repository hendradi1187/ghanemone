/**
 * Storybook preview config — global decorators, parameters, fonts.
 *
 * Mirror runtime di apps/web/src/main.tsx:
 *   - Tailwind base + components + utilities (via ./preview.css)
 *   - @fontsource bundling (Inter, Inter Tight, JetBrains Mono — subset)
 *   - TooltipProvider di tree root (Radix Tooltip butuh provider context)
 *   - Toaster mounted untuk Toast.* stories
 *
 * a11y parameters: axe-core jalan otomatis di setiap story, semua rule WCAG
 * 2.1 AA aktif (lihat `axe.config` di bawah).
 */
import type { Preview } from '@storybook/react';
import { withThemeByClassName } from '@storybook/addon-themes';
import React from 'react';

// Tailwind CSS — di-load via PostCSS pipeline Vite.
import './preview.css';

// Font subsets — match apps/web/src/main.tsx import pattern.
// reason: hanya weight yang aktually dipakai di komponen (lihat tailwind-base.ts
// fontFamily mapping + heading defaults). Lebih banyak weight = bundle lebih besar.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/jetbrains-mono/400.css';

import { TooltipProvider } from '../src/overlay/Tooltip';
import { Toaster } from '../src/feedback/Toast';

/**
 * Global decorator — wrap setiap story dengan:
 *   1. TooltipProvider (Radix tooltip context, skip-delay shared)
 *   2. <Toaster /> mounted di root (Sonner queue) — supaya toast.* stories
 *      bisa fire toast tanpa setup tambahan.
 *
 * reason: dipakai React.createElement (bukan JSX) supaya file ini tetap `.ts`
 * (bukan `.tsx`) — sesuai konvensi Storybook official preview.
 */
const withGlobalProviders = (Story: React.ComponentType): React.ReactElement => {
  return React.createElement(
    TooltipProvider,
    { delayDuration: 300 },
    React.createElement(
      'div',
      { className: 'sb-canvas-root font-sans text-body text-ink' },
      React.createElement(Story),
      React.createElement(Toaster, {}),
    ),
  );
};

const preview: Preview = {
  parameters: {
    /**
     * Backgrounds menggunakan design tokens (lihat tailwind-base.ts §colors.surface).
     * 3 background memberi user kontras testing yang adekuat:
     *   - surface-bg: warm canvas (default app body)
     *   - surface: white (card / panel surface)
     *   - ink: near-black (toast / dialog overlay context)
     */
    backgrounds: {
      default: 'surface-bg',
      values: [
        { name: 'surface-bg', value: '#f7f5f0' },
        { name: 'surface', value: '#ffffff' },
        { name: 'ink', value: '#0e1726' },
      ],
    },

    /**
     * Viewports — match `screens` di tailwind-base.ts. Designer brief
     * mengindikasikan target mobile (375), tablet (768), desktop (1280),
     * desktop-lg (1440).
     */
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (375)',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280)',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        'desktop-lg': {
          name: 'Desktop LG (1440)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },

    /**
     * a11y addon — axe-core config. WCAG 2.1 AA + best-practices aktif.
     * `disableOtherRules: false` artinya kita TIDAK opt-out rule default;
     * setiap story di-evaluasi penuh.
     */
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          // reason: enable color-contrast secara eksplisit (default off di
          // beberapa env karena false-positive di canvas Storybook). Kita
          // ingin paksa kontras AA di setiap komponen.
          { id: 'color-contrast', enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      },
      manual: false,
    },

    /**
     * Controls — auto-detect color props via regex (e.g. `bg`, `borderColor`)
     * supaya Storybook render color picker, bukan text input.
     */
    controls: {
      matchers: {
        color: /(background|bg|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },

    layout: 'padded',

    docs: {
      toc: true,
    },
  },

  decorators: [
    withGlobalProviders,
    /**
     * Theme switcher — saat ini hanya 1 theme (light), tapi withThemeByClassName
     * dipasang sebagai future-proofing untuk dark mode di Phase 11+.
     */
    withThemeByClassName({
      themes: {
        light: '',
      },
      defaultTheme: 'light',
    }),
  ],

  tags: ['autodocs'],
};

export default preview;
