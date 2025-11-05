package com.project.team.Controller.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Service.API.PlaceApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class PlaceApiController {

    private final PlaceApiService placeApiService;

    @GetMapping("/api/place")
    public Mono<JsonNode> getPlaceApi() {
        return placeApiService.fetchPlaceApiData("food", "35.15289466583233", "129.05960054547748", "3000", "food");
    }
}
