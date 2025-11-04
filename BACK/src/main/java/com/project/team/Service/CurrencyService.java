package com.project.team.Service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class CurrencyService {

    private final WebClient currencyWebClient;

    @Value("${api.key.currency}")
    private String currencyApiKey;

    public CurrencyService(
            @Qualifier("currencyWebClient") WebClient currencyWebClient) {
        this.currencyWebClient = currencyWebClient;
    }

    public Mono<JsonNode> fetchRates() {
        return currencyWebClient.get() // GET 요청
                .uri("/{currencyApiKey}/latest/KRW", currencyApiKey)
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}