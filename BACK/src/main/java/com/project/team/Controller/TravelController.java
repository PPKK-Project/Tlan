package com.project.team.Controller;

import com.project.team.Dto.Travel.AddPlanRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.TravelPlan;
import com.project.team.Service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
=======
>>>>>>> main
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

<<<<<<< HEAD
    @PostMapping("/travels/{travelId}/attractions")
    public ResponseEntity<Travel> addAttractions(
            @PathVariable Long travelId, Principal principal,
            Attraction attraction) {
        return travelService.addAttractions(travelId, principal, attraction);
    }
    @PostMapping("/travels/{travelId}/accommodations")
    public ResponseEntity<Travel> addAccommodations(
            @PathVariable Long travelId, Principal principal,
            Accommodation accommodation) {
        return travelService.addAccommodations(travelId, principal, accommodation);
    }
    @PostMapping("/travels/{travelId}/restaurants")
    public ResponseEntity<Travel> addRestaurants(
            @PathVariable Long travelId, Principal principal,
            Restaurant restaurant) {
        return travelService.addRestaurants(travelId, principal, restaurant);
    }

    @GetMapping("/travels")
    public ResponseEntity<List<Travel>> getTravel(Principal principal) {
        return travelService.getTravel(principal);
    }

    @GetMapping("/travels/{travelId}")
    public ResponseEntity<Travel> getTravelById(
            @PathVariable Long travelId, Principal principal) {
        return travelService.getTravelById(travelId, principal);
    }

    @DeleteMapping("/travels/{travelId}")
    public ResponseEntity<?> deleteTravelById(@PathVariable Long travelId, Principal principal) {
        return travelService.deleteTravelById(travelId, principal);
    }
    @DeleteMapping("/attractions/{itemId}")
    public ResponseEntity<?> deleteAttractionsById(@PathVariable Long itemId, Principal principal) {
        return travelService.deleteAttractionsById(itemId, principal);
    }
    @DeleteMapping("/accommodations/{itemId}")
    public ResponseEntity<?> deleteAccommodationsById(@PathVariable Long itemId, Principal principal) {
        return travelService.deleteAccommodationsById(itemId, principal);
    }
    @DeleteMapping("/restaurants/{itemId}")
    public ResponseEntity<?> deleteRestaurantsById(@PathVariable Long itemId, Principal principal) {
        return travelService.deleteRestaurantsById(itemId, principal);
    }



=======
>>>>>>> main
}
