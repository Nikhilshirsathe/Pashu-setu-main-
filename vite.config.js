import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis'
  },
  esbuild: {
    target: 'es2020'
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    copyPublicDir: true
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: ['pashu-setu-bolte.onrender.com']
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  }
})