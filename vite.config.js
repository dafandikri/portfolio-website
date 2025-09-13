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
          // Core React - essential for initial render
          vendor: ['react', 'react-dom'],
          // Defer animations completely - load after LCP
          animations: ['framer-motion'],
          // Separate lazy-loaded components
          lazyComponents: ['./src/components/TechStackDialog', './src/components/SkillsetsDialog', './src/components/Experience', './src/components/Project', './src/components/Hobbies', './src/components/Contact']
        }
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // More aggressive compression to reduce unused JS
        dead_code: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      }
    },
    // Optimize assets - prioritize critical content
    assetsInlineLimit: 1024, // Keep small for faster LCP
    chunkSizeWarningLimit: 400, // Lower threshold to catch bloat
    // Enable CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'], // Don't pre-bundle framer-motion
    exclude: ['framer-motion'], // Exclude to reduce initial bundle
    // Force pre-bundling of critical dependencies only
    force: true
  },
  // Enable compression
  server: {
    compress: true
  }
})
