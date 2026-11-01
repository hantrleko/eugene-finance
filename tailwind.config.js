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
        hub: {
          bg: '#080c15',
          panel: '#0e1524',
          card: '#121b2d',
          cardHover: '#172238',
          border: '#1e293f',
          borderHover: '#2e3e5d',
          gold: '#dfb26c',
          goldLight: '#ebd09e',
          goldDark: '#b88b42',
          teal: '#14b8a6',
          tealLight: '#5eead4',
          cyan: '#06b6d4',
          text: '#f1f5f9',
          muted: '#94a3b8',
          dim: '#64748b'
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        display: ['"Playfair Display"', '"Songti SC"', '"STSong"', 'serif']
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(223, 178, 108, 0.15)',
        'teal-glow': '0 0 25px -5px rgba(20, 184, 166, 0.15)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.45)'
      }
    },
  },
  plugins: [],
}
