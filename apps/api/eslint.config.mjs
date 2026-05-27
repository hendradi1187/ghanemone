// ESLint flat config untuk apps/api (NestJS + TypeScript).
// Pakai ekstensi .mjs karena apps/api adalah CommonJS package (NestJS default).
// Extends shared base preset dari @ghanem/config.
import baseConfig from '@ghanem/config/eslint-base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    // Aktifkan typed linting — butuh tsconfig.json di root app ini.
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['dist/**', 'coverage/**'],
  },
];
