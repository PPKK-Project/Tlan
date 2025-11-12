// Header.jsx
import { useState } from "react";
import { Snackbar } from "@mui/material";
import SignIn from "../login/SignIn";
import SignUp from "../login/SignUp";

function Header() {
  const [isLogin, setLogin] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  const handleLogout = () => {
    sessionStorage.removeItem("jwt");
    setLogin(false);
    setSnackbar({ open: true, message: "로그아웃 되었습니다." });
  };

  const handleLoginSuccess = () => {
    setLogin(true);
    setSnackbar({ open: true, message: "로그인에 성공했습니다!" });
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
          <button className="header-logout" onClick={handleLogout}> 로그아웃</button>
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
      message={snackbar.message}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    />
    </>
  );
}

export default Header;
