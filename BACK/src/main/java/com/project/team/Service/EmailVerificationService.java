package com.project.team.Service;

import com.project.team.Entity.EmailVerificationToken;
import com.project.team.Entity.User;
import com.project.team.Repository.EmailVerificationTokenRepository;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    /*
        이메일 인증 토큰을 검증하고, 성공 시 유저를 활성화
    */
    public String verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "유효하지 않은 토큰입니다."
                ));

        // 만료 시간 확인
        LocalDateTime expireDate = verificationToken.getExpireDate();
        if (expireDate != null && expireDate.isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "토큰이 만료되었습니다.");
        }

        User user = verificationToken.getUser();
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "토큰에 연결된 사용자 정보가 없습니다.");
        }

        // 이미 이메일 인증 완료된 경우
        if (user.isEmailVerified()) {
            return "이미 이메일 인증이 완료된 계정입니다.";
        }

        // 이메일 인증 처리
        user.setEmailVerified(true);
        userRepository.save(user);

        // 사용이 끝난 토큰 삭제
        tokenRepository.delete(verificationToken);

        return "이메일 인증이 완료 되었습니다.";
    }
}
