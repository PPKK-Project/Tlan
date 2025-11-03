package com.project.team.Security;

import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtService {

    static final long EXPIRATION = 600000;
    static final String PREFIX = "Bearer ";

    // 비밀키 생성
    static final SecretKey key = Jwts.SIG.HS256.key().build();

    // JWT 토큰 생성
    public String getToken(String email) {
        return Jwts.builder()
                .subject(email)
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();
    }

    // 요청(Request)의 Authorization 헤더에서 토큰 확인 후 username(email)을 가져옴
    public String getAuthUser(HttpServletRequest request) {
        String token = request.getHeader(HttpHeaders.AUTHORIZATION);

        if(token != null) {
            return Jwts.parser()
                    .verifyWith(key)
                    .build().parseSignedClaims(token.replace(PREFIX, ""))
                    .getPayload()
                    .getSubject();
        }
        return null;
    }


}
