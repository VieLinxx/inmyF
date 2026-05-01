/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主色调
        deepBlue: '#1a3a5c',
        twilightPurple: '#5b3a7a',
        warmGold: '#ffd700',
        creamWhite: '#FFF8E7',
        coral: '#ff7f7f',
        // 登录页专用
        grayBlue: '#7a9eb1',
        // 辅助色
        lightGray: '#f5f5f5',
        borderGray: '#dbdbdb',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        'mobile': '430px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
