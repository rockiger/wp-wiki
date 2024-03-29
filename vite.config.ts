import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'

function renderChunks(deps: Record<string, string>) {
  let chunks = {}
  Object.keys(deps).forEach((key) => {
    if (
      [
        'react',
        'react-router-dom',
        'react-dom',
        '@tiptap/pm',
        '@types/lodash',
      ].includes(key)
    )
      return
    chunks[key] = [key]
  })
  return chunks
}

//! Create plugin, that creates content type,
//! adds mutation,
//! loads javascript on page
// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      base: '/wp-content/plugins/fulcrum/apps/wp-wiki/dist/',
      plugins: [react()],
      build: {
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-router-dom', 'react-dom'],
              // '@emotion/react': ['@emotion/react'],
              '@headlessui': ['@headlessui/react'],
              '@radix-ui': [
                '@radix-ui/react-popover',
                '@radix-ui/react-select',
                '@radix-ui/react-toast',
              ],
              '@tiptap': [
                '@tiptap/extension-highlight',
                '@tiptap/extension-link',
                '@tiptap/extension-subscript',
                '@tiptap/extension-superscript',
                '@tiptap/extension-table',
                '@tiptap/extension-table-cell',
                '@tiptap/extension-table-header',
                '@tiptap/extension-table-row',
                '@tiptap/extension-task-item',
                '@tiptap/extension-task-list',
                '@tiptap/extension-text-align',
                '@tiptap/extension-underline',
                '@tiptap/react',
                '@tiptap/starter-kit',
              ],
              '@blocknote': ['@blocknote/core', '@blocknote/react'],
              '@next-ui': ['@nextui-org/react'],
              // 'body-scroll-lock': ['body-scroll-lock'],
              // classix: ['classix'],
            },
          },
        },
      },
    }
  } else {
    return {
      plugins: [react(), eslint()],
      test: {
        globals: true,
        environment: 'jsdom',
      },
    }
  }
})
