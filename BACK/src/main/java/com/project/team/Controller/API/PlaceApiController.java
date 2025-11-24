package com.project.team.Controller.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Dto.API.PlaceApiRequest;
import com.project.team.Service.API.PlaceApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Tag(name = "외부 연동 API")
@RestController
@RequiredArgsConstructor
public class PlaceApiController {

    private final PlaceApiService placeApiService;

    @GetMapping("/place")
    @Operation(summary = "Google 장소 검색", description = "키워드와 위치 기반으로 주변 장소를 검색합니다.")
    public Mono<JsonNode> getPlaceApi(PlaceApiRequest placeApiRequest) {
        return placeApiService.fetchPlaceApiData(placeApiRequest);
    }

    @GetMapping("/geocode")
    @Operation(summary = "Google Geocoding API", description = "주소를 입력받아 좌표를 검색합니다.")
    public Mono<JsonNode> getGeocodingApi(@RequestParam String address) {
        return placeApiService.fetchGeocodingApiData(address);
    }


}
