package com.project.team.Repository;

import com.project.team.Entity.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {

    List<TravelPlan> findByTravelId(Long travelId);

    // 일차(dayNumber)와 순서(sequence)에 따라 정렬하여 조회
    List<TravelPlan> findByTravelIdOrderByDayNumberAscSequenceAsc(Long travelId);

    // 특정 여행의 특정 일차(dayNumber)에 해당하는 일정만 순서대로 가져오기
    List<TravelPlan> findByTravelIdAndDayNumberOrderBySequenceAsc(Long travelId, int dayNumber);
}
