package com.project.team.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user; // 알림을 받는 사용자

    @Column(nullable = false)
    private String content; // 알림 내용

    private String relatedUrl; // 클릭 시 이동할 URL

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt; // 생성 시간

    @Builder
    public Notification(User user, String content, String relatedUrl,LocalDateTime createdAt) {
        this.user = user;
        this.content = content;
        this.relatedUrl = relatedUrl;
        this.createdAt = createdAt;
    }
}
