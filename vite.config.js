import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup/vitest.setup.js',
    css: true,
    globals: true,
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.test.{js,jsx,ts,tsx}'],
    },
  },
})
