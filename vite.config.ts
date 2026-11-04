import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { neonApiPlugin } from './src/server/neonApiPlugin';

export default defineConfig({
  plugins: [react(), tailwindcss(), neonApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-lucide': ['lucide-react'],
          'vendor-animation': ['gsap', '@gsap/react', 'lenis'],
        },
      },
    },
  },
  server: {
    port: 3000,
    watch: {
      ignored: ['**/temp-*/**', '**/scratch*/**', '**/scratch_screenshots/**'],
    },
  },
});
