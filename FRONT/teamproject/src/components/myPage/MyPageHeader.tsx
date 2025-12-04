import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../../css/MyPage.css"
import { User } from "lucide-react";

type MyPageHeaderProps = {
  onProfileEditClick: () => void;
};

type User = {
  nickname: string;
  profileImageUrl?: string;
};

// 사용자 정보를 가져오는 함수 (API 명세에 맞게 엔드포인트 수정 필요)
const fetchUserInfo = async (): Promise<User> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/users/nickname`
  );
  return response.data;
};

function MyPageHeader({ onProfileEditClick }: MyPageHeaderProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: userInfo } = useQuery<User>({
    queryKey: ["userInfo"],
    queryFn: fetchUserInfo,
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

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header transparent-header">
      <div className="header-left">
        <Link className="my-header-brand-name header-brand-name" to="/">
          Tlan
        </Link>
      </div>
      <div className="header-user-actions">
        <div className="profile-dropdown-container" ref={dropdownRef}>
          {/* 사용자 프로필 정보 표시 (클릭 가능) */}
          <div
            className="header-user-profile"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="profile-avatar">
              {userInfo?.profileImageUrl ? (
                <img src={userInfo.profileImageUrl} alt="프로필 사진" />
              ) : (
                // 기본 프로필 아이콘 (SVG)
                <User className="w-6 h-6" />
              )}
            </div>
            <span className="profile-nickname">
              {userInfo?.nickname || "사용자"}님
            </span>
          </div>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  onProfileEditClick();
                  setIsDropdownOpen(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>개인정보 수정</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false); // 로그아웃 후 드롭다운 닫기
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default MyPageHeader;