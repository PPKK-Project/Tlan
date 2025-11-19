package com.project.team.Service;

import com.project.team.Dto.Chat.ChatMessageRequest;
import com.project.team.Dto.Chat.ChatMessageResponse;
import com.project.team.Entity.Chat;
import com.project.team.Entity.Travel;
import com.project.team.Entity.User;
import com.project.team.Exception.ResourceNotFoundException;
import com.project.team.Repository.ChatRepository;
import com.project.team.Repository.TravelRepository;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatRepository chatRepository;
    private final TravelRepository travelRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void saveAndBroadcastMessage(Long travelId, ChatMessageRequest request, Principal principal) {
        // 1. 사용자 및 여행 정보 조회
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new ResourceNotFoundException("여행을 찾을 수 없습니다."));

        // 2. Chat 엔티티 생성 및 DB에 저장
        System.out.println(user);
        Chat chat = new Chat(travel, user, request.content());
        Chat savedChat = chatRepository.save(chat);
        System.out.println(chat);

        // 3. 응답 DTO 생성
        ChatMessageResponse response = new ChatMessageResponse(savedChat);

        // 4. 해당 여행 채팅방을 구독 중인 클라이언트들에게 메시지 브로드캐스팅
        messagingTemplate.convertAndSend("/chat/travels/" + travelId, response);
    }
}