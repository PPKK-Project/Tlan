package com.project.team.Controller.API;


import com.project.team.Cache.SafetyDataCache;
import com.project.team.Dto.SafetyApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "외부 연동 API")
@RestController
@RequiredArgsConstructor
public class SafetyDataController {

    private final SafetyDataCache safetyDataCache;

    /**
     * 캐시된 국가별 여행경보 리스트를 JSON으로 반환
     */
    @Operation(summary = "전 세계 여행경보 조회", description = "외교부에서 제공하는 전 세계 국가별 여행경보 단계를 조회합니다.")
    @GetMapping("/api/countries")
    public List<SafetyApiResponse.CountrySafetyInfo> getSafetyLevels() {
        // 캐시된 데이터를 즉시 반환
        return safetyDataCache.getCachedSafetyList();
    }
}