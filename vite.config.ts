import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. Android Fix
  base: './', 
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  // 2. MASTER KEY INJECTION (One key, everywhere)
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),
    'process.env.REACT_APP_GEMINI_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),
    'import.meta.env.VITE_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),
    'import.meta.env.GEMINI_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),
    'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),
  },
  
  server: {
    port: 3000,
    host: true
  }
})
