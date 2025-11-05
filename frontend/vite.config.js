import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Increase limit to avoid warnings (default is 500 KB)
    chunkSizeWarningLimit: 1000,

    // Optional: manual chunking to split large JS files for faster mobile loading
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['./src/lib/utils.js', './src/helpers'],
        },
      },
    },
  },
})
