/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-blue': '#3c50e0',
        'sidebar-bg': '#ffffff',
        'main-bg': '#f1f5f9',
        'card-border': '#e2e8f0',
      },
    },
  },
  plugins: [],
}
