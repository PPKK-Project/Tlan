import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

type ChatMessage = {
  sender: string;
  content: string;
};

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sender, setSender] = useState(
    "Guest" + Math.floor(Math.random() * 1000)
  ); // 기본값
  const clientRef = useRef<Client | null>(null);

  // 컴포넌트 마운트 시 사용자 닉네임을 가져옵니다.
  useEffect(() => {
    const fetchUserNickname = async () => {
      try {
        // 백엔드에서 현재 로그인된 사용자의 정보를 가져오는 API 엔드포인트입니다.
        // 실제 엔드포인트로 수정해야 합니다. (예: /api/members/me)
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/nickname`);
        // 백엔드 응답 데이터 구조에 맞게 'nickname' 필드를 사용합니다.
        if (response.data) {
          setSender(response.data);
        }
      } catch (error) {
        console.error("사용자 닉네임을 가져오는 데 실패했습니다:", error);
      }
    };
    fetchUserNickname();
  }, []);
  useEffect(() => {
    // 1. STOMP 클라이언트 생성
    const client = new Client({
      // 2. SockJS를 웹소켓 생성 팩토리로 설정
      webSocketFactory: () => new SockJS("http://localhost:8080/ws-stomp"),
      debug: (str) => {
        console.log(new Date(), str);
      },
      reconnectDelay: 5000, // 5초마다 재연결 시도
      onConnect: () => {
        console.log("STOMP client connected");
        // 3. '/topic/public' 채널 구독
        client.subscribe("/chat/message", (message) => {
          const receivedMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    // 클라이언트 활성화
    client.activate();
    clientRef.current = client;

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log("STOMP client disconnected");
      }
    };
  }, []);

  // 4. 메시지 전송 함수
  const sendMessage = () => {
    if (
      clientRef.current &&
      clientRef.current.connected &&
      inputMessage.trim() !== ""
    ) {
      const chatMessage: ChatMessage = {
        sender: sender,
        content: inputMessage,
      };
      // 5. '/app/chat/message' 목적지로 메시지 발행
      clientRef.current.publish({
        destination: "/app/chat/message",
        body: JSON.stringify(chatMessage),
      });
      setInputMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>실시간 채팅</h2>
      <div
        className="messages-area"
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll",
          marginBottom: "10px",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요..."
          style={{ width: "80%", padding: "8px" }}
        />
        <button onClick={sendMessage} style={{ width: "18%", padding: "8px" }}>
          전송
        </button>
      </div>
    </div>
  );
}

export default Chat;
