package com.project.team.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {
    private final SimpMessagingTemplate messagingTemplate;
    private int counter = 0; // 서버 메모리 내의 단순 카운터

    // 클라이언트가 '/app/counter/increase'로 메시지를 보낼 때 호출
    @MessageMapping("/counter/increase")
    public void handleCounterIncrease() {
        // 1. 서버 메모리 내의 값 증가
        counter++;

        // 2. 증가된 값을 "/topic/counter"를 구독하는 모든 클라이언트에게 브로드캐스트
        // Simple String으로 값을 보냅니다. (JSON 객체 대신)
        String message = String.valueOf(counter);

        // 3. 메시지 전송
        // '/topic/counter'를 구독하는 모든 클라이언트에게 현재 카운트 값을 보냅니다.
        messagingTemplate.convertAndSend("/topic/counter", message);
    }

    @MessageMapping("/chat/message")
    public void handleMessage(String message) {
        messagingTemplate.convertAndSend("/topic/message", message);
    }
}