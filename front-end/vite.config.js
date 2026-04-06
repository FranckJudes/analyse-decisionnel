import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bpmn': {
        target: 'http://localhost:8200',
        changeOrigin: true,
      },
    },
  },
})
