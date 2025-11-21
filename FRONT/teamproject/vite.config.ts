import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  plugins: [react()],
  define: {
    // 1. **제거:** 이전에 사용했던 'global: window' 설정이 다른 라이브러리와 충돌하거나 
    // 문제를 완전히 해결하지 못했을 수 있어 제거합니다.
    // global: 'window', 
  },
  // **추가:** 라이브러리가 전역 객체를 찾지 못해 'undefined' 에러가 발생하는 문제를 해결하기 위해,
  // ESBuild가 Node.js 전역 변수(global)를 브라우저의 'globalThis'로 대체하도록 강제합니다.
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    proxy: {
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