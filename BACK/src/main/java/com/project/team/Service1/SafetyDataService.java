package com.project.team.Service1;

import com.project.team.Dto1.SafetyApiResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class SafetyDataService {

    private final WebClient webClient;

//    @Value("${api.mofa.serviceKey}")
    private String serviceKey;

    // 외교부_국가·지역별 여행경보 목록 조회(0404 대륙정보) API
    private final String API_BASE_URL = "apis.data.go.kr/1262000/TravelWarningServiceV3";
    private final String API_PATH = "/getTravelWarningListV3";

    // WebClient.Builder를 주입받아 WebClient 생성
    public SafetyDataService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(API_BASE_URL).build();
    }

    /**
     * 외교부 여행경보 API를 호출하여 DTO로 변환
     */
    public Mono<SafetyApiResponse> getCountrySafetyData() {
        return this.webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(API_PATH)
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("returnType", "JSON")
                        .queryParam("numOfRows", "200")
                        .queryParam("pageNo", "1")
                        .build())
                .retrieve()
                .bodyToMono(SafetyApiResponse.class); // <-- DTO 클래스로 원복
    }
}