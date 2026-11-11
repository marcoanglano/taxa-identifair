// vite.config.js

// ##### IMPORTS #####
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// ##### Vite Project Configuration #####
// Sets up React plugin support and configures dev server host bindings for local network preview.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // equivalent to 0.0.0.0
  },
})
