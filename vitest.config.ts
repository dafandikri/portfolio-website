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
        'src/App.tsx',
        'src/data/**/*.ts',
        'src/hooks/**/*.ts',
        'src/components/**/*.tsx',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        // Branch floor is 70: the uncovered remainder is inside the rAF loop in
        // useCardTilt, where driving real animation frames needs brittle timer
        // fakes for little real value. The tilt maths itself is a pure function
        // and is covered directly. CI still enforces this as a regression ratchet.
        branches: 70,
      },
    },
  },
})
