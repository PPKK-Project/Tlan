package com.project.team.Controller;

import com.project.team.Dto.AccountCredentials;
import com.project.team.Entity.User;
import com.project.team.Repository.UserRepository;
import com.project.team.Security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "인증 API", description = "로그인 및 인증 관련 API")
@RestController
@RequiredArgsConstructor
public class LoginController {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    @Operation(summary = "일반 로그인", description = "이메일과 비밀번호로 로그인하고, 성공 시 응답 헤더에 JWT 토큰을 반환합니다.")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AccountCredentials credentials) {
        UsernamePasswordAuthenticationToken creds = new UsernamePasswordAuthenticationToken(credentials.email(), credentials.password());

        Authentication auth = authenticationManager.authenticate(creds);

        // 인증된 이메일로 User 조회
        String email = auth.getName(); // 일반적으로 username(email) 이 들어있음
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 이메일 인증 여부 체크
        if (!user.isEmailVerified()) {
            // 401(Unauthorized) 또는 403(Forbidden) 중에 취향대로 선택
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요."
            );
        }

        String jwt = jwtService.getToken(auth.getName(), userRepository.findByEmail(auth.getName()).get().getId());

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Authorization")
                .build();
    }

}
