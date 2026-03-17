import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://payifreshbackend-production.up.railway.app/', // Cambia esto por tu URL del backend
        changeOrigin: true
      }
    }
  }
})