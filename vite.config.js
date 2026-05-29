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
        // ✅ "html" retiré — le SW ne met plus en cache index.html
        // ce qui causait la page blanche sur /reset-password
        globPatterns: ['**/*.{js,css,ico,png,svg,jpg,jpeg,webp}'],

        // ✅ Pour la navigation SPA : le SW renvoie index.html
        // pour toutes les routes inconnues (au lieu de rien = page blanche)
        navigateFallback: '/index.html',

        // ✅ Ces routes passent directement au réseau,
        // le Service Worker ne les intercepte pas du tout
        navigateFallbackDenylist: [
          /^\/reset-password/,
          /^\/api\//,
        ],

        // ✅ Les appels vers ton backend Railway ne sont jamais cachés
        // Remplace l'URL par celle de ton vrai backend si elle est différente
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.railway\.app\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'Myra - Services de proximité',
        short_name: 'Myra',
        description: 'Tous les services du quotidien, à deux pas de chez vous.',
        theme_color: '#1E2A3A',
        background_color: '#1E2A3A',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/logo-myra-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo-myra-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/logo-myra-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})