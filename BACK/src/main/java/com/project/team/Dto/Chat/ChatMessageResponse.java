package com.project.team.Dto.Chat;

import com.project.team.Entity.Chat;
import lombok.Getter;

@Getter
public class ChatMessageResponse {
    private final Long chatId;
    private final String content;
    private final Long senderId;
    private final String senderNickname;

    public ChatMessageResponse(Chat chat) {
        this.chatId = chat.getId();
        this.content = chat.getContent();
        this.senderId = chat.getUser().getId();
        this.senderNickname = chat.getUser().getNickname();
    }
}