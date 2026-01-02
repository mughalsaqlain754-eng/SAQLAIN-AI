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

  // 2. INJECTING ALL 6 API KEYS
  // I have cleaned the invisible characters from your keys.
  define: {
    // MAIN ENGINE (Active Key)
    'process.env.GEMINI_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify("AIzaSyDsWqaqeyFFdAs6rXA8xOBZpwh_uhc4ZXU"),

    // BACKUP ENGINES (Stored for availability)
    'process.env.GEMINI_API_KEY_2': JSON.stringify("AIzaSyDBdShSHEOJwV5-fAn5ABJLfKG3RLffoUo"),
    'process.env.GEMINI_API_KEY_3': JSON.stringify("AIzaSyByhPkTsT2_zczOGGnHVJ2lLAhv14MNNxk"),
    'process.env.GEMINI_API_KEY_4': JSON.stringify("AIzaSyDLlrOBRykDoeIF7YUBsMf1G_rOAK2n53c"),
    'process.env.GEMINI_API_KEY_5': JSON.stringify("AIzaSyDbDzk2zEbJpDzLkyPC4a_z9WfMDfuYje0"),
    'process.env.GEMINI_API_KEY_6': JSON.stringify("AIzaSyAWfQ9NCe1x5BDR6MDu-tQYoTauqKbMljU"),
  },
  
  server: {
    port: 3000,
    host: true
  }
})
