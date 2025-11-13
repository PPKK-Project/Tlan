import { useState } from "react";
import { Alert, AlertColor, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";

function MyPageHeader(){
  const navigate = useNavigate();
  const [isLogin, setLogin] = useState(!!localStorage.getItem("jwt"));
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      type: "info",
    });

    const handleLogout = () => {
    localStorage.removeItem("jwt");
    setLogin(false);
    navigate("/"); // 로그아웃 후 메인 페이지로 이동
    setSnackbar({
      open: true,
      message: "로그아웃 되었습니다.",
      type: "info",
    });
  };

  const handleMain = () => {
    navigate("/");
  }



  return(
  <>
  <header className="header transparent-header">
        <div className="header-left">
          <button className="header-brand-name" onClick={handleMain}>Tlan</button>
        </div>
        <div className="header-user-actions">
              <button className="header-logout" onClick={handleLogout}>
                {" "}
                로그아웃
              </button>
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
  )
}
export default MyPageHeader