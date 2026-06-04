import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

/**
 * Modern Vite Configuration optimized for Production.
 * Implements Code Splitting (Manual Chunks) to reduce main bundle size.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'ingetin-icon.png'],
      manifest: {
        name: 'Ingetin - WhatsApp Reminder',
        short_name: 'Ingetin',
        description: 'Asisten Pengingat WhatsApp Cerdas',
        theme_color: '#00a884',
        background_color: '#efeae2',
        icons: [
          {
            src: 'ingetin-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'ingetin-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
