package com.project.team.Controller.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Service.API.EmbassyService;
import io.swagger.v3.core.util.Json;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Tag(name = "외부 연동 API")
@RestController
@RequiredArgsConstructor
public class EmbassyController {

    private final EmbassyService embassyService;

    @GetMapping("/embassy")
    @Operation(summary = "재외공관 정보 조회", description = "국가명 또는 코드로 재외공관(대사관) 정보를 조회합니다.")
    public Mono<JsonNode> getEmbassyApi(@RequestParam String countryName) {
        return embassyService.fetchEmbassyApiData(countryName);
    }

    @GetMapping("/embassy/travels/{travelId}")
    @Operation(summary = "재외공관 정보 조회", description = "travelId로 해당 여행지의 대사관을 국가 코드로 조회합니다.")
    public Mono<JsonNode> getEmbassyByTravel(@PathVariable Long travelId) {
        return embassyService.fetchEmbassyByTravelId(travelId);
    }
}
