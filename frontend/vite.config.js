import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Necesario para Docker
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
  },
  define: {
    // Definir variables de entorno para el build
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3000'),
  },
})
