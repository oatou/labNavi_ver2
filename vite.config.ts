import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/labNavi_ver2/', // GitHub Pages base path (must match repo name)
  server: {
    host: true, // Listen on all local IPs
  },
})
