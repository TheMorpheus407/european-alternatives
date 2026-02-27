import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy target — override via VITE_API_URL env var for local testing.
// Default points at production since no local PHP server is expected.
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://european-alternatives.cloud',
        changeOrigin: true,
      },
    },
  },
})
