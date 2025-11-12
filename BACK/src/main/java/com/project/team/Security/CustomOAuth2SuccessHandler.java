package com.project.team.Security;

import com.project.team.Repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtService jwtService;
    private final UserRepository userRepository;

//    @Value("${oauth2.success.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // OAuth2 인증 성공 후 호출됨
        OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuthUser.getAttributes();
        String username = null;

        // 1. Google 로그인인지 확인
        if (attributes.containsKey("sub")) {
            // Google은 'email'이 최상위에 있음
            username = (String) attributes.get("email");
        }
        // 2. Naver 로그인인지 확인
        else if (attributes.containsKey("response")) {
            // Naver는 "response" 맵 안에 'email'이 있음
            Map<String, Object> responseMap = (Map<String, Object>) attributes.get("response");
            username = (String) responseMap.get("email");
        }

        // 3. username이 여전히 null인지 검사 (정보 제공에 동의하지 않았거나, email이 없는 경우)
        if (username == null) {
            // oAuthUser.getName()은 공급자가 제공하는 고유 ID (sub, id 등)이다.
            logger.warn("OAuth2에서 email을 추출할 수 없습니다. 고유 ID로 대체합니다: " + oAuthUser.getName());
            username = "oauth2user_" + oAuthUser.getName();
        }
        // JWT 토큰 생성
        String token = jwtService.getToken(username,userRepository.findByEmail(username).get().getId());
        // 프론트엔드로 리다이렉트 URL 생성(토큰을 쿼리 파라미터로 추가해줘야한다.)
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUrl)
                .queryParam("token", token)
                .build()
                .encode(StandardCharsets.UTF_8) // UTF-8 인코딩 추가
                .toUriString();
        // 기존의 세션 제거
        clearAuthenticationAttributes(request);
        // 생성된 URL로 리다이렉트
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}