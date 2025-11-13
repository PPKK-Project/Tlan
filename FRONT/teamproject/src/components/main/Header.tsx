// Header.jsx
import { useState, useEffect, useRef } from "react";
import SignUp from "../login/SignUp";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertColor, Snackbar } from "@mui/material";
import SignIn from "../login/SignIn";

function Header() {
  // localStorage에 토큰이 있는지 확인하여 초기 로그인 상태를 설정합니다.
  const [isLogin, setLogin] = useState(!!localStorage.getItem("jwt"));
  const navigate = useNavigate();
  const logoutTimeRef = useRef<number | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // isLogin 상태가 변경될 때마다 localStorage를 확인하여 상태를 동기화합니다.
  useEffect(() => {
    const checkLoginStatus = () => setLogin(!!localStorage.getItem("jwt"));
    window.addEventListener("storage", checkLoginStatus); // 다른 탭에서 로그인/로그아웃 시 상태 반영
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const clearLogoutTimer = () => {
    if (logoutTimeRef.current) {
      clearTimeout(logoutTimeRef.current);
      logoutTimeRef.current = null;
    }
  };

   // base64url → JSON 파싱해서 exp(ms) 추출
  const decodeExpMs = (token) => {
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
    logoutTimeRef.current = window.setTimeout(handleLogout, Math.max(remaining, 500));
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

  // ✅ 응답 인터셉터(전역 axios)가 401(TOKEN_EXPIRED/INVALID)을 받으면 이 콜백을 호출하도록 연결
  useEffect(() => {
    window.__onUnauthorized = handleLogout;
    return () => {
      window.__onUnauthorized = undefined;
    };
  }, []);

  // 탭이 포커스로 돌아오거나 가시성 변경 시, 만료 재확인 (권장)
  useEffect(() => {
    const recheck = () => {
      const t = localStorage.getItem("jwt");
      if (!t) return;
      const expMs = decodeExpMs(t);
      if (!expMs || expMs <= Date.now()) handleLogout();
      else scheduleAutoLogout(); // 남은 시간 갱신
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("jwt");
  //   if (token) {
  //     try {
  //       // JWT의 payload 부분을 디코딩합니다.
  //       const payload = JSON.parse(atob(token.split(".")[1]));
  //       // 만료 시간(exp)은 초 단위이므로 1000을 곱해 밀리초로 변환합니다.
  //       const expirationTime = payload.exp * 1000;

  //       // 토큰이 만료되었다면 로그아웃 처리합니다.
  //       if (expirationTime < Date.now()) {
  //         console.log("토큰이 만료되었습니다.");
  //         handleLogout();
  //       }
  //     } catch (error) {
  //       console.error("토큰 디코딩 또는 검증 실패:", error);
  //       // 토큰 형식이 잘못된 경우에도 로그아웃 처리합니다.
  //       handleLogout();
  //     }
  //   }
  // }, []);

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

  const handleLoginSuccess = () => {
    setLogin(true);
    scheduleAutoLogout(); // 로그인 직후 새 토큰 기준으로 자동 로그아웃 예약
    setSnackbar({
      open: true,
      message: "로그인에 성공했습니다!",
      type: "success",
    });
  };

  return (
    // 배경색 없이 투명하게 처리합니다.
    <>
      <header className="header transparent-header">
        <div className="header-left">
          <h1 className="header-brand-name">Tlan</h1>
        </div>

        <div className="header-user-actions">
          {isLogin ? ( // 로딩 중에는 아무것도 표시하지 않음
            <>
              <Link to="/myPage" className="header-my-page">
                마이페이지
              </Link>
              <button className="header-logout" onClick={handleLogout}>
                {" "}
                로그아웃
              </button>
            </>
          ) : (
            <>
              <SignIn setLogin={handleLoginSuccess} />
              <SignUp />
            </>
          )}
        </div>
      </header>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.type as AlertColor}
          sx={{
            width: "auto", // ✅ 글자 수에 맞게 자동 너비
            minWidth: "fit-content",
            borderRadius: "8px",
            px: 2,
            py: 1,
            fontSize: "0.95rem",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Header;
