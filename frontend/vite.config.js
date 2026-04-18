import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const apiUrl = mode === 'production' 
    ? 'http://betza-api.onrender.com'
    : 'http://localhost:5000'
  
  return {
    server: {
     proxy: { 
       '/api': apiUrl
     }
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
