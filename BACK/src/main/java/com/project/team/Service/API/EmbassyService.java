package com.project.team.Service.API;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Entity.Travel;
import com.project.team.Repository.TravelRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class EmbassyService {

    private final WebClient embassyApiWebClient;
    private final TravelRepository travelRepository;

    @Value("${api.key.embassy}")
    private String embassyApiKey;

    public EmbassyService(
            @Qualifier("embassyApiWebClient") WebClient embassyApiWebClient, TravelRepository travelRepository) {
        this.embassyApiWebClient = embassyApiWebClient;
        this.travelRepository = travelRepository;
    }

    public Mono<JsonNode> fetchEmbassyApiData(String countryName) {
        return embassyApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("1262000/EmbassyService2/getEmbassyList2")
                        .queryParam("pageNo", "1")
                        .queryParam("numOfRows", "30")
                        .queryParam("returnType", "JSON")
                        .queryParam("cond[country_nm::EQ]", countryName)
                        .queryParam("serviceKey", embassyApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);

    }

    public Mono<JsonNode> fetchEmbassyApiDataCountryCode(String countryCode) {
        return embassyApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("1262000/EmbassyService2/getEmbassyList2")
                        .queryParam("pageNo", "1")
                        .queryParam("numOfRows", "30")
                        .queryParam("returnType", "JSON")
                        .queryParam("cond[country_iso_alp2::EQ]", countryCode)
                        .queryParam("serviceKey", embassyApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }

    public Mono<JsonNode> fetchEmbassyByTravelId(Long travelId) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new IllegalArgumentException("해당 여행이 없습니다."));

        String countryCode = travel.getCountryCode();

        return fetchEmbassyApiDataCountryCode(countryCode);
    }

}
