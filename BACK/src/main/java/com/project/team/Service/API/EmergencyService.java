package com.project.team.Service.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Repository.TravelRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class EmergencyService {

    private final WebClient emergencyApiWebClient;
    private final TravelRepository travelRepository;

    public EmergencyService(
            @Qualifier("emergencyApiWebClient") WebClient emergencyApiWebClient, TravelRepository travelRepository) {
        this.emergencyApiWebClient = emergencyApiWebClient;
        this.travelRepository = travelRepository;
    }

    public Mono<JsonNode> fetchEmergencyApiWebClient(Long travelId) {

        String countryCode = travelRepository.findCountryCodeByTravelId(travelId)
                .orElseThrow(() -> new IllegalArgumentException("해당 여행이 없습니다."));

        return emergencyApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/" + countryCode)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

}
