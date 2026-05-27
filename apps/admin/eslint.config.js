// ESLint flat config untuk apps/admin (React 18 + Vite + TypeScript).
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
    ignores: ['dist/**', 'coverage/**'],
  },
];
