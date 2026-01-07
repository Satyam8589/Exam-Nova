import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'react-pdf'],
    exclude: []
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      'react-pdf/dist/esm/Page/AnnotationLayer.css': 'react-pdf/dist/Page/AnnotationLayer.css',
      'react-pdf/dist/esm/Page/TextLayer.css': 'react-pdf/dist/Page/TextLayer.css'
    }
  }
})