package com.project.team.Security;

import com.project.team.Service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;
    private final AuthEntryPoint authEntryPoint;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationFilter authenticationFilter() {
        return new AuthenticationFilter(jwtService, userDetailsService);
    }

    // 애플리케이션의 보안 정책(인증/인가/세션/CORS 등) 을 전부 설정
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)  // CSRF 보호 비활성화(Stateless JWT 사용)
                .cors(Customizer.withDefaults())    // CORS 설정(이하의 설정 사용) 어떤 로컬호스트를 기준으로 할것인가 설정
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))   // 세션 대신 JWT를 사용하므로 세션 비활성화
                .authorizeHttpRequests(auth -> auth
                        // login 엔드포인트의 POST 요청은 모두 허용
                        .requestMatchers(HttpMethod.POST, "/login", "/signup").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                        .requestMatchers("/ws-stomp/**").permitAll()
                        .anyRequest().authenticated())
                // oauth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(customOAuth2SuccessHandler))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint))   // 인증 실패 시 처리
                .addFilterBefore(authenticationFilter(), UsernamePasswordAuthenticationFilter.class);   // JWT 필터 추가
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 허용할 프론트 엔드 주소
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        // 허용할 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PULL", "DELETE", "PATCH"));
        // 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList("*"));    // 모든 헤더 허용
        // 쿠키나 인증 정보 허용
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로에 대해 CORS 정책 허용
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
