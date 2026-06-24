import { fileURLToPath, URL } from 'node:url'

const srcPath = fileURLToPath(new URL('./src/', import.meta.url)).replace(/\\/g, '/')

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  appType: 'spa',
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
  optimizeDeps: {
    noDiscovery: true,
  },
  build: {
    modulePreload: false,
  },
  resolve: {
    alias: [
      {
        find: /^dayjs$/,
        replacement: fileURLToPath(new URL('./node_modules/dayjs/esm/index.js', import.meta.url)),
      },
      {
        find: /^dayjs\/plugin\/(.*)\.js$/,
        replacement: fileURLToPath(
          new URL('./node_modules/dayjs/esm/plugin/$1/index.js', import.meta.url),
        ),
      },
      {
        find: /^dayjs\/locale\/(.*)\.js$/,
        replacement: fileURLToPath(
          new URL('./node_modules/dayjs/esm/locale/$1.js', import.meta.url),
        ),
      },
      {
        find: /^@\//,
        replacement: `${srcPath}`,
      },
    ],
  },
})
