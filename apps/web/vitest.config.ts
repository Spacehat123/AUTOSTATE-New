import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env = { ...process.env, ...env }
  
  return {
    plugins: [react(), tsconfigPaths()],
  test: { 
    globals: true,
    passWithNoTests: true,
    environment: 'jsdom', 
    setupFiles: './src/test/setup.ts',
    exclude: [...configDefaults.exclude, 'e2e/**']
  },
  }
})
