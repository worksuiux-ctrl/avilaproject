import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.NODE_ENV === 'development' ? '/' : '/prototipotesting2026/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@components', replacement: resolve(__dirname, 'src/components') },
      { find: '@data', replacement: resolve(__dirname, 'src/data') },
      { find: '@stores', replacement: resolve(__dirname, 'src/stores') },
      { find: '@services', replacement: resolve(__dirname, 'src/services') },
      { find: '@integrations', replacement: resolve(__dirname, 'src/integrations') },
    ],
  },
})
