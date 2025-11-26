package com.project.team.Service.API;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class EmergencyService {

    private final WebClient emergencyApiWebClient;

    public EmergencyService(
            @Qualifier("emergencyApiWebClient") WebClient emergencyApiWebClient) {
        this.emergencyApiWebClient = emergencyApiWebClient;
    }

    public Mono<JsonNode> fetchEmergencyApiWebClient(String countryCode) {
        return emergencyApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/" + countryCode)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

}
