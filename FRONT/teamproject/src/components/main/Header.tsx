// Header.jsx
function Header() {
  return (
    // 배경색 없이 투명하게 처리합니다.
    <header className="header transparent-header">
      <div className="header-left">
        <h1 className="header-brand-name">Tlan</h1>
      </div>
      
      <div className="header-user-actions">
        {/* 로그인/회원가입 버튼 스타일 변경 */}
        <button className="header-login">로그인</button>
        <button className="header-signin transparent-signin">회원가입</button>
      </div>
    </header>
  );
}

export default Header;