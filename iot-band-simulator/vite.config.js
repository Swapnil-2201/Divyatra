import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_WS_URL || 'http://127.0.0.1:5001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
