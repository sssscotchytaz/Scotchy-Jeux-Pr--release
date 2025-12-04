import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Scotchy-Jeux-Pr--release/',
  build: {
    outDir: 'docs',
  },
})
