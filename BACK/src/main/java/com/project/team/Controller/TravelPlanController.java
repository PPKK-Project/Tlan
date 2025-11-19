package com.project.team.Controller;

import com.project.team.Dto.Travel.AddPlanRequest;
import com.project.team.Dto.Travel.TravelPlanResponse;
import com.project.team.Dto.Travel.TravelPlanUpdateRequest;
import com.project.team.Entity.User;
import com.project.team.Repository.UserRepository;
import com.project.team.Service.TravelPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "세부 일정 API", description = "여행의 세부 일정(TravelPlan)을 관리합니다.")
@RestController
@RequiredArgsConstructor
@RequestMapping("/travels/{travelId}/plans")
public class TravelPlanController {

    private final TravelPlanService travelPlanService;
    private final UserRepository userRepository;

    public User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("해당 유저를 찾을 수 없습니다."));
    }


    @Operation(summary = "세부 일정 목록 조회", description = "특정 여행에 포함된 모든 세부 일정을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<TravelPlanResponse>> getTravelPlans(
            @Parameter(description = "일정을 조회할 여행의 ID") @PathVariable Long travelId,
            Principal principal) {
        List<TravelPlanResponse> responses = travelPlanService.getTravelPlans(travelId, findUser(principal.getName()));
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "세부 일정 수정", description = "특정 세부 일정의 날짜, 순서, 메모를 수정합니다.")
    @PutMapping("/{planId}")
    public ResponseEntity<TravelPlanResponse> updateTravelPlan(
            @Parameter(description = "수정할 일정이 속한 여행의 ID") @PathVariable Long travelId,
            @Parameter(description = "수정할 세부 일정의 ID") @PathVariable Long planId,
            @RequestBody @Valid TravelPlanUpdateRequest request,
            Principal principal) {
        TravelPlanResponse response = travelPlanService.updateTravelPlan(travelId, planId, request, findUser(principal.getName()));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "세부 일정 삭제", description = "특정 세부 일정을 삭제합니다.")
    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deleteTravelPlan(
            @Parameter(description = "삭제할 일정이 속한 여행의 ID") @PathVariable Long travelId,
            @Parameter(description = "삭제할 세부 일정의 ID") @PathVariable Long planId,
            Principal principal
    ){ travelPlanService.deleteTravelPlan(travelId,planId,findUser(principal.getName()));
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "세부 일정 추가", description = "여행에 새로운 장소와 계획을 추가합니다.")
    @PostMapping
    public ResponseEntity<TravelPlanResponse> addPlanToTravel(
            @Parameter(description = "일정을 추가할 여행의 ID") @PathVariable Long travelId,
            @RequestBody @Valid AddPlanRequest request,
            Principal principal) {
        TravelPlanResponse response = travelPlanService.addPlan(travelId, request, findUser(principal.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
