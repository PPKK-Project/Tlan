package com.project.team.Service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class PlaceApiService {
    private final WebClient placeApiWebClient;

    @Value("${api.key.place}")
    private String placeApiKey;

    public PlaceApiService(
            @Qualifier("placeApiWebClient") WebClient placeApiWebClient) {
        this.placeApiWebClient = placeApiWebClient;
    }

    // 매개변수는 request ? dto?
    public Mono<JsonNode> fetchPlaceApiData(String keyword, String lat, String lng, String radius, String type) {
        return placeApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/maps/api/place/nearbysearch/json")
                        .queryParam("keyword", keyword)
                        .queryParam("location", lat+","+lng)
                        .queryParam("radius", radius)
                        .queryParam("type", type)
                        .queryParam("key", placeApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}
