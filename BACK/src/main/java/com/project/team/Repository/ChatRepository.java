package com.project.team.Repository;

import com.project.team.Entity.Chat;
import com.project.team.Entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat,Long> {
    List<Chat> findByTravelId(Long travelId);
}
