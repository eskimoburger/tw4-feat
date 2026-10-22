import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' keeps every built asset URL relative, so `dist/` works from any
// folder or static host (hash routing means no server rewrites are needed).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
