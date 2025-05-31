/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  resolve: {
    alias: {
      '@lia/react': path.resolve(__dirname, '../../libs/react/src'),
    },
  },
  server: {
    port: 4500,
    host: '0.0.0.0',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AskLia',
        short_name: 'AskLia',
        description: '금융 데이터 분석 챗봇',
        theme_color: '#ffffff',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/icon/lia_logo_128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon/lia_logo_192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon/lia_logo_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon/lia_logo_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
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
