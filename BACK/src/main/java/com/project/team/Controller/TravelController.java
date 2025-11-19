package com.project.team.Controller;

import com.project.team.Dto.Travel.CreateTravelRequest;
import com.project.team.Dto.Travel.TravelResponse;
import com.project.team.Dto.Travel.UpdateTravelRequest;
import com.project.team.Entity.Travel;
import com.project.team.Repository.TravelRepository;
import com.project.team.Repository.UserRepository;
import com.project.team.Service.TravelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.project.team.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "여행 API", description = "여행(Travel) 생성, 조회, 수정, 삭제를 처리합니다.")
@RestController
@RequiredArgsConstructor
public class TravelController {

    private final TravelService travelService;

    // 새로운 여행 계획 생성
    @Operation(summary = "새로운 여행 생성", description = "새로운 여행 계획을 생성합니다.")
    @PostMapping("/travels")
    public ResponseEntity<Travel> createTravel(@RequestBody CreateTravelRequest dto, Principal principal) {
        return travelService.createTravel(dto, principal);
    }

    // 사용자가 접근 가능한 모든 여행 목록 조회
    @Operation(summary = "내 여행 목록 조회", description = "현재 로그인한 사용자가 생성하거나 공유받은 모든 여행 목록을 조회합니다.")
    @GetMapping("/travels")
    public ResponseEntity<List<Travel>> getTravels(Principal principal) {
        return travelService.getTravels(principal);
    }

//    특정 여행의 상세 정보 조회(날짜 확인 용)
    @Operation(summary = "특정 여행 상세 정보 조회", description = "특정 여행의 제목, 날짜 등 기본 정보를 조회합니다.")
    @GetMapping("/travels/{travelId}")
    public ResponseEntity<TravelResponse> getTravelDetails(
            @Parameter(description = "조회할 여행의 ID") @PathVariable Long travelId, Principal principal) {
        return ResponseEntity.ok(travelService.getTravelDetails(travelId, principal));
    }

    // 특정 여행의 기본 정보 수정
    @Operation(summary = "특정 여행 정보 수정", description = "특정 여행의 제목, 시작일, 종료일을 수정합니다.")
    @PutMapping("/travels/{travelId}")
    public ResponseEntity<TravelResponse> updateTravel(
            @Parameter(description = "수정할 여행의 ID") @PathVariable Long travelId,
            @RequestBody UpdateTravelRequest request,
            Principal principal) {
        return ResponseEntity.ok(travelService.updateTravel(travelId, request, principal));
    }

    // 특정 여행 삭제 (OWNER만 가능)
    @Operation(summary = "특정 여행 삭제", description = "특정 여행을 삭제합니다. (소유자만 가능)")
    @DeleteMapping("/travels/{travelId}")
    public ResponseEntity<?> deleteTravel(
            @Parameter(description = "삭제할 여행의 ID") @PathVariable Long travelId ,
            Principal principal) {
        travelService.deleteTravel(travelId,principal);
        return ResponseEntity.noContent().build();
    }

}
