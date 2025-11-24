// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react()],
  define: {
    // global: 'window', // 제거
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
      // 📌 [추가] 로컬 백엔드 서버 프록시 설정
      '/api': {
        target: 'http://localhost:8080', // 👈 로컬 백엔드 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws-stomp': {
        target: 'http://localhost:8080', // 👈 백엔드 서버 주소
        changeOrigin: true,
        ws: true, // 👈 WebSocket 프록시 활성화 옵션
      },
      // 📌 기존 설정 유지
      '/1262000': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
      },
      '/kosis': {
        target: 'https://kosis.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kosis/, ''),
      },
    },
  }
});