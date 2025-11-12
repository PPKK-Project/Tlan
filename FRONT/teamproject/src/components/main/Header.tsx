// Header.jsx
import { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import SignIn from "../login/SignIn";
import SignUp from "../login/SignUp";
import axios from "axios";

function Header() {
  const [isLogin, setLogin] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    if (token) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/check-token`, {
          headers: { Authorization: token },
        })
        .then(() => {
          setLogin(true);
        })
        .catch((err) => {
          console.error("토큰 검증 실패:", err);
          sessionStorage.removeItem("jwt");
          setLogin(false);
        });
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("jwt");
    setLogin(false);
    setSnackbar({
      open: true,
      message: "로그아웃 되었습니다.",
      type: "info"
    });
  };

  const handleLoginSuccess = () => {
    setLogin(true);
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
          {isLogin ? (
            <>
              <button className="header-my-page"> 마이페이지</button>
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
          severity={snackbar.type}
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
