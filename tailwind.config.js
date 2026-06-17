/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#e6f7f3',
          100: '#b3ebe0',
          200: '#80dfcd',
          300: '#4dd3b9',
          400: '#1ac7a6',
          500: '#00d4aa',
          600: '#00b38f',
          700: '#009977',
          800: '#008066',
          900: '#006655',
        },
        industrial: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        dark: {
          50: '#e8eaed',
          100: '#cfd3d9',
          200: '#a4abb5',
          300: '#7a8391',
          400: '#4f5b6d',
          500: '#364155',
          600: '#243144',
          700: '#1a2733',
          800: '#0f1923',
          900: '#0a0f16',
        },
        alarm: {
          warning: '#ffa726',
          danger: '#ff4757',
          success: '#2ed573',
        }
      },
      fontFamily: {
        display: ['"Orbitron"', '"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Inter"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 212, 170, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 212, 170, 0.25)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s linear infinite',
      },
      keyframes: {
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        }
      }
    },
  },
  plugins: [],
};
