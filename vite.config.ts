import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// GitHub Pages 项目页 base 路径：
// - 本地 dev / build 默认 '/'，方便 vite preview
// - CI 环境通过 VITE_BASE 环境变量覆盖为 '/trpg_helper/'
// 顶层读取确保 process.env 在 vite.config 加载阶段就生效
const VITE_BASE = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base: VITE_BASE,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
})