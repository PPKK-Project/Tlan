import { useNavigate, Link } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import "../../css/header.css";

function Header() {
  const navigate = useNavigate();
  const { isLogin, snackbar, handleLogout } = useAuthSession();

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