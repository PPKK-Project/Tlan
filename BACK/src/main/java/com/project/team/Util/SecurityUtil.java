package com.project.team.Util;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

/**
 * Spring Security 컨텍스트에서 현재 사용자의 데이터를 받아올 수 있는 메서드들을 정의할 클래스.
 * 현재는 사용자의 Email을 받아오는 메서드만 정의함.
 * UserService의 patchNickname메서드 매개변수인 Principal 대신 이곳의 메서드를 쓰면 매개변수가 줄어들고
 * 코드가 간략해지며 유연성이 늘어나니, 혹시 모를 나중을 위해 이 클래스를 남겨둡니다.
 * .
 */
public class SecurityUtil {

    /**
     * SecurityContext에서 인증된 사용자의 이메일(username)을 반환합니다.
     */
    public static String getCurrentUserEmail() {
        // SecurityContext에서 Authentication 객체를 가져옵니다.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            throw new RuntimeException("인증된 사용자가 없습니다.");
        }

        // authentication.getName()은 UserDetailsServiceImpl에서 반환한
        // UserDetails의 getUsername() 값이며,
        // 현재 설정(JwtService, AuthenticationFilter)상 '이메일'입니다.
        return authentication.getName();
    }
}