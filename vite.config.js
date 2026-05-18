import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 每次构建生成唯一 hash，强制浏览器/CDN 加载最新文件
const BUILD_TIME = Date.now()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/inmyF/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${BUILD_TIME}-[hash].js`,
        chunkFileNames: `assets/[name]-${BUILD_TIME}-[hash].js`,
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          const info = name.split('.')
          const ext = info[info.length - 1] || ''
          if (/^(css|js)$/i.test(ext)) {
            return `assets/[name]-${BUILD_TIME}-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
      },
    },
  },
})
