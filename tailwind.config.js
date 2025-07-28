const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af', // dark blue used for headings and buttons
          light: '#3b82f6',   // light blue for accents
        },
        secondary: {
          DEFAULT: '#06b6d4', // mint green
          light: '#67e8f9',   // lighter mint for hover states
        },
        neutral: {
          dark: '#0f172a',   // dark gray for text
          light: '#f8fafc',  // off-white for backgrounds
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};