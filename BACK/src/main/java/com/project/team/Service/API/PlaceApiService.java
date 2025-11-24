package com.project.team.Service.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Dto.API.PlaceApiRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
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
                        .queryParam("location", placeApiRequest.lat() + "," + placeApiRequest.lon())
                        .queryParam("radius", placeApiRequest.radius())
                        .queryParam("type", placeApiRequest.type())
                        .queryParam("key", placeApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    /**
     * Google Place ID를 사용하여 장소의 상세 정보(전화번호, 영업시간 등)를 요청합니다.
     */
    public Mono<JsonNode> fetchPlaceDetails(String googlePlaceId) {
        // 요청할 json 필드를 명시
        String fields = "formatted_phone_number,opening_hours(open_now,weekday_text),permanently_closed";

        return placeApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/maps/api/place/details/json")
                        .queryParam("place_id", googlePlaceId)
                        .queryParam("fields", fields)
                        .queryParam("key", placeApiKey)
                        .queryParam("language", "ko")
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class); // API 응답을 JsonNode로 받음
    }

    /**
     * Geocoding API를 이용해 프론트엔드의 검색창에서 특정 장소를 입력받아 그 장소의 위도/경도 좌표를 반환합니다.
     */
    public Mono<JsonNode> fetchGeocodingApiData(String address) {
        return placeApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/maps/api/geocode/json")
                        .queryParam("address", address)
                        .queryParam("key", placeApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}