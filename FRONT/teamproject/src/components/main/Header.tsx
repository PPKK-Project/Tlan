import { useNavigate, Link } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import "../../css/header.css";
import { useEffect, useState } from "react";
import axios from "axios";

function Header({
  travelInfo,
  formattedDateRange,
}: {
  travelInfo?: { title: string; travelerCount: number };
  formattedDateRange?: string;
}) {
  const { isLogin, snackbar, handleLogout } = useAuthSession();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const travelId = location.pathname.split("/")[2];
  useEffect(() => {
    if (travelId === undefined) return;
    const getRole = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/travels/${travelId}/role`
      );
      setRole(response.data);
    };
    getRole();
  }, []);

  const TravelInfoArea = (
    <>
      <div className="px-8 py-3 relative flex items-center justify-between z-20 min-h-[70px]">
        <div className="flex flex-col items-start justify-center z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">
              {/* Props가 없을 때 기본값 사용 */}
              {travelInfo?.title || "여행 계획"}
            </h1>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
              🗓️ {formattedDateRange || "날짜 미정"}{" "}
              {/* Props가 없을 때 기본값 사용 */}
              {travelInfo?.travelerCount &&
                ` · 👥 ${travelInfo.travelerCount}명`}
            </span>
          </div>
        </div>
      </div>
      <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">
        {role.substring(5)}
      </h1>
    </>
  );
  const isTravelHeader = travelInfo || formattedDateRange;

  return (
    <>
      <header className="header transparent-header">
        <div className="header-left">
          <Link to="/" className="header-brand-name">
            Tlan
          </Link>
          <div className="header-left">{isTravelHeader && TravelInfoArea}</div>
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