package com.project.team.Service;

import com.project.team.Dto.SafetyApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class SafetyDataService {

    private final WebClient safetyApiWebClient;

    @Value("${api.mofa.serviceKey}")
    private String serviceKey;

    /**
     * 외교부 여행경보 API를 호출하여 DTO로 변환
     */
    public Mono<SafetyApiResponse> getCountrySafetyData() {
        return safetyApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/getTravelWarningListV3")
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("returnType", "JSON")
                        .queryParam("numOfRows", "200")
                        .queryParam("pageNo", "1")
                        .build())
                .retrieve()
                .bodyToMono(SafetyApiResponse.class); // <-- DTO 클래스로 원복
    }
}