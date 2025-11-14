package com.project.team.Util;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Entity.CountryInfo;
import com.project.team.Entity.CurrencyRate;
import com.project.team.Repository.CountryInfoRepository;
import com.project.team.Repository.CurrencyRateRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataInitializer {
    private final CountryInfoRepository countryInfoRepository;
    private final CurrencyRateRepository currencyRateRepository;
    private final WebClient currencyWebClient;

    @Value("${api.key.currency}")
    private String currencyApiKey;

    @PostConstruct
    public void initCache() {
        System.out.println("[알림] 서버 시작. 나라정보,환율정보 입력중");
        // 나라 정보가 먼저 업데이트되어야, 이후 환율 업데이트 시 CountryInfo와 매칭 가능
        updateCurrencyRatesDaily();
        updateCountryInfoDaily();
    }

    public void updateCountryInfoDaily() {
        // 국가 코드와 통화 코드를 매핑하는 Map (이전 버전과 동일)
        Map<String, String> countryCurrencyMap = Map.<String, String>ofEntries(
                Map.entry("KR", "KRW"), Map.entry("US", "USD"), Map.entry("AE", "AED"),
                Map.entry("AF", "AFN"), Map.entry("AL", "ALL"), Map.entry("AM", "AMD"),
                Map.entry("AR", "ARS"), Map.entry("AU", "AUD"), Map.entry("AZ", "AZN"),
                Map.entry("BD", "BDT"), Map.entry("BG", "BGN"), Map.entry("BO", "BOB"),
                Map.entry("BR", "BRL"), Map.entry("CA", "CAD"), Map.entry("CH", "CHF"),
                Map.entry("CL", "CLP"), Map.entry("CN", "CNY"), Map.entry("CO", "COP"),
                Map.entry("CR", "CRC"), Map.entry("CZ", "CZK"), Map.entry("DE", "EUR"),
                Map.entry("DK", "DKK"), Map.entry("EG", "EGP"), Map.entry("ES", "EUR"),
                Map.entry("FR", "EUR"), Map.entry("GB", "GBP"), Map.entry("HK", "HKD"),
                Map.entry("HU", "HUF"), Map.entry("ID", "IDR"), Map.entry("IN", "INR"),
                Map.entry("IT", "EUR"), Map.entry("JP", "JPY"), Map.entry("KH", "KHR"),
                Map.entry("LK", "LKR"), Map.entry("MN", "MNT"), Map.entry("MX", "MXN"),
                Map.entry("MY", "MYR"), Map.entry("NO", "NOK"), Map.entry("NZ", "NZD"),
                Map.entry("PE", "PEN"), Map.entry("PH", "PHP"), Map.entry("PL", "PLN"),
                Map.entry("RU", "RUB"), Map.entry("SE", "SEK"), Map.entry("SG", "SGD"),
                Map.entry("TH", "THB"), Map.entry("TR", "TRY"), Map.entry("TW", "TWD"),
                Map.entry("UA", "UAH"), Map.entry("UY", "UYU"), Map.entry("VN", "VND"),
                Map.entry("ZA", "ZAR"), Map.entry("GU", "USD") // 괌 추가
        );

        // 국가 이름 Map: 모든 국가에 대한 전체 한국어 이름을 포함 (이전 DataInitializer 목록 기반)
        Map<String, String> countryNameMap = Map.<String, String>ofEntries(
                Map.entry("KR", "대한민국"), Map.entry("US", "미국"), Map.entry("AE", "아랍에미리트"),
                Map.entry("AF", "아프가니스탄"), Map.entry("AL", "알바니아"), Map.entry("AM", "아르메니아"),
                Map.entry("AR", "아르헨티나"), Map.entry("AU", "호주"), Map.entry("AZ", "아제르바이잔"),
                Map.entry("BD", "방글라데시"), Map.entry("BG", "불가리아"), Map.entry("BO", "볼리비아"),
                Map.entry("BR", "브라질"), Map.entry("CA", "캐나다"), Map.entry("CH", "스위스"),
                Map.entry("CL", "칠레"), Map.entry("CN", "중국"), Map.entry("CO", "콜롬비아"),
                Map.entry("CR", "코스타리카"), Map.entry("CZ", "체코"), Map.entry("DE", "독일"),
                Map.entry("DK", "덴마크"), Map.entry("EG", "이집트"), Map.entry("ES", "스페인"),
                Map.entry("FR", "프랑스"), Map.entry("GB", "영국"), Map.entry("HK", "홍콩"),
                Map.entry("HU", "헝가리"), Map.entry("ID", "인도네시아"), Map.entry("IN", "인도"),
                Map.entry("IT", "이탈리아"), Map.entry("JP", "일본"), Map.entry("KH", "캄보디아"),
                Map.entry("LK", "스리랑카"), Map.entry("MN", "몽골"), Map.entry("MX", "멕시코"),
                Map.entry("MY", "말레이시아"), Map.entry("NO", "노르웨이"), Map.entry("NZ", "뉴질랜드"),
                Map.entry("PE", "페루"), Map.entry("PH", "필리핀"), Map.entry("PL", "폴란드"),
                Map.entry("RU", "러시아"), Map.entry("SE", "스웨덴"), Map.entry("SG", "싱가포르"),
                Map.entry("TH", "태국"), Map.entry("TR", "튀르키예"), Map.entry("TW", "대만"),
                Map.entry("UA", "우크라이나"), Map.entry("UY", "우루과이"), Map.entry("VN", "베트남"),
                Map.entry("ZA", "남아프리카 공화국"), Map.entry("GU", "괌") // 괌 이름 추가
        );

        List<CountryInfo> initialData = new ArrayList<>();

        // CountryCurrencyMap을 기준으로 반복
        countryCurrencyMap.forEach((countryCode, currencyCode) -> {
            String countryName = countryNameMap.getOrDefault(countryCode, countryCode);

            CountryInfo countryInfo = new CountryInfo(countryCode, countryName);

            currencyRateRepository.findById(currencyCode).ifPresent(countryInfo::setCurrencyRate);

            initialData.add(countryInfo);
        });

        countryInfoRepository.saveAll(initialData);
        System.out.println("CountryInfo 데이터가 성공적으로 업데이트되었습니다.");
    }

    /**
     * 매일 새벽 2시에 환율 정보를 외부 API에서 가져와 DB에 업데이트합니다.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void updateCurrencyRatesDaily() {
        currencyWebClient.get()
                .uri("/{currencyApiKey}/latest/USD", currencyApiKey)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .subscribe(jsonNode -> {
                    JsonNode ratesNode = jsonNode.get("conversion_rates");
                    List<CurrencyRate> currencyRates = new ArrayList<>();
                    Iterator<Map.Entry<String, JsonNode>> fields = ratesNode.fields();
                    while (fields.hasNext()) {
                        Map.Entry<String, JsonNode> field = fields.next();
                        String currencyCode = field.getKey();
                        double rate = field.getValue().asDouble();
                        currencyRates.add(new CurrencyRate(currencyCode, rate));
                    }
                    currencyRateRepository.saveAll(currencyRates);
                    System.out.println("환율 정보가 성공적으로 업데이트되었습니다.");
                }, error -> {
                    System.err.println("환율 정보 업데이트 실패: " + error.getMessage());
                });
    }
}