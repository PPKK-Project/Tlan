package com.project.team.Service.API;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class EmbassyService {

    private final WebClient embassyApiWebClient;

    @Value("${api.key.embassy}")
    private String embassyApiKey;

    public EmbassyService(
            @Qualifier("embassyApiWebClient") WebClient embassyApiWebClient) {
        this.embassyApiWebClient = embassyApiWebClient;
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

}
