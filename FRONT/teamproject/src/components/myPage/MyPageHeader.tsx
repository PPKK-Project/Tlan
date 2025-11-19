import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyPageHeader() {
  const navigate = useNavigate();
  const [isLogin, setLogin] = useState(!!localStorage.getItem("jwt"));
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "info",
  });

    useEffect(() => {
      if (!snackbar.open) return;
      const timer = window.setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }, [snackbar.open]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setLogin(false);
    navigate("/", {
    replace: true,
    state: {
      toast: {
        message: "로그아웃 되었습니다.",
        type: "info",
      },
    },
  });
  };

  const handleMain = () => {
    navigate("/");
  };

  return (
    <>
      <header className="header transparent-header">
        <div className="header-left">
          <button className="header-brand-name" onClick={handleMain}>
            Tlan
          </button>
        </div>
        <div className="header-user-actions">
          <button className="header-logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>
      {snackbar.open && (
        <div className={`toast toast-${snackbar.type}`}>{snackbar.message}</div>
      )}
    </>
  );
}
export default MyPageHeader;
