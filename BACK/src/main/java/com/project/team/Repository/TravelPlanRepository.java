package com.project.team.Repository;

import com.project.team.Entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {

    List<TravelPlan> findByTravelId(Long travelId);

    // 일차(dayNumber)와 순서(sequence)에 따라 정렬하여 조회
    List<TravelPlan> findByTravelIdOrderByDayNumberAscSequenceAsc(Long travelId);
}
