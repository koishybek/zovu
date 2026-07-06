import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Мини-админка Zovu. Логин по статическому ADMIN_TOKEN. Прокси /v1 → API :3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: { '/v1': { target: 'http://localhost:3000', changeOrigin: true } },
  },
});
