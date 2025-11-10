package com.project.team.Service;

import com.project.team.Dto.Travel.TravelPlanResponse;
import com.project.team.Dto.Travel.TravelPlanUpdateRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.TravelPlan;
import com.project.team.Entity.User;
import com.project.team.Exception.AccessDeniedException;
import com.project.team.Exception.ResourceNotFoundException;
import com.project.team.Repository.TravelPlanRepository;
import com.project.team.Repository.TravelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final TravelRepository travelRepository; // TravelRepository 주입

    /**
     * 특정 여행의 전체 일정 목록 조회
     * @param travelId 조회할 여행의 ID
     * @param user 현재 로그인한 사용자 (권한 확인용)
     * @return TravelPlanResponse 리스트
     */
    public List<TravelPlanResponse> getTravelPlans(Long travelId, User user) {
        // 1. 여행 정보 조회 및 소유주 확인
        Travel travel = findTravelAndValidateOwner(travelId, user);

        // 2. Repository를 통해 정렬된 일정 목록 조회
        List<TravelPlan> plans = travelPlanRepository.findByTravelIdOrderByDayNumberAscSequenceAsc(travelId);

        // 3. Entity 리스트를 DTO 리스트로 변환하여 반환
        return plans.stream()
                .map(TravelPlanResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * 특정 일정 항목의 세부 정보 수정
     * @param travelId 여행 ID
     * @param planId 수정할 일정 ID
     * @param request 수정할 정보 DTO
     * @param user 현재 로그인한 사용자
     * @return 수정된 일정 정보
     */
    @Transactional
    public TravelPlanResponse updateTravelPlan(Long travelId, Long planId, TravelPlanUpdateRequest request, User user) {
        // 1. 여행 소유주 확인
        findTravelAndValidateOwner(travelId, user);

        // 2. 수정할 일정 조회
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel Plan not found with id: " + planId));

        // 3. 해당 일정이 올바른 여행에 속해 있는지 확인
        if (!travelPlan.getTravel().getId().equals(travelId)) {
            throw new AccessDeniedException("This plan does not belong to the specified travel.");
        }

        // 4. 엔티티 데이터 수정 (변경 감지로 인해 자동 UPDATE)
        travelPlan.setDayNumber(request.dayNumber());
        travelPlan.setSequence(request.sequence());
        travelPlan.setMemo(request.memo());

        return new TravelPlanResponse(travelPlan);
    }

    private Travel findTravelAndValidateOwner(Long travelId, User user) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel not found with id: " + travelId));
        if (!travel.getUser().getEmail().equals(user.getEmail())) {
            throw new AccessDeniedException("You are not the owner of this travel plan.");
        }
        return travel;
    }

    @Transactional
    public void deleteTravelPlan(Long travelId, Long planId, User user) {
        // 1. 여행 소유주 확인
        findTravelAndValidateOwner(travelId, user);

        // 2. 삭제할 일정 조회
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel Plan not found with id: " + planId));

        if(!travelPlan.getTravel().getId().equals(travelId)){
            throw new AccessDeniedException("This plan does not belong to the specified travel.");

        }
        travelPlanRepository.delete(travelPlan);
    }
}
