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

    public Mono<JsonNode> fetchEmbassyApiData(String pageNo, String numOfRows, String returnType, String condCountryNm, String condCountryIsoAlp2) {
        return embassyApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("1262000/EmbassyService2/getEmbassyList2")
                        .queryParam("pageNo", pageNo)
                        .queryParam("numOfRows", numOfRows)
                        .queryParam("returnType", returnType)
                        .queryParam("cond[country_nm::EQ]", condCountryNm)
                        .queryParam("cond[country_iso_alp2::EQ]", condCountryIsoAlp2)
                        .queryParam("serviceKey", embassyApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);

    }

}
