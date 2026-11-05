/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          darkest: '#071426',
          dark: '#0D1B2A',
          card: '#13263A',
          border: '#1E3A56',
          hover: '#19344E',
          cyan: '#00D4FF',
          green: '#35D07F',
          text: '#FFFFFF',
          muted: '#9BAEC2',
          red: '#FF4D4D',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
