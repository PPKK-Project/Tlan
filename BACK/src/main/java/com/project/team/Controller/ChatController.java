package com.project.team.Controller;

import com.project.team.Dto.Chat.ChatMessageRequest;
import com.project.team.Dto.Chat.ChattingResponse;
import com.project.team.Entity.Chat;
import com.project.team.Service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {
	private final ChatService chatService;

	@Tag(name = "채팅 API", description = "실시간 채팅 관련 API")
	@Operation(summary = "채팅 메시지 전송", description = "특정 여행 채팅방에 메시지를 전송합니다.")
	@MessageMapping("/chat/message/{travelId}")
	public void handleMessage(
			@Parameter(description = "메시지를 보낼 여행의 ID") @DestinationVariable Long travelId,
			@Parameter(description = "채팅 메시지 내용") @Payload @Valid ChatMessageRequest request,
			Principal principal) {
		chatService.saveAndBroadcastMessage(travelId, request, principal);
	}
    @MessageMapping("/travels/{travelId}")
    public void handlePlan(@DestinationVariable Long travelId, @Payload String isUpdated) {
        chatService.isUpdate(travelId, isUpdated);
    }


	@GetMapping("/chat/message/{travelId}")
	public ResponseEntity<List<ChattingResponse>> saveChat(@PathVariable Long travelId){
		return chatService.saveChat(travelId);
	}
}
