package com.project.team.Dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "사용자 정보 수정 요청 DTO")
public record PatchUsersRecord(
        @Schema(description = "현재 비밀번호 (인증용)", example = "currentPassword123") String password,
        @Schema(description = "새로운 닉네임", example = "새로운닉네임") String nickname, String newpassword) {
}
