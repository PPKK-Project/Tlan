// Header.jsx
import { useState, useEffect } from "react";
import SignIn from "../login/SignIn";
import SignUp from "../login/SignUp";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";

function Header() {
  // sessionStorage에 토큰이 있는지 확인하여 초기 로그인 상태를 설정합니다.
  const [isLogin, setLogin] = useState(!!sessionStorage.getItem("jwt"));
  const navigate = useNavigate();

  // isLogin 상태가 변경될 때마다 sessionStorage를 확인하여 상태를 동기화합니다.
  useEffect(() => {
    const checkLoginStatus = () => setLogin(!!sessionStorage.getItem("jwt"));
    window.addEventListener("storage", checkLoginStatus); // 다른 탭에서 로그인/로그아웃 시 상태 반영
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  /**
   * JWT 토큰의 Payload를 디코딩하여 사용자 ID를 추출하는 함수
   * @returns {string | null} 사용자 ID 또는 null
   */
  const getUserIdFromToken = (): string | null => {
    const token = sessionStorage.getItem("jwt");
    if (!token) return null;

    try {
      // 토큰의 payload(두 번째 부분)를 디코딩합니다.
      const payload = JSON.parse(atob(token.split(".")[1]));
      // payload에서 'id'를 추출합니다. (백엔드에서 설정한 key에 따라 'sub', 'userId' 등일 수 있습니다)
      return payload.id || null;
    } catch (error) {
      console.error("토큰 디코딩 실패:", error);
      return null;
    }
  };

  const handleMyPageClick = () => {
    const userId = getUserIdFromToken();
    if (userId) {
      navigate(`/myPage`);
    } else {
      alert("사용자 정보를 가져올 수 없습니다. 다시 로그인해주세요.");
      handleLogout();
    }
  };
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
    navigate("/"); // 로그아웃 후 메인 페이지로 이동
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
