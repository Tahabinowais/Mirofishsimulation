import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [vue()],
  server: {
    port: 5173,
    fs: { allow: ['..'] },
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
