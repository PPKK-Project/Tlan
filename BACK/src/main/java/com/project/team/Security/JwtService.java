package com.project.team.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtService {

//    60000 60초 
    static final long EXPIRATION = 60000*60*3;
    static final String PREFIX = "Bearer";

    // 비밀키 생성
    static final SecretKey key = Jwts.SIG.HS256.key().build();

    public SecretKey getKey() { return key;}    // 다른 곳에서 비밀키를 쓸 수 있게 getter 설정

    // JWT 토큰 생성
    public String getToken(String email, Long userId) {
        return Jwts.builder()
                .subject(email)
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .claim("id",userId)
                .signWith(key)
                .compact();
    }

    // 요청(Request)의 Authorization 헤더에서 토큰 확인 후 username(email)을 가져옴
    public String getAuthUser(HttpServletRequest request) {
        String token = request.getHeader(HttpHeaders.AUTHORIZATION);

        if(token != null) {
            return Jwts.parser()
                    .verifyWith(key)
                    .build().parseSignedClaims(token.replace(PREFIX, "").trim())
                    .getPayload()
                    .getSubject();
        }
        return null;
    }
    public Long getUserId(HttpServletRequest request) {
        String token = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (token != null && token.startsWith(PREFIX)) {
            return getClaims(token).get("id", Long.class);
        }
        return null;
    }

    // 토큰에서 Claims(정보)를 추출하는 private 헬퍼 메서드
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token.replace(PREFIX, "").trim())
                .getPayload();
    }

}
