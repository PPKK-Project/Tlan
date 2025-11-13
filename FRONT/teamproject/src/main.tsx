import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import MainPage from './components/MainPage';
import TravelPlanPage from './components/plan/TravelPlanPage';
import MyPage from './components/myPage/MyPage';
import axios from 'axios';

// 전역 타입 선언 - winddow에 이런 커스텀 필드가 있을 수 있다.
declare global {
  interface Window {
    _axiosSetupDone?: boolean;  // 설정이 이미 끝났는지
    __onUnauthorized?: () => void;  // 401 받았을 때 실행할 콜백
  }
}

// 전역 axios 설정을 모듈 로드 시 1회만 등록 / 요청이 여러번 날아가는걸 막음
if (!window._axiosSetupDone) {
  window._axiosSetupDone = true;

  // 요청 인터셉터: 로컬 토큰 자동 첨부
  axios.interceptors.request.use((config) => {
    const t = localStorage.getItem("jwt");
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });

  // 응답 인터셉터: 만료/무효(401)면 즉시 로그아웃 콜백 호출
  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
      // 1) 토큰 바로 삭제 (혹시 콜백 전에 실패해도 안전)
      localStorage.removeItem("jwt");

      // 2) Header가 등록한 콜백 사용(있으면)
      if (typeof window.__onUnauthorized === "function") {
        window.__onUnauthorized();
      } else {
        // 3) 콜백이 아직 등록 전이어도 강제로 메인으로 보내기(보호망)
        window.location.assign("/");
      }
    }
    return Promise.reject(error);
    }
  );
}

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    // :travelId 파라미터를 통해 어떤 여행인지 구분
    path: '/travels/:travelId', 
    element: <TravelPlanPage />,
  },
  {
    path: '/myPage',
    element:<MyPage/>,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
