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
        studio: {
          950: '#090a0f',
          900: '#11131a',
          850: '#171923',
          800: '#1e212d',
          750: '#262938',
          700: '#2f3446',
          600: '#464c64',
          500: '#646c8a',
          accent: '#6366f1',
          'accent-hover': '#4f46e5',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
