import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type MyPageHeaderProps = {
  onProfileEditClick: () => void;
};

type User = {
  nickname: string;
  profileImageUrl?: string;
};

// 사용자 정보를 가져오는 함수 (API 명세에 맞게 엔드포인트 수정 필요)
const fetchUserInfo = async (): Promise<User> => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/nickname`);
  return response.data;
};

function MyPageHeader({ onProfileEditClick }: MyPageHeaderProps) {
  const navigate = useNavigate();
  const { data: userInfo } = useQuery<User>({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시 유지
  });

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

  const handleMain = () => {
    navigate("/");
  };

  return (
    <header className="header transparent-header">
      <div className="header-left">
        <button className="header-brand-name" onClick={handleMain}>
          Tlan
        </button>
      </div>
      <div className="header-user-actions">
        {/* 사용자 프로필 정보 표시 */}
        <div className="header-user-profile">
          <div className="profile-avatar">
            {userInfo?.profileImageUrl ? (
              <img src={userInfo.profileImageUrl} alt="프로필 사진" />
            ) : (
              // 기본 프로필 아이콘 (SVG)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span className="profile-nickname">
            {userInfo?.nickname || "사용자"}님
          </span>
        </div>

        <button
          className="header-logout mypage-header-btn"
          onClick={onProfileEditClick}
        >
          개인정보 수정
        </button>
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
