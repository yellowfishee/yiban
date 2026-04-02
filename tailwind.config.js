/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        bg: 'var(--color-bg)',
      },
      fontFamily: {
        'serif': ['Noto Serif SC', 'serif'],
        'sans': ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
