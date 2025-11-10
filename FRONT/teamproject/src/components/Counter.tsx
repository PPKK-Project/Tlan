import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import TravelPathViewer from '../TravelPathViewer';

function Counter() {
    // 1. 상태 정의
    const [stompClient, setStompClient] = useState(null);
    const [inputMessage, setInputMessage] = useState(''); // 사용자가 입력하는 메시지
    // ⭐️ 지도 컴포넌트에 전달할 경로 데이터 상태 (초기값: 빈 배열)
    const [tripData, setTripData] = useState([]);

    // 2. 웹소켓 연결 및 구독 로직
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-stomp'),
            onConnect: () => {
                console.log('STOMP 연결 성공!');
                setStompClient(client);

                // 서버가 브로드캐스트하는 '/topic/message' 구독
                client.subscribe('/topic/message', (frame) => {
                    const receivedBody = JSON.parse(frame.body);

                    console.log('실시간 메시지 수신:', receivedBody.content);

                    // ⭐️ 받은 메시지를 경로 데이터(JSON 배열)로 파싱 시도
                    try {
                        const newTripData = JSON.parse(receivedBody.content);
                        setTripData(newTripData); // 경로 데이터 업데이트
                        console.log('경로 데이터 업데이트 완료:', newTripData);
                    } catch (e) {
                        console.log('error')
                    }
                });
            },
            onStompError: (frame) => {
                console.error('브로커 에러:', frame);
            },
        });

        client.activate();
        return () => {
            if (client.connected) {
                client.deactivate();
            }
        };
    }, []);

    // 3. 서버로 메시지 발행(Publish) 함수
    const sendMessage = () => {
        if (stompClient && stompClient.connected) {

            // ⭐️ JSON 문자열을 content에 담아 서버로 전송
            const messagePayload = {
                sender: 'Client',
                content: inputMessage // 사용자가 입력한 메시지 (JSON 문자열을 기대)
            };

            stompClient.publish({
                destination: '/app/chat/message',
                body: JSON.stringify(messagePayload)
            });

            setInputMessage('');
            console.log('메시지 발행:', inputMessage);
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <TravelPathViewer tripData={tripData} />
                <div className="flex flex-col md:flex-row justify-center items-center mb-6 p-4 bg-white rounded-lg shadow-md">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => { setInputMessage(e.target.value) }}
                        placeholder="JSON 경로 데이터 또는 일반 메시지를 입력하세요"
                        className="flex-grow p-2 border border-gray-300 rounded-md mb-2 md:mb-0 md:mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!stompClient || !inputMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        메시지 보내기
                    </button>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                    {stompClient ? '✅ 웹소켓 연결됨' : '❌ 웹소켓 연결 중...'}
                </p>
            </div>
        </div>
    );
}

export default Counter;