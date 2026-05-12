import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // En dev, redirigeix /api/ollama → Ollama local
      '/api/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/ollama/, ''),
      },
    },
  },
})
