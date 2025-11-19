package com.project.team.Controller.API;



import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Service.API.CurrencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.project.team.Service.API.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "외부 연동 API")
@RestController
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @Operation(summary = "환율 정보 조회", description = "특정 국가의 통화에 대한 원화(KRW) 1000원 기준 환율 정보를 조회합니다.")
    @GetMapping("/api/currency")
    public String getRateFromDb(@Parameter(description = "조회할 국가의 한글 이름", example = "일본") String country) {
        return currencyService.getKrw1000RateByCountryName(country);
    }
}