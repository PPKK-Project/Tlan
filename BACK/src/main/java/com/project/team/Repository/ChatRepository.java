package com.project.team.Repository;

import com.project.team.Entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat,Long> {
    // 생성 시간 오름차순 (과거 -> 최신) 으로 정렬하여 채팅 내역 조회
    List<Chat> findByTravelIdOrderByCreatedAtAsc(Long travelId);
}
