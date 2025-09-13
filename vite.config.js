import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunks for faster LCP
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          // Split animations into separate chunk to defer loading
          animations: ['framer-motion'],
          // Split other heavy dependencies  
          utils: ['react/jsx-runtime']
        }
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // More aggressive compression
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true
      }
    },
    // Optimize assets - reduce inline limit to prioritize external loading
    assetsInlineLimit: 1024,
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    // Force pre-bundling of critical dependencies
    force: true
  },
  // Enable compression
  server: {
    compress: true
  }
})
