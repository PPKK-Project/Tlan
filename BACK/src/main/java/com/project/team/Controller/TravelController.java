package com.project.team.Controller;

import com.project.team.Dto.Travel.AddPlanRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.TravelPlan;
import com.project.team.Service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class TravelController {
    private final TravelService travelService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/travels/{travelId}/plans")
    public ResponseEntity<TravelPlan> addPlanToTravel(
            @PathVariable Long travelId,
            @RequestBody AddPlanRequest request,
            Principal principal) {
        TravelPlan addedPlan = travelService.addPlan(travelId, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(addedPlan);
    }

}
