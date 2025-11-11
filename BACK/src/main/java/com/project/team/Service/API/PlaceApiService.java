package com.project.team.Service.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Dto.API.PlaceApiRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PlaceApiService {
    private final WebClient placeApiWebClient;

    @Value("${api.key.place}")
    private String placeApiKey;

    // 매개변수는 request ? dto?
    public Mono<JsonNode> fetchPlaceApiData(PlaceApiRequest placeApiRequest) {
        return placeApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/maps/api/place/nearbysearch/json")
                        .queryParam("keyword", placeApiRequest.keyword())
                        .queryParam("location", placeApiRequest.lat()+","+placeApiRequest.lon())
                        .queryParam("radius", placeApiRequest.radius())
                        .queryParam("type", placeApiRequest.type())
                        .queryParam("key", placeApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .contextCapture();
    }
}
