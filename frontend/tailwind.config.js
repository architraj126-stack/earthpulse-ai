/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          bg: 'var(--bg)',
          panel: 'var(--panel)',
          card: 'var(--card)',
          subtle: 'var(--card-subtle)',
          border: 'var(--border)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          accent: 'var(--accent)',
          accentFg: 'var(--accent-fg)',
          warm: 'var(--warm)',
          cool: 'var(--cool)',
          sig: 'var(--sig)',
          warn: 'var(--warn)',
          changepoint: 'var(--changepoint)',
          neutral: 'var(--neutral-cell)',
          sea: 'var(--sea)'
        }
      },
      borderRadius: {
        card: '14px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
};
