import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: 'localhost', // Changed from '0.0.0.0' to 'localhost'
      strictPort: false, // Allow fallback to different port if 3000 is taken
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: './setupTests.ts',
      globals: true,
      css: true,
    }
  };
});
