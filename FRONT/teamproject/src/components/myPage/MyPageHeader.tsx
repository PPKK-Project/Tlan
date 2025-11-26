import { Link, useNavigate } from "react-router-dom";

function MyPageHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    // 페이지 이동 시 state를 통해 토스트 메시지 전달
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

  return (
    <header className="header transparent-header">
      <div className="header-left">
        <Link className="header-brand-name" to="/">
          Tlan
        </Link>
      </div>
      <div className="header-user-actions">
        {/* TODO: 아이콘 라이브러리(예: react-icons)를 사용하여 아이콘 추가 */}
        <button
          className="header-logout mypage-header-btn"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
export default MyPageHeader;
