import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 每次构建生成唯一 hash，强制浏览器/CDN 加载最新文件
const BUILD_TIME = Date.now()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 注入构建时间到 index.html，确保 HTML 内容每次变化，触发 CDN 刷新
    {
      name: 'inject-build-time',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          `  <meta name="build-time" content="${BUILD_TIME}">\n  </head>`
        )
      },
    },
  ],
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
