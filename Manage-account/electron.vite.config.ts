import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['electron', 'path', 'fs', 'os', 'crypto', 'stream', 'util', 'url', 'net', 'tls', 'http', 'https', 'zlib', 'events', 'buffer']
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ['electron', 'path', 'fs', 'os', 'crypto', 'stream', 'util', 'url', 'net', 'tls', 'http', 'https', 'zlib', 'events', 'buffer']
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
