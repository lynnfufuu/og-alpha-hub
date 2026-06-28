import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/og-alpha-hub/',
build: {
    outDir: 'docs', // <-- This tells Vite to use the docs folder
  },
})

