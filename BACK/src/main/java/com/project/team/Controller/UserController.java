package com.project.team.Controller;

import com.project.team.Dto.PatchUsersRecord;
import com.project.team.Dto.UserSignUpRequest;
import com.project.team.Entity.User;
import com.project.team.Service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@Tag(name = "사용자 API", description = "사용자 계정 및 정보 관련 API")
@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원 가입
    @Operation(summary = "회원 가입", description = "새로운 사용자 계정을 생성하고 인증 이메일을 발송합니다.")
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserSignUpRequest dto) {
        return userService.signUp(dto);
    }

    // 닉네임 수정
    @Operation(summary = "닉네임 수정", description = "현재 로그인한 사용자의 닉네임을 수정합니다.")
    @PatchMapping("/users")
    public ResponseEntity<Void> patchNickname(@RequestBody PatchUsersRecord dto, Principal principal) {
        return userService.patchNickname(dto, principal);
    }
    // 닉네임 조회
    @Operation(summary = "닉네임 조회", description = "현재 로그인한 사용자의 닉네임을 조회합니다.")
    @GetMapping("/users/nickname")
    public String getNickname(Principal principal){
        return userService.getNickname(principal);
    }
}
