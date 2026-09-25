import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carrega TODAS as variáveis do .env (prefixo '' = sem filtro por VITE_)
  const env = loadEnv(mode, resolve(import.meta.dirname, '../..'), '');

  const apiBaseUrl = env.API_BASE_URL || `http://localhost:${env.API_PORT || '3000'}`;

  return {
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
      'import.meta.env.VITE_DEV_ADMIN_EMAIL': JSON.stringify(env.DEV_ADMIN_EMAIL || 'admin@appstart.local'),
      'import.meta.env.VITE_DEV_USER_EMAIL': JSON.stringify(env.DEV_USER_EMAIL || 'user@appstart.local'),
    },
    server: {
      port: Number(env.WEB_PORT) || 5173,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/health': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
