import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    tailwindcss(),   // ← essentiel pour que les classes Tailwind fonctionnent
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}']
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
          { src: '/logo-myra-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ]
})