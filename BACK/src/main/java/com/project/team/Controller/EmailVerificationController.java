package com.project.team.Controller;

import com.project.team.Entity.EmailVerificationToken;
import com.project.team.Entity.User;
import com.project.team.Repository.EmailVerificationTokenRepository;
import com.project.team.Repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Tag(name = "인증 API")
@RestController
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    @Operation(summary = "이메일 주소 인증", description = "회원가입 시 발송된 이메일의 인증 링크를 통해 계정을 활성화합니다.")
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다."));

        // 만료 시간 null 체크
        LocalDateTime expireDate = verificationToken.getExpireDate();
        if (expireDate != null && expireDate.isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "토큰이 만료되었습니다."
            );
        }

        // 토큰에 유저가 안 달려있는 경우 방어
        User user = verificationToken.getUser();
        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "토큰에 연결된 사용자 정보가 없습니다."
            );
        }

        if(user.isEmailVerified()) {
            return ResponseEntity.ok("이미 이메일 인증이 완료된 계정입니다.");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        tokenRepository.delete(verificationToken);

        return ResponseEntity.ok("이메일 인증이 완료되었습니다.");

    }

}
