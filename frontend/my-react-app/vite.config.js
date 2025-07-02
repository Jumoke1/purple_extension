import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
   assetsInclude: ['**/*.JPG'],
  resolve: {
    extensions: ['.js','.jsx', '.json'] // Add this to help with imports
  }
})