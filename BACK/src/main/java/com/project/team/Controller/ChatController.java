package com.project.team.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private int counter = 0; // 서버 메모리 내의 단순 카운터

    @MessageMapping("/chat/message")
    public void handleMessage(String message) {
        System.out.println(message);
        messagingTemplate.convertAndSend("/chat/message", message);

    }
}
