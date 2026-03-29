import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      exclude: ['@stackframe/react'],
      force: true,
    },
    plugins: [react()],
    server: {
      open: false,
      port: 80,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://api:5678',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist-web',
      emptyOutDir: true,
    },
    base: '/',
  };
});
