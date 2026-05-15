import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const githubPagesBase = process.env.GITHUB_PAGES_BASE || '/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? githubPagesBase : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
}))
