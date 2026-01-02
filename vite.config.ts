import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // CRITICAL: This ensures the app finds files on Android
  base: './', 
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  
  server: {
    port: 3000,
    host: true
  }
})
