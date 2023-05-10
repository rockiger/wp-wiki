import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      base: '/wp-content/reactpress/apps/wp-wiki/dist/',
      plugins: [react()],
    }
  } else {
    return {
      plugins: [react()],
      test: {
        globals: true,
        environment: 'jsdom',
      },
    }
  }
})
