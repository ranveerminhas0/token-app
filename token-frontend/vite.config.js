import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    historyApiFallback: true,
    middleware: [
      (req, res, next) => {
        // Redirect all non-API requests to index.html
        if (!req.url.includes('/api/') && !req.url.includes('/token')) {
          req.url = '/index.html';
        }
        next();
      }
    ]
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@rollup/rollup-win32-x64-msvc']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: ['@rollup/rollup-win32-x64-msvc']
    }
  }
})
