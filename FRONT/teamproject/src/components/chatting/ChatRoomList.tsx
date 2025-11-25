import React from "react";
import { useQuery } from "@tanstack/react-query"; // useQueries에서 useQuery로 변경해도 됩니다.
import axios from "axios";
import "../../css/ChatRoomList.css";

type TravelPlan = {
  id: number;
  title: string;
  // TODO: 백엔드에서 마지막 메시지, 안 읽은 메시지 수 등을 추가하면 좋습니다.
  // lastMessage?: string;
  // unreadCount?: number;
};

type ChatRoomListProps = {
  onSelectRoom: (plan: TravelPlan) => void;
};

const getMyPlans = async (): Promise<TravelPlan[]> => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/travels`);
  return response.data;
};

// 초대받은 여행 계획 목록 가져오기 (API 엔드포인트는 /invitations로 가정)
const getInvitedPlans = async (): Promise<TravelPlan[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/travels/share`
  );
  return response.data;
};

const ChatRoomList: React.FC<ChatRoomListProps> = ({ onSelectRoom }) => {
  // 1. 내가 생성한 여행 계획 목록 가져오기
  const {
    data: myPlans,
    isLoading: isLoadingMyPlans,
    error: errorMyPlans,
  } = useQuery({
    queryKey: ["myChatPlans"],
    queryFn: getMyPlans,
  });

  // 2. 초대받은 여행 계획 목록 가져오기
  const {
    data: invitedPlans,
    isLoading: isLoadingInvitedPlans,
    error: errorInvitedPlans,
  } = useQuery({
    queryKey: ["invitedChatPlans"],
    queryFn: getInvitedPlans,
  });

  // 두 쿼리의 로딩 및 에러 상태를 종합적으로 관리
  const isLoading = isLoadingMyPlans || isLoadingInvitedPlans;
  const isError = !!errorMyPlans || !!errorInvitedPlans;

  // 두 데이터를 합치고 중복 제거
  const allPlans = React.useMemo(() => {
    const combined = [...(myPlans || []), ...(invitedPlans || [])];
    // 중복된 계획이 있을 경우 id를 기준으로 제거
    return combined.filter(
      (plan, index, self) =>
        plan && index === self.findIndex((p) => p && p.id === plan.id)
    );
  }, [myPlans, invitedPlans]);

  if (isLoading)
    return <div className="chat-list-status">채팅 목록을 불러오는 중...</div>;
  if (isError)
    return (
      <div className="chat-list-status">목록을 불러오는데 실패했습니다.</div>
    );
  if (!allPlans || allPlans.length === 0)
    return <div className="chat-list-status">참여 중인 채팅방이 없습니다.</div>;

  return (
    <div className="chat-room-list">
      {allPlans.map((plan) => (
        <div
          key={plan.id}
          className="chat-room-item"
          onClick={() => onSelectRoom(plan)}
        >
          <h4 className="room-title">{plan.title}</h4>
          <p className="room-last-message">채팅방에 참여하려면 클릭하세요.</p>
        </div>
      ))}
    </div>
  );
};

export default ChatRoomList;