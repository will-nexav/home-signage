import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // relative base so it works on GitHub Pages / any subpath host
  base: './',
  plugins: [react()],
})
