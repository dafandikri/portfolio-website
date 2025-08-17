import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunks for better caching and loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          vendor: ['react', 'react-dom'],
          // Isolate heavy animation library
          animations: ['framer-motion'],
          // Group utility libraries
          utils: ['motion-dom']
        },
        // Optimize chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // External dependencies to reduce bundle size
      external: (id) => {
        // Keep jQuery and Bootstrap external since they're loaded via CDN
        return id.includes('jquery') || id.includes('bootstrap')
      }
    },
    // Enable aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    // Optimize assets
    assetsInlineLimit: 2048, // Reduced to avoid large inline assets
    chunkSizeWarningLimit: 500, // More aggressive chunk size limit
    // Enable source maps only for production debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['framer-motion'] // Let it be chunked separately
  },
  // Enable compression and caching
  server: {
    compress: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  // Performance optimizations
  esbuild: {
    // Remove unnecessary code
    drop: ['console', 'debugger'],
    // Optimize for modern browsers
    target: 'es2020'
  }
})
