// Header.jsx
import { useState } from "react";
import SignIn from "../login/SignIn";
import SignUp from "../login/SignUp";

function Header() {
  const [isLogin, setLogin] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("jwt");
    alert("로그아웃 되었습니다.");
    setLogin(false);
  };

  return (
    // 배경색 없이 투명하게 처리합니다.
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
            <SignIn setLogin={setLogin} />
            <SignUp />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
