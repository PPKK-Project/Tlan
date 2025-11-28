import axios from "axios";

// 요청 인터셉터: 로컬 토큰 자동 첨부
axios.interceptors.request.use((config) => {
  const t = localStorage.getItem("jwt");
  if (t) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// 응답 인터셉터: 토큰 만료/무효 시 강제 로그아웃 + 메인 이동
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const hasToken = !!localStorage.getItem("jwt");
    const errorCode = error.response?.data?.code;

    if (
      status === 401 &&
      hasToken &&
      (errorCode === "TOKEN_EXPIRED" || errorCode === "TOKEN_INVALID")
    ) {
      // 토큰 정리
      localStorage.removeItem("jwt");
      // 세션 만료 토스트용 플래그
      localStorage.setItem("sessionExpired", "true");
      // 어떤 페이지에서든 바로 메인으로 이동
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);
