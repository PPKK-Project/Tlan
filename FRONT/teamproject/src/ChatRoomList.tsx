import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./ChatRoomList.css";

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

const ChatRoomList: React.FC<ChatRoomListProps> = ({ onSelectRoom }) => {
  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myChatPlans"], // 다른 쿼리와 충돌하지 않도록 고유한 키 사용
    queryFn: getMyPlans,
  });

  if (isLoading)
    return <div className="chat-list-status">채팅 목록을 불러오는 중...</div>;
  if (error)
    return (
      <div className="chat-list-status">목록을 불러오는데 실패했습니다.</div>
    );
  if (!plans || plans.length === 0)
    return <div className="chat-list-status">참여 중인 채팅방이 없습니다.</div>;

  return (
    <div className="chat-room-list">
      {plans.map((plan) => (
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