package com.project.team.Controller;

import com.project.team.Dto.Travel.TravelPlanResponse;
import com.project.team.Dto.Travel.TravelPlanUpdateRequest;
import com.project.team.Entity.User;
import com.project.team.Service.TravelPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/travels/{travelId}/plans")
public class TravelPlanController {

    private final TravelPlanService travelPlanService;

    @GetMapping
    public ResponseEntity<List<TravelPlanResponse>> getTravelPlans(
            @PathVariable Long travelId,
            @AuthenticationPrincipal User user) {
        List<TravelPlanResponse> responses = travelPlanService.getTravelPlans(travelId, user);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{planId}")
    public ResponseEntity<TravelPlanResponse> updateTravelPlan(
            @PathVariable Long travelId,
            @PathVariable Long planId,
            @RequestBody @Valid TravelPlanUpdateRequest request,
            @AuthenticationPrincipal User user) {
        TravelPlanResponse response = travelPlanService.updateTravelPlan(travelId, planId, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deleteTravelPlan(
            @PathVariable Long travelId,
            @PathVariable Long planId,
            @AuthenticationPrincipal User user
    ){ travelPlanService.deleteTravelPlan(travelId,planId,user);
        return ResponseEntity.noContent().build();
    }
}
