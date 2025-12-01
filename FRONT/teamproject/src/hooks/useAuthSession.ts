import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type SnackbarState = {
  open: boolean;
  message: string;
  type: "info" | "success" | "warning" | "error";
};

export function useAuthSession() {
  const [isLogin, setLogin] = useState(!!localStorage.getItem("jwt"));
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    type: "info",
  });

  const navigate = useNavigate();
  const location = useLocation();

  // 로그인/회원가입/이메일 인증 후 toast 처리 useEffect 안에 같이 넣거나,
  // 별도 useEffect로 둬도 됨
  useEffect(() => {
    const expired = localStorage.getItem("sessionExpired");
    if (expired === "true") {
      localStorage.removeItem("sessionExpired");
      setLogin(false);
      setSnackbar({
        open: true,
        message: "로그인이 만료되었습니다. 다시 로그인 해주세요.",
        type: "warning",
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setLogin(false);
    navigate("/"); // 로그아웃 후 메인으로
    setSnackbar({
      open: true,
      message: "로그아웃 되었습니다.",
      type: "info",
    });
  };

  // 토스트 자동 닫기
  useEffect(() => {
    if (!snackbar.open) return;
    const timer = window.setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [snackbar.open]);

  // 로그인/회원가입/이메일 인증 후 toast 처리
  useEffect(() => {
    // 1) 라우터 state에 담겨온 toast 먼저 확인
    const state = location.state as
      | { toast?: { message: string; type?: string } }
      | undefined;

    if (state?.toast) {
      setSnackbar({
        open: true,
        message: state.toast.message,
        type: (state.toast.type as SnackbarState["type"]) || "info",
      });

      // 한번 보여준 뒤 state 비우기
      navigate(location.pathname, { replace: true, state: {} });
    }

    // 2) 기존 loginJustNow / signUpJustNow 처리
    const loginJustNow = localStorage.getItem("loginJustNow");
    const signUpJustNow = localStorage.getItem("signUpJustNow");
    const token = localStorage.getItem("jwt");

    if (loginJustNow === "true" && token) {
      localStorage.removeItem("loginJustNow");
      setLogin(true);
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
        message: "회원가입 성공! 이메일을 확인해주세요.",
        type: "success",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state]);

  return {
    isLogin,
    snackbar,
    setSnackbar,
    handleLogout,
  };
}
