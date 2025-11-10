import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // JavaScript 환경의 global을 브라우저의 window 객체로 대체합니다.
    global: 'window', 
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