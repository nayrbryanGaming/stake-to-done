import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].v2022.${Date.now()}.js`,
        chunkFileNames: `assets/[name].v2022.${Date.now()}.js`,
        assetFileNames: `assets/[name].v2022.${Date.now()}.[ext]`,
        manualChunks: {
          react: ['react', 'react-dom'],
          wagmi: ['wagmi', 'viem'],
          motion: ['framer-motion'],
          query: ['@tanstack/react-query'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
