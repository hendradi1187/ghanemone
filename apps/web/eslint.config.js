// ESLint flat config untuk apps/web (React 18 + Vite + TypeScript).
// Extends shared React preset dari @ghanem/config.
import reactConfig from '@ghanem/config/eslint-react';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
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
    // Mocks boleh pakai `any` — data shape belum definitive sampai API Phase 9 selesai.
    files: ['src/mocks/**/*.ts', 'src/mocks/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'storybook-static/**', 'postcss.config.cjs'],
  },
];
