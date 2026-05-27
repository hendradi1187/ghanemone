// ESLint flat config untuk packages/ui (shared React component library).
// Extends shared React preset dari @ghanem/config.
import reactConfig from '@ghanem/config/eslint-react';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactConfig,
  {
    // Aktifkan typed linting — butuh tsconfig.json di root package ini.
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'storybook-static/**'],
  },
];
