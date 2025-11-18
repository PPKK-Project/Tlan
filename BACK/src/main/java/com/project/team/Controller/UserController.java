package com.project.team.Controller;

import com.project.team.Dto.PatchUsersRecord;
import com.project.team.Dto.UserSignUpRequest;
import com.project.team.Entity.User;
import com.project.team.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원 가입
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserSignUpRequest dto) {
        return userService.signUp(dto);
    }

    // 닉네임 수정
    @PatchMapping("/users")
    public ResponseEntity<Void> patchNickname(@RequestBody PatchUsersRecord dto, Principal principal) {
        return userService.patchNickname(dto, principal);
    }

}
