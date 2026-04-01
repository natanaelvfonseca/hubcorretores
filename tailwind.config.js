/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        surfaceHover: 'rgb(var(--color-surface-hover) / <alpha-value>)',
        sidebar: 'rgb(var(--color-sidebar) / <alpha-value>)',
        primary: {
          DEFAULT: '#0F7B8C',
          light: '#1AA0A4',
          dark: '#0A4B66',
        },
        accent: {
          DEFAULT: '#D8893C',
          soft: '#F7E6D2',
          dark: '#A66328',
        },
        marine: {
          DEFAULT: '#062133',
          deep: '#04131F',
          mist: '#E5F4F4',
        },
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Marcellus', 'serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0F7B8C 0%, #1AA0A4 52%, #0A4B66 100%)',
        'gradient-coast': 'linear-gradient(135deg, #062133 0%, #0B3A55 48%, #D8893C 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(15, 118, 110, 0.24)',
      },
      animation: {
        blob: "blob 7s infinite",
        "bounce-slow": "bounce 3s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [],
}
