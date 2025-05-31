/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/admin',
  resolve: {
    alias: {
      '@lia/react': path.resolve(__dirname, '../../libs/react/src'),
      '@lia/api': path.resolve(__dirname, '../../libs/api/src'),
    },
  },
  server: {
    port: 4100,
    host: '0.0.0.0',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui')) return 'mui';
            if (id.includes('@emotion')) return 'emotion';
            if (id.includes('react')) return 'react';
            if (id.includes('axios')) return 'vendor';
            if (id.includes('lodash')) return 'vendor';
            if (id.includes('dayjs')) return 'vendor';
            if (id.includes('@tanstack')) return 'vendor';
            // 기타 라이브러리별로 추가
            return 'vendor';
          }
        },
      },
    },
  },
  define: {
    'import.meta.env.VITE_BASE_API_URL': JSON.stringify(
      mode === 'development' ? 'http://localhost:4600' : 'https://api.asklia.io'
    ),
  },
}));
