package com.project.team.Controller;

import com.project.team.Dto.Travel.CreateTravelRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.User;
import com.project.team.Service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TravelController {
    private final TravelService travelService;

    @PostMapping("/travels")
    public ResponseEntity<Travel> createTravel(
            @AuthenticationPrincipal User user,
            @RequestBody CreateTravelRequest dto) {
        return travelService.createTravel(user, dto);
    }


    @GetMapping("/travels")
    public ResponseEntity<List<Travel>> getTravel(Principal principal) {
        return travelService.getTravel(principal);
    }

    @GetMapping("/travels/{travelId}")
    public ResponseEntity<Travel> getTravelById(@PathVariable Long travelId, Principal principal) {
        return travelService.getTravelById(travelId, principal);
    }


    @DeleteMapping("/travels/{travelId}")
    public ResponseEntity<?> deleteTravelById(@PathVariable Long travelId, Principal principal) {
        return travelService.deleteTravelById(travelId, principal);
    }


}
