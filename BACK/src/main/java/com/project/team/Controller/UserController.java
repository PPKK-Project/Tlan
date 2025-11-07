package com.project.team.Controller;

import com.project.team.Dto.UserSignUpRequest;
import com.project.team.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 회원 가입
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserSignUpRequest signUpRequest) {
        return userService.signUp(signUpRequest);
    }

}
