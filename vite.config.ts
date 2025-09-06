import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@config': '/src/config',
      '@lib': '/src/lib',
      '@theme': '/src/theme',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@data': '/src/data',
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    host: true,
  },
});