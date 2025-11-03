package com.travel.travelproject.controller;


import com.travel.travelproject.SafetyDataCache;
import com.travel.travelproject.dto.SafetyApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/safety")
public class SafetyDataController {

    private final SafetyDataCache safetyDataCache;

    public SafetyDataController(SafetyDataCache safetyDataCache) {
        this.safetyDataCache = safetyDataCache;
    }

    /**
     * 캐시된 국가별 여행경보 리스트를 JSON으로 반환
     */
    @GetMapping("/countries")
    public List<SafetyApiResponse.CountrySafetyInfo> getSafetyLevels() {
        // 캐시된 데이터를 즉시 반환
        return safetyDataCache.getCachedSafetyList();
    }
}