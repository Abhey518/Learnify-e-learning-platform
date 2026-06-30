import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Directs any front-end request starting with '/api' to your Flask server
      '/api': {
        target: 'http://127.0.0.1:5000', // <-- MUST match your Flask port exactly!
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Removes '/api' before hitting Flask
      },
    },
  },
});
