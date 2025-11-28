import { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";
import "../../css/Chat.css";
import ChatRoomList from "./ChatRoomList"; // 채팅방 목록 컴포넌트


type ChatMessage = {
  nickname: string;
  content: string;
};

// 채팅방(여행 계획)의 타입을 정의합니다.
type TravelPlan = {
  id: number;
  travelId?: number; // TravelPlanList와 타입 일치를 위해 추가 (선택적으로 변경)
  title: string;
};

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false); // 채팅 런처(창)의 열림/닫힘 상태
  const [activePlan, setActivePlan] = useState<TravelPlan | null>(null); // 현재 선택된 채팅방 정보
  const [inputMessage, setInputMessage] = useState("");
  const [userInfo, setUserInfo] = useState({
    email: "",
    nickname: "Guest",
    userId: 0,
  });
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // 메시지 목록의 끝을 참조할 ref

  // 컴포넌트 마운트 시 사용자 정보를 가져옵니다.
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 백엔드에서 현재 로그인된 사용자의 정보를 가져오는 API
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/nickname`
        );
        if (
          response.data &&
          response.data.email &&
          response.data.nickname &&
          response.data.userId
        ) {
          setUserInfo({
            email: response.data.email,
            nickname: response.data.nickname,
            userId: response.data.userId,
          });
        }
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // activePlan이 변경될 때마다 웹소켓 연결을 설정/해제합니다.
  useEffect(() => {
    // 채팅방을 선택하지 않았으면 연결하지 않습니다.
    if (!activePlan) {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      return;
    }

    // 이전 채팅방 메시지 불러오기
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/chat/message/${activePlan.id}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("채팅 기록을 불러오는 데 실패했습니다.", error);
        setMessages([]); // 실패 시 메시지 초기화
      }
    };
    fetchHistory();

    const token = localStorage.getItem("jwt");

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws-stomp"),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000, // 5초마다 재연결 시도
      onConnect: () => {
        // 여행 계획 ID에 맞는 토픽을 구독합니다.
        client.subscribe(`/chat/message/${activePlan.id}`, (message) => {
          if(message.body === "CHAT_UPDATED") {
            console.log(message.body)
            // 유즈 쿼리만들고 mutation 으로 키 갱신
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers["message"], frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
      }
    };
  }, [activePlan]); // activePlan이 바뀔 때마다 이 useEffect가 다시 실행됩니다.

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동시킵니다.
  useEffect(() => {
    // 부드럽게 스크롤
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // messages 배열이 변경될 때마다 실행

  // 4. 메시지 전송 함수
  const sendMessage = () => {
    if (
      clientRef.current &&
      clientRef.current.connected &&
      inputMessage.trim() !== "" &&
      activePlan
    ) {
      const chatMessage = {
        // 서버에는 메시지 내용만 보냅니다.
        email: userInfo.email,
        content: inputMessage,
      };

      // 낙관적 업데이트: UI에 즉시 표시할 임시 메시지를 만듭니다.
      const tempMessage: ChatMessage = {
        nickname: userInfo.nickname,
        content: inputMessage,
      };
      // 화면에 임시 메시지를 먼저 추가합니다.
      setMessages((prevMessages) => [...prevMessages, tempMessage]);

      clientRef.current.publish({
        destination: `/app/chat/message/${activePlan.id}`,
        body: JSON.stringify(chatMessage),
      });
      setInputMessage("");
    }
  };

  return (
    <div className="chat-container">
      {/* 채팅 런처 창 (목록 또는 채팅방) */}
      <div className={`chat-window ${isLauncherOpen ? "open" : ""}`}>
        {activePlan ? (
          // 채팅방이 선택된 경우: 개별 채팅창 UI
          <>
            <div className="chat-header">
              <button className="back-btn" onClick={() => setActivePlan(null)}>
                &lt;
              </button>
              <span className="header-title">{activePlan.title}</span>
              <button
                className="close-btn"
                onClick={() => setIsLauncherOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="messages-area">
              {messages.map((msg, index) => {
                return (
                  <div key={index} className={`message-item`}>
                    <strong>{msg.nickname}:</strong> {msg.content}
                  </div>
                );
              })}
              {/* 스크롤의 기준점이 될 빈 div */}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="메시지를 입력하세요..."
              />
              <button onClick={sendMessage}>&gt;</button>
            </div>
          </>
        ) : (
          // 채팅방이 선택되지 않은 경우: 채팅방 목록 UI
          <>
            <div className="chat-header">
              <span className="header-title">채팅 목록</span>
              <button
                className="close-btn"
                onClick={() => setIsLauncherOpen(false)}
              >
                &times;
              </button>
            </div>
            <ChatRoomList onSelectRoom={setActivePlan} />
          </>
        )}
      </div>

      {/* 채팅 아이콘 버튼 */}
      <button
        className="chat-bubble"
        onClick={() => setIsLauncherOpen(!isLauncherOpen)}
      >
        {isLauncherOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {" "}
            <line x1="18" y1="6" x2="6" y2="18"></line>{" "}
            <line x1="6" y1="6" x2="18" y2="18"></line>{" "}
          </svg>
        ) : (
          // 채팅 아이콘
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}

export default Chat;
