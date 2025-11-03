package com.project.team.Cache;

import com.project.team.Dto.SafetyApiResponse;
import com.project.team.Service.SafetyDataService;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Getter
public class SafetyDataCache {

    private final SafetyDataService safetyDataService;
    private List<SafetyApiResponse.CountrySafetyInfo> cachedSafetyList;

    public SafetyDataCache(SafetyDataService safetyDataService) {
        this.safetyDataService = safetyDataService;
    }

    @PostConstruct
    public void initCache() {
        System.out.println("[알림] 서버 시작. 캐시 초기화를 시도합니다...");
        updateSafetyDataCache();
    }
    /**
     * 매일 새벽 5시에 데이터를 갱신
     */
    @Scheduled(cron = "0 0 5 * * *")
    public void updateSafetyDataCache() {
        System.out.println("[캐시 작업] API 호출을 시작합니다...");

        try {
            SafetyApiResponse response = safetyDataService.getCountrySafetyData().block();

            if (response != null &&
                    response.getResponse() != null && // 1. response 필드 확인
                    response.getResponse().getBody() != null && // 2. body 필드 확인
                    response.getResponse().getBody().getItems() != null &&
                    response.getResponse().getBody().getItems().getItem() != null) {

                this.cachedSafetyList = response.getResponse().getBody().getItems().getItem();

                // [성공 로그]
                System.out.println("여행 경보 데이터 캐시 갱신 완료: 총 " + cachedSafetyList.size() + "개 국가");

            } else {
                // DTO에 추가한 Header의 에러 메시지를 함께 출력 (디버깅용)
                String resultCode = "UNKNOWN";
                String resultMsg = "응답이 비었거나 body/items/item 구조가 일치하지 않음";

                if (response != null && response.getResponse() != null && response.getResponse().getHeader() != null) {
                    resultCode = response.getResponse().getHeader().getResultCode();
                    resultMsg = response.getResponse().getHeader().getResultMsg();
                }

                System.err.println("여행 경보 데이터 캐시 갱신 실패: " + resultMsg + " (코드: " + resultCode + ")");
            }
        } catch (Exception e) {
            // [실패 로그 1] API 호출 중 오류 발생 (403, 500 등)
            System.err.println("여행 경보 데이터 캐시 갱신 실패: " + e.getMessage());
        }
    }
}