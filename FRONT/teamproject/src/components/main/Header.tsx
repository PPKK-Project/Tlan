import { useNavigate, Link } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import "../../css/header.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Crown, Edit2, Eye, UsersRound, X } from 'lucide-react'
import { useQuery } from "@tanstack/react-query";
import { useTravelData } from "../../hooks/useTravelData";

type UserList = {
  permissionId: number,
  userNickname: string,
  userEmail: string,
  role: string,
  userId: number,
}
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
  const [open, setOpen] = useState(false);
  const travelId = location.pathname.split("/")[2];
  const { stompClient } = useTravelData(travelId);
  useEffect(() => {
    if (travelId === undefined) return;
    const getRole = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/travels/${travelId}/role`
      );
      setRole(response.data);
    };
    getRole();
  }, [travelId]);
  const { data, isLoading, error } = useQuery<UserList[]>({
    queryKey: ['userList', travelId],
    queryFn: async () => {
      if (travelId === undefined) return;
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/travels/${travelId}/share`);
      return response.data
    },
    enabled: travelId !== undefined,
  })
  if (travelId !== undefined && (isLoading || error)) return <div>Loading..........</div>
  if (travelId !== undefined && !data) return <div>NO data</div>
  const handleDelete = async (permissionId: number) => {
    await axios.delete(`${import.meta.env.VITE_BASE_URL}/travels/${travelId}/share/${permissionId}`);
    stompClient?.publish({
      destination: `/app/travels/${travelId}`,
      body: "PLAN_UPDATED",
    });
    setOpen(false);
  }
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
      {role && data !== undefined && (
        <div className="relative">
          <button
            className="text-xl font-bold text-gray-800 whitespace-nowrap flex items-center justify-center"
            type="button"
          >
            <UsersRound onClick={() => setOpen((prev) => !prev)} />
          </button>

          {/* 드롭다운 - 부드러운 애니메이션 */}
          <div
            className={`
    absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-50 text-xs text-gray-700
    origin-top transition-all duration-150 ease-out
    ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}
  `}
          >
            {data.map((user) => (
              <div
                key={user.permissionId}
                className="flex items-center px-3 py-2 hover:bg-gray-100"
              >
                {/* 왼쪽: 역할 아이콘 */}
                <div className="w-5 flex items-center justify-start">
                  {user.role === "ROLE_OWNER" && <Crown className="w-4 h-4" />}
                  {user.role === "ROLE_EDITOR" && <Edit2 className="w-4 h-4" />}
                  {user.role === "ROLE_VIEWER" && <Eye className="w-4 h-4" />}
                </div>

                {/* 가운데: 닉네임 + 이메일 */}
                <div className="flex-1 text-left ml-3">
                  <div className="text-[13px] font-medium text-gray-800 truncate">
                    {user.userNickname}
                  </div>
                  <div className="mt-0.5 text-[10px] text-gray-400 truncate">
                    {user.userEmail}
                  </div>
                </div>

                {/* 오른쪽: 삭제 아이콘 */}
                <div className="w-5 flex items-center justify-end">
                  {role === "ROLE_OWNER" && user.role !== "ROLE_OWNER" && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(user.permissionId);
                        // 필요하면 여기서 setOpen(false) 도 같이
                      }}
                      className="rounded-full p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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