package com.project.team.Controller.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Service.API.EmergencyService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyService emergencyService;

    @GetMapping("/emergency/{countryCode}")
    @Operation(summary = "해당 국가 응급 번호 조회", description = "해당 여행지의 응급 전화번호를 조회합니다.")
    public Mono<JsonNode> getEmergencyApi(@PathVariable String countryCode) {
        return emergencyService.fetchEmergencyApiWebClient(countryCode);
    }

}
