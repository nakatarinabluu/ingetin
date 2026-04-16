import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Modern Vite Configuration optimized for Production.
 * Implements Code Splitting (Manual Chunks) to reduce main bundle size.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ingetin/types': path.resolve(__dirname, '../../../packages/types/src/index.ts')
    }
  },
  build: {
    rollupOptions: {
      output: {
        // DIET PLAN: Group heavy libraries into their own files
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'sonner'],
          'vendor-charts': ['recharts'],
          'vendor-query': ['@tanstack/react-query'],
        }
      }
    },
    chunkSizeWarningLimit: 600, // Slightly higher to account for shared logic
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
