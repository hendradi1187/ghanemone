// ESLint flat config untuk packages/types (shared TypeScript type definitions).
// Extends shared base preset dari @ghanem/config (tidak ada React karena pure types).
import baseConfig from '@ghanem/config/eslint-base';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['dist/**'],
  },
];
