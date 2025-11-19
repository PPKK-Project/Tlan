package com.project.team.Entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    // 어떤 유저의 인증 토큰인지
    @OneToOne
    @JoinColumn(name ="user_id", nullable = false)
    private User user;

    // 만료 시간
    @Column(nullable = false)
    private LocalDateTime expireDate;

    // 이메일 인증 토큰을 만들 때 항상 기본으로 30분짜리로 만들어 줌
    public static EmailVerificationToken create(User user) {
        EmailVerificationToken t = new EmailVerificationToken();
        t.token = UUID.randomUUID().toString();
        t.user = user;
        t.expireDate = LocalDateTime.now().plusMinutes(30);
        return t;
    }

}
