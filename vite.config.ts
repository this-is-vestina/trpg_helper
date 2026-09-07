import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages 项目页 base 路径
  // - 本地 dev / build 默认 '/'，方便 vite preview
  // - CI 环境通过 VITE_BASE 环境变量覆盖为 '/trpg_helper/'
  base: process.env.VITE_BASE ?? '/',
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
}))