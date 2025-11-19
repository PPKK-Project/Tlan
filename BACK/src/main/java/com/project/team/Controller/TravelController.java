package com.project.team.Controller;

import com.project.team.Dto.Travel.CreateTravelRequest;
import com.project.team.Dto.Travel.TravelResponse;
import com.project.team.Dto.Travel.UpdateTravelRequest;
import com.project.team.Entity.Travel;
import com.project.team.Repository.TravelRepository;
import com.project.team.Repository.UserRepository;
import com.project.team.Service.TravelService;
import com.project.team.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TravelController {

    private final TravelService travelService;

    // 새로운 여행 계획 생성
    @PostMapping("/travels")
    public ResponseEntity<Travel> createTravel(@RequestBody CreateTravelRequest dto, Principal principal) {
        return travelService.createTravel(dto, principal);
    }

    // 사용자가 접근 가능한 모든 여행 목록 조회
    @GetMapping("/travels")
    public ResponseEntity<List<Travel>> getTravels(Principal principal) {
        return travelService.getTravels(principal);
    }

//    특정 여행의 상세 정보 조회(날짜 확인 용)
    @GetMapping("/travels/{travelId}")
    public ResponseEntity<TravelResponse> getTravelDetails(@PathVariable Long travelId, Principal principal) {
        return ResponseEntity.ok(travelService.getTravelDetails(travelId, principal));
    }

    // 특정 여행의 기본 정보 수정
    @PutMapping("/travels/{travelId}")
    public ResponseEntity<TravelResponse> updateTravel(@PathVariable Long travelId,
                                                       @RequestBody UpdateTravelRequest request,
                                                       Principal principal) {
        return ResponseEntity.ok(travelService.updateTravel(travelId, request, principal));
    }

    // 특정 여행 삭제 (OWNER만 가능)
    @DeleteMapping("/travels/{travelId}")
    public ResponseEntity<?> deleteTravel(@PathVariable Long travelId , Principal principal) {
        travelService.deleteTravel(travelId,principal);
        return ResponseEntity.noContent().build();
    }

}
