import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/patient/login': { target: 'http://localhost:3001', changeOrigin: true },
      '/patient/logout': { target: 'http://localhost:3001', changeOrigin: true },
      '/patient/register': { target: 'http://localhost:3001', changeOrigin: true },
      '/patient/api': { target: 'http://localhost:3001', changeOrigin: true },
      '^/patient/book$': { target: 'http://localhost:3001', changeOrigin: true },
      '/patient/pay': { target: 'http://localhost:3001', changeOrigin: true },
      '/patient/cancel-appointment': { target: 'http://localhost:3001', changeOrigin: true },
      '/patient/reschedule-appointment': { target: 'http://localhost:3001', changeOrigin: true },
      '^/patient/update-profile$': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/employee': { target: 'http://localhost:3001', changeOrigin: true },
    }
  }
})