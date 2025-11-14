package com.project.team.Service.API;

import com.project.team.Entity.CountryInfo;
import com.project.team.Entity.CurrencyRate;
import com.project.team.Repository.CountryInfoRepository;
import com.project.team.Repository.CurrencyRateRepository;
import com.project.team.Exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final CountryInfoRepository countryInfoRepository;
    private final CurrencyRateRepository currencyRateRepository;

    /**
     * 국가 이름(한글)을 입력받아 DB에 저장된 환율 정보를 조회하여 반환합니다.
     * @param countryName 조회할 국가의 한글 이름 (예: "일본")
     * @return 해당 국가의 환율 정보
     */
    public String getKrw1000RateByCountryName(String countryName) {
        CountryInfo countryInfo = countryInfoRepository.findByCountryName(countryName)
                .orElseThrow(() -> new ResourceNotFoundException("국가 정보를 찾을 수 없습니다: " + countryName));

        String targetCurrencyCode = countryInfo.getCurrencyRate() != null ?
                countryInfo.getCurrencyRate().getCurrencyCode() :
                null;
        if (targetCurrencyCode == null) {
            throw new ResourceNotFoundException("해당 국가의 통화 코드를 찾을 수 없습니다: " + countryName);
        }

        CurrencyRate targetRateData = currencyRateRepository.findById(targetCurrencyCode)
                .orElseThrow(() -> new ResourceNotFoundException("타겟 환율 정보를 찾을 수 없습니다: " + targetCurrencyCode));

        CurrencyRate krwRateData = currencyRateRepository.findById("KRW")
                .orElseThrow(() -> new ResourceNotFoundException("KRW 환율 정보를 찾을 수 없습니다. DB 초기화 확인 필요."));

        double result = 1000 / krwRateData.getRate() * targetRateData.getRate();
        return (Math.round(result * 100.0) / 100.0) +"  "+ countryInfo.getCurrencyRate().getCurrencyCode();
    }
}