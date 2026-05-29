import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        // Petite astuce pour que le SW soit bien pris en compte par PWABuilder
        runtimeCaching: [
          {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'Myra - Services de proximité',
        short_name: 'Myra',
        description: 'Tous les services du quotidien, à deux pas de chez vous.',
        categories: ['lifestyle', 'productivity', 'utilities'],
        lang: 'fr',
        dir: 'ltr',
        theme_color: '#1E2A3A',
        background_color: '#1E2A3A',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/logo-myra-48.png', sizes: '48x48', type: 'image/png' },
          { src: '/logo-myra-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/logo-myra-96.png', sizes: '96x96', type: 'image/png' },
          { src: '/logo-myra-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/logo-myra-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo-myra-256.png', sizes: '256x256', type: 'image/png' },
          { src: '/logo-myra-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/logo-myra-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo-myra-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: '/screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
      },
    }),
  ],
})