package com.project.team.Security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtService {

    static final long EXPIRATIONTIME = 600000;
    static final String PREFIX = "Bearer ";

    // 비밀키 생성
    static final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // JWT 토큰 생성
    public String getToken(String email) {
        String token = Jwts.builder()
                .subject(email)
                .expiration(new Date(System.currentTimeMillis() + EXPIRATIONTIME))
                .signWith(key)
                .compact();
        return token;
    }

    // 요청(Request)의 Authorization 헤더에서 토큰 확인 후 username(email)을 가져옴
    public String getAuthUser(HttpServletRequest request) {
        String token = request.getHeader(HttpHeaders.AUTHORIZATION);

        if(token != null) {
            String user = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token.replace(PREFIX, ""))
                    .getBody()
                    .getSubject();

            if(user != null) {
                return user;
            }
        }
        return null;
    }


}
