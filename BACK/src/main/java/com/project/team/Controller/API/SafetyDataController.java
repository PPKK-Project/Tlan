package com.project.team.Controller.API;


import com.project.team.Cache.SafetyDataCache;
import com.project.team.Dto.SafetyApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SafetyDataController {

    private final SafetyDataCache safetyDataCache;

    /**
     * 캐시된 국가별 여행경보 리스트를 JSON으로 반환
     */
    @GetMapping("/api/countries")
    public List<SafetyApiResponse.CountrySafetyInfo> getSafetyLevels() {
        // 캐시된 데이터를 즉시 반환
        return safetyDataCache.getCachedSafetyList();
    }
}