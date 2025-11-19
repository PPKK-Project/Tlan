package com.project.team.Controller;

import com.project.team.Dto.Chat.ChatMessageRequest;
import com.project.team.Service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @MessageMapping("/chat/message/{travelId}")
    public void handleMessage(@DestinationVariable Long travelId,
                              @Payload @Valid ChatMessageRequest request,
                              Principal principal) {
        chatService.saveAndBroadcastMessage(travelId, request, principal);
    }
}
