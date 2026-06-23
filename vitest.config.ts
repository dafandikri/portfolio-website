import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/data/**/*.ts',
        'src/components/Project.tsx',
        'src/components/Experience.tsx',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        // Branch floor is 70: the remaining uncovered branches are framer-motion
        // hover/setTimeout UI plumbing in Experience.tsx, where chasing the last
        // few branches needs brittle fake-timer tests for little real value.
        // CI still enforces this as a ratchet against regressions.
        branches: 70,
      },
    },
  },
})
