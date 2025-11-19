package com.project.team.Dto.Chat;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        @Schema(description = "채팅 메시지 내용", example = "안녕하세요!")
        @NotBlank(message = "내용을 입력해주세요.") String content
) {}