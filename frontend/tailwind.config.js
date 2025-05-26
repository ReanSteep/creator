/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'steam-dark': '#171a21',
        'steam-light': '#1b2838',
        'steam-blue': '#66c0f4',
      },
      backdropBlur: {
        'glass': 'blur(10px)',
      },
    },
  },
  plugins: [],
} 