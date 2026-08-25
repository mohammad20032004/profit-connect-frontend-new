import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {},
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui'
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router') || id.includes('@reduxjs') || id.includes('react-redux') || id.includes('react-i18next') || id.includes('i18next')) return 'vendor-react'
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts'
          if (id.includes('@tiptap')) return 'vendor-editor'
          if (id.includes('ol/') || id.includes('/ol/') || id.includes('ol')) return 'vendor-map'
          return 'vendor'
        },
      },
    },
  },
})
