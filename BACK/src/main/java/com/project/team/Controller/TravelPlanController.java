package com.project.team.Controller;

import com.project.team.Dto.Travel.AddPlanRequest;
import com.project.team.Dto.Travel.TravelPlanResponse;
import com.project.team.Dto.Travel.TravelPlanUpdateRequest;
import com.project.team.Entity.User;
import com.project.team.Repository.UserRepository;
import com.project.team.Service.TravelPlanService;
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


    @GetMapping
    public ResponseEntity<List<TravelPlanResponse>> getTravelPlans(
            @PathVariable Long travelId,
            Principal principal) {
        List<TravelPlanResponse> responses = travelPlanService.getTravelPlans(travelId, findUser(principal.getName()));
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{planId}")
    public ResponseEntity<TravelPlanResponse> updateTravelPlan(
            @PathVariable Long travelId,
            @PathVariable Long planId,
            @RequestBody @Valid TravelPlanUpdateRequest request,
            Principal principal) {
        TravelPlanResponse response = travelPlanService.updateTravelPlan(travelId, planId, request, findUser(principal.getName()));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deleteTravelPlan(
            @PathVariable Long travelId,
            @PathVariable Long planId,
            Principal principal
    ){ travelPlanService.deleteTravelPlan(travelId,planId,findUser(principal.getName()));
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<TravelPlanResponse> addPlanToTravel(
            @PathVariable Long travelId,
            @RequestBody @Valid AddPlanRequest request,
            Principal principal) {
        TravelPlanResponse response = travelPlanService.addPlan(travelId, request, findUser(principal.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
