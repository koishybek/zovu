import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// Zovu PWA (ADR-008). Прод-стиль — из design/standalone.html; см. docs/06-design-system.md.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Zovu — специалисты рядом',
        short_name: 'Zovu',
        description: 'C2C-маркетплейс бытовых услуг для Казахстана',
        lang: 'ru',
        theme_color: '#4C6FFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        // TODO(M8): добавить растровые icon-192/512.png (maskable). Пока — SVG-фавикон.
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      // API-ядро (M2) поднимается на :3000; WS /chat проксируется туда же
      '/v1': { target: 'http://localhost:3000', changeOrigin: true },
      '/chat': { target: 'http://localhost:3000', ws: true, changeOrigin: true },
    },
  },
});
