package com.project.team.Security;

import com.project.team.Entity.User;
import com.project.team.Repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
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

    @Value("${oauth2.success.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // OAuth2 인증 성공 후 호출됨
        OAuth2User oAuthUser = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuthUser.getAttributes();
        String username = null;
        String registrationId = null; // 공급자 식별자 추가

        // 1. 공급자 식별 (registrationId 얻기)
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            registrationId = oauthToken.getAuthorizedClientRegistrationId();
        }

        // 2. 공급자별 이메일 추출
        // Google, Kakao, Naver 모두 처리
        if ("google".equals(registrationId) || "kakao".equals(registrationId)) {
            // Google은 최상위, Kakao는 user-name-attribute 설정에 따라 평탄화되었을 수 있음
            // 최상위에서 'email'을 먼저 시도
            if (attributes.containsKey("email")) {
                username = (String) attributes.get("email");
            }
            // 카카오의 경우 평탄화되지 않았다면 'kakao_account'를 통해 접근 (기존 코드 유지)
            else if ("kakao".equals(registrationId) && attributes.containsKey("kakao_account")) {
                Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                username = (String) kakaoAccount.get("email"); // 이메일 동의 필수
            }
        }
        // Naver 전용 처리
        else if ("naver".equals(registrationId) && attributes.containsKey("response")) {
            // 네이버는 'response' 맵 안에 이메일이 있습니다.
            Map<String, Object> responseMap = (Map<String, Object>) attributes.get("response");
            if (responseMap.containsKey("email")) {
                username = (String) responseMap.get("email");
            }
        }


        // 3. username이 여전히 null인 경우 (개선된 대체 로직)
        if (username == null) {
            // WARNING: 이 코드가 실행되면 DB에 저장되는 email이 유효한 email 형식이 아니며,
            // 토큰으로 사용자 검색 시 찾지 못할 가능성이 높습니다.
            // 하지만 일단 DB에 저장 가능한 유니크한 ID로 만듭니다.
            String uniqueId = oAuthUser.getName(); // 공급자 고유 ID
            String provider = registrationId != null ? registrationId : "unknown";

            // WARN 로그는 유지하되, oAuthUser.getName()이 객체 전체 문자열이 아닌
            // 순수한 고유 ID만 포함하도록 처리해야 합니다.
            logger.warn("OAuth2에서 email을 추출할 수 없습니다. provider: "+provider+" | 고유 ID로 대체합니다: "+uniqueId);

            // JWT의 'subject'로 사용될 email 필드 값 설정
            username = provider + "_user_" + uniqueId;
        }
        // JWT 토큰 생성
        final String finalUsername = username;
        User user = userRepository.findByEmail(username)
                .orElseGet(() -> new User(finalUsername, "social", "SocialUser"));
        user.setEmailVerified(true);
        userRepository.save(user);
        String token = jwtService.getToken(user.getEmail(), user.getId());
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