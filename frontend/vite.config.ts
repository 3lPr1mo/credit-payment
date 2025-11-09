import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    exclude: [
      'node_modules',
      'dist',
      'build',
      'public',
      'src/setupTests.ts',
      '**/*.css',
    ],
  }
})
