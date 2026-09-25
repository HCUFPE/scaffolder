import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_DEV_ADMIN_EMAIL': JSON.stringify(process.env.DEV_ADMIN_EMAIL || 'admin@appstart.local'),
    'import.meta.env.VITE_DEV_USER_EMAIL': JSON.stringify(process.env.DEV_USER_EMAIL || 'user@appstart.local'),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_BASE_URL || 'http://localhost:3100',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.API_BASE_URL || 'http://localhost:3100',
        changeOrigin: true,
      },
    },
  },
});
