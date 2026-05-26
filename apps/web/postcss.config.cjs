// PostCSS config — Tailwind + Autoprefixer (standard stack untuk Vite + React).
// CommonJS karena beberapa tooling masih membaca PostCSS config secara sync.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
