import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/imerologio-taxis/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Ημερολόγιο Τάξης',
        short_name: 'Ημερολόγιο',
        description: 'Η καθημερινή ατζέντα του εκπαιδευτικού.',
        lang: 'el',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f1f4f1',
        theme_color: '#173d38',
        orientation: 'any',
        icons: [
          {
            src: 'app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
