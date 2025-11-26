// Header.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../../css/header.css";

function Header() {
  const [isLogin, setLogin] = useState(!!localStorage.getItem("jwt"));
  const navigate = useNavigate();
  const location = useLocation();

  const logoutTimeRef = useRef<number | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // 토스트 자동 닫기
  useEffect(() => {
    if (!snackbar.open) return;
    const timer = window.setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [snackbar.open]);

  // 다른 탭에서 로그인/로그아웃 시 상태 반영
  useEffect(() => {
    const checkLoginStatus = () => setLogin(!!localStorage.getItem("jwt"));
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const clearLogoutTimer = () => {
    if (logoutTimeRef.current) {
      clearTimeout(logoutTimeRef.current);
      logoutTimeRef.current = null;
    }
  };

  // base64url → JSON 파싱해서 exp(ms) 추출
  const decodeExpMs = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(json);
      return payload?.exp ? payload.exp * 1000 : null; // ms
    } catch {
      return null;
    }
  };

  // exp 까지 남은 시간만큼 setTimeout으로 자동 로그아웃 예약
  const scheduleAutoLogout = () => {
    clearLogoutTimer();
    const t = localStorage.getItem("jwt");
    if (!t) return;
    const expMs = decodeExpMs(t);
    if (!expMs) {
      handleLogout();
      return;
    }
    const remaining = expMs - Date.now();
    if (remaining <= 0) {
      handleLogout();
      return;
    }
    logoutTimeRef.current = window.setTimeout(
      handleLogout,
      Math.max(remaining, 500)
    );
  };

  // 처음 마운트 시: 만료 확인 + 타이머 예약
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const expMs = decodeExpMs(token);
      if (!expMs || expMs <= Date.now()) {
        handleLogout();
      } else {
        scheduleAutoLogout();
      }
    }
  }, []);

  // 응답 인터셉터(전역 axios)가 401(TOKEN_EXPIRED/INVALID)을 받으면 이 콜백을 호출하도록 연결
  useEffect(() => {
    window.__onUnauthorized = handleLogout;
    return () => {
      window.__onUnauthorized = undefined;
    };
  }, []);

  // 탭이 포커스로 돌아오거나 가시성 변경 시, 만료 재확인
  useEffect(() => {
    const recheck = () => {
      const t = localStorage.getItem("jwt");
      if (!t) return;
      const expMs = decodeExpMs(t);
      if (!expMs || expMs <= Date.now()) handleLogout();
      else scheduleAutoLogout();
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, []);

  // 로그인/회원가입/로그아웃 버튼 눌렀는지 감지
  useEffect(() => {
    // 1) 라우터 state에 담겨온 toast 먼저 확인
    const state = location.state as
      | { toast?: { message: string; type?: string } }
      | undefined;

    if (state?.toast) {
      setSnackbar({
        open: true,
        message: state.toast.message,
        type: state.toast.type || "info",
      });

      // 한번 보여준 뒤에는 state 비워주기 (새로고침/뒤로가기 시 또 안 뜨게)
      navigate(location.pathname, { replace: true, state: {} });
    }

    // 2) 기존 loginJustNow / signUpJustNow 처리
    const loginJustNow = localStorage.getItem("loginJustNow");
    const signUpJustNow = localStorage.getItem("signUpJustNow");
    const token = localStorage.getItem("jwt");

    if (loginJustNow === "true" && token) {
      localStorage.removeItem("loginJustNow");

      setLogin(true);
      scheduleAutoLogout();
      setSnackbar({
        open: true,
        message: "로그인에 성공했습니다!",
        type: "success",
      });
    }

    if (signUpJustNow === "true") {
      localStorage.removeItem("signUpJustNow");

      setSnackbar({
        open: true,
        message: "회원가입 성공 이메일을 확인해주세요.",
        type: "success",
      });
    }
  }, [location.pathname, location.state, navigate]);

  const handleLogout = () => {

    clearLogoutTimer();
    localStorage.removeItem("jwt");
    setLogin(false);
    navigate("/"); // 로그아웃 후 메인 페이지로 이동
    setSnackbar({
      open: true,
      message: "로그아웃 되었습니다.",
      type: "info",
    });
  };

  return (
    <>
      <header className="header transparent-header">
        <div className="header-left">
          <Link to="/" className="header-brand-name">Tlan</Link>
        </div>

        <div className="header-user-actions">
          {isLogin ? (
            <>
              <button
                type="button"
                className="header-auth-btn header-mypage-btn"
                onClick={() => navigate("/myPage")}
              >
                마이페이지
              </button>
              <button
                type="button"
                className="header-auth-btn header-logout-btn"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="header-auth-btn header-login-btn"
                onClick={() => navigate("/signIn")}
              >
                로그인
              </button>
              <button
                type="button"
                className="header-auth-btn header-signup-btn"
                onClick={() => navigate("/signUp")}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>

      {snackbar.open && (
        <div className={`toast toast-${snackbar.type}`}>{snackbar.message}</div>
      )}
    </>
  );
}

export default Header;
