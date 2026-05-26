/**
 * Storybook main config — @ghanem/ui (Phase 8 Foundation).
 *
 * NOTE: File extension `.cjs` (CommonJS) digunakan karena root + package.json
 * pakai `"type": "module"` yang membuat Node 22 mencoba load .ts file sebagai
 * ESM lewat esbuild-register, tetapi register emits CJS dengan `require()` →
 * crash "require is not defined". `.cjs` ekstensi menghindari masalah ini.
 * TypeScript typing tetap via JSDoc + `@type` annotation.
 *
 * Builder: `@storybook/react-vite` (Storybook 8). Vite cold-start jauh lebih
 * cepat daripada Webpack 5 builder, dan memungkinkan re-use plugin Vite yang
 * sama dengan apps/web (lihat `viteFinal`).
 *
 * Stories glob: co-located dengan komponennya di `../src/**`. Pattern
 * `*.stories.tsx` mengikuti konvensi Storybook 8 — story file di samping
 * source component supaya proximity tinggi.
 *
 * Addons:
 *   - addon-essentials → controls, actions, viewport, backgrounds, docs, toolbars
 *   - addon-a11y      → axe-core panel + violation reporting (WCAG 2.1 AA)
 *   - addon-interactions → step-debugger untuk Storybook test (play() fn)
 *   - addon-themes    → toolbar untuk switch background (surface vs surface-bg vs ink)
 */

const path = require('node:path');

/** @type {import('@storybook/react-vite').StorybookConfig} */
const config = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
    '@storybook/addon-themes',
  ],

  /**
   * Vite config hook — extend default Vite config Storybook generate.
   *
   * Kebutuhan utama:
   *   1. Resolve alias `@ghanem/config` supaya Tailwind preset bisa di-import.
   *   2. Resolve alias `@ghanem/ui` supaya story file dapat import via barrel.
   *   3. Pastikan PostCSS Tailwind diaktifkan untuk `preview.css`.
   */
  viteFinal: async (viteConfig) => {
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias ?? {}),
      '@ghanem/config': path.resolve(__dirname, '../../config'),
      '@ghanem/ui': path.resolve(__dirname, '../src'),
    };

    viteConfig.css = viteConfig.css ?? {};
    viteConfig.css.postcss = path.resolve(__dirname, '..');

    return viteConfig;
  },

  /**
   * react-docgen-typescript memberikan dokumentasi prop yang lebih kaya
   * (description dari JSDoc komentar) dibanding `react-docgen` default.
   */
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Skip props dari node_modules supaya panel "Controls" tidak banjir
      // prop bawaan React/HTMLAttributes (puluhan ribu union members).
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },

  docs: {
    autodocs: 'tag',
  },
};

module.exports = config;
