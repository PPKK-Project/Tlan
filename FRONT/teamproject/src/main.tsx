import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./css/index.css";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import MainPage from "./components/main/MainPage";
import TravelPlanPage from "./components/plan/TravelPlanPage";
import MyPage from "./components/myPage/MyPage";
import axios from "axios";
import SignUp from "./components/login/SignUp";
import SignIn from "./components/login/SignIn";
import VerifyEmail from "./components/login/VerifyEmail";

const queryClient = new QueryClient();

// 전역 타입 선언 - winddow에 이런 커스텀 필드가 있을 수 있다.
declare global {
  interface Window {
    _axiosSetupDone?: boolean; // 설정이 이미 끝났는지
    __onUnauthorized?: () => void; // 401 받았을 때 실행할 콜백
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
    const status = error.response?.status;
    const hasToken = !!localStorage.getItem("jwt");
    const errorCode = error.response?.data?.code;
    // ↑ 백엔드에서 내려주는 에러 코드 이름에 맞춰 수정: 예) 'TOKEN_EXPIRED', 'TOKEN_INVALID' 등

    // 1) 토큰이 있고
    // 2) 401이고
    // 3) 에러 코드가 '토큰 만료 / 토큰 잘못됨'일 때만 자동 로그아웃
    if (
      status === 401 &&
      hasToken &&
      (errorCode === "TOKEN_EXPIRED" || errorCode === "TOKEN_INVALID")
    ) {
      if (window.__onUnauthorized) {
        window.__onUnauthorized();
      }
    }
      return Promise.reject(error);
    }
  );
}

// 라우터 설정
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    // :travelId 파라미터를 통해 어떤 여행인지 구분
    path: "/travels/:travelId",
    element: <TravelPlanPage />,
  },
  {
    path: "/myPage",
    element: <MyPage />,
  },
  {
    path: "/signUp",
    element: <SignUp />,
  },
  {
    path: "/signIn",
    element: <SignIn />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
