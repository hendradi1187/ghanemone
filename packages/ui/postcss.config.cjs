// PostCSS config untuk Storybook builder.
// Mirror apps/web/postcss.config.cjs supaya pipeline CSS identik.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
