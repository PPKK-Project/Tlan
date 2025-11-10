package com.project.team.Controller;

import com.project.team.Dto.Travel.CreateTravelRequest;
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

//    // 특정 여행의 상세 정보 조회
//    @GetMapping("/travels/{travelId}")
//    public ResponseEntity<?> getTravelDetails(@PathVariable Long travelId) {
//        return travelService.getTravelDetails(travelId);
//    }

    // 특정 여행의 기본 정보 수정
    @PutMapping("/travels/{travelId}")
    public ResponseEntity<Void> putTravel(@PathVariable Long travelId, @RequestBody String title) {
        return travelService.putTravel(travelId, title);
    }

    // 특정 여행 삭제 (OWNER만 가능)
    @DeleteMapping("/travels/{travelId}")
    public ResponseEntity<?> deleteTravel(@PathVariable Long travelId) {
        return travelService.deleteTravel(travelId);
    }

}
