package com.project.team.Util;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Dto.SafetyApiResponse;
import com.project.team.Entity.Airport;
import com.project.team.Entity.CountryInfo;
import com.project.team.Entity.CurrencyRate;
import com.project.team.Repository.AirportRepository;
import com.project.team.Repository.CountryInfoRepository;
import com.project.team.Repository.CurrencyRateRepository;
import com.project.team.Service.API.SafetyDataService;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final CountryInfoRepository countryInfoRepository;
    private final CurrencyRateRepository currencyRateRepository;
    private final WebClient currencyWebClient;
    private final SafetyDataService safetyDataService;
    private final AirportRepository airportRepository;

    @Getter
    private List<SafetyApiResponse.CountrySafetyInfo> cachedSafetyList;

    @Value("${api.key.currency}")
    private String currencyApiKey;

    @PostConstruct
    public void initCache() {
        System.out.println("[알림] 서버 시작. 나라정보,환율정보 입력중");
        // 1. 환율 정보를 먼저 DB에 저장하고 작업이 끝날 때까지 기다립니다.
        updateCurrencyRatesDaily().block();
        // 2. 저장된 환율 정보를 바탕으로 국가 정보를 업데이트합니다.
        updateCountryInfoDaily();
        updateSafetyDataCache();
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
    public Mono<Void> updateCurrencyRatesDaily() {
        return currencyWebClient.get()
                .uri("/{currencyApiKey}/latest/USD", currencyApiKey)
                .retrieve()
                .bodyToMono(JsonNode.class) // Mono<JsonNode>
                .doOnSuccess(jsonNode -> { // 작업 성공 시 실행 (부수 효과)
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
                })
                .doOnError(error -> { // 작업 실패 시 실행 (부수 효과)
                    System.err.println("환율 정보 업데이트 실패: " + error.getMessage());
                })
                .then(); // 모든 작업이 끝나면 비어있는 Mono<Void>를 반환
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

    @Override
    public void run(String... args) throws Exception {
        // --- 공항 데이터 초기화 로직 시작 ---
        if (airportRepository.count() == 0) {
            List<Airport> airports = Arrays.asList(
                    // === 1. 대한민국 출발 공항 ===
                    new Airport("ICN", "인천", "대한민국", "서울/인천"),
                    new Airport("GMP", "서울/김포", "대한민국", "서울"),
                    new Airport("PUS", "부산/김해", "대한민국", "부산"),
                    new Airport("CJU", "제주", "대한민국", "제주"),
                    new Airport("TAE", "대구", "대한민국", "대구"),
                    new Airport("CJJ", "청주", "대한민국", "청주"),
                    new Airport("MWX", "무안", "대한민국", "무안"),
                    new Airport("YNY", "양양", "대한민국", "양양"),
                    new Airport("KWJ", "광주", "대한민국", "광주"),
                    new Airport("RSU", "여수", "대한민국", "여수"),
                    new Airport("USN", "울산", "대한민국", "울산"),
                    new Airport("KPO", "포항/경주", "대한민국", "포항"),
                    new Airport("HIN", "사천", "대한민국", "사천"),
                    new Airport("KUV", "군산", "대한민국", "군산"),
                    new Airport("WJU", "원주", "대한민국", "원주"),

                    // === 2. 해외 도착 공항 (주요 여행지) ===
                    // 1. 일본
                    new Airport("NRT", "도쿄/나리타", "일본", "도쿄"),
                    new Airport("HND", "도쿄/하네다", "일본", "도쿄"),
                    new Airport("KIX", "오사카/간사이", "일본", "오사카"),
                    new Airport("FUK", "후쿠오카", "일본", "후쿠오카"),
                    new Airport("CTS", "삿포로/신치토세", "일본", "삿포로"),
                    new Airport("OKA", "오키나와/나하", "일본", "오키나와"),

                    // 2. 베트남
                    new Airport("DAD", "다낭", "베트남", "다낭"),
                    new Airport("CXR", "나트랑/깜란", "베트남", "나트랑"),
                    new Airport("HAN", "하노이/노이바이", "베트남", "하노이"),
                    new Airport("SGN", "호치민/떤썬녓", "베트남", "호치민"),
                    new Airport("PQC", "푸꾸옥", "베트남", "푸꾸옥"),

                    // 3. 태국
                    new Airport("BKK", "방콕/수완나품", "태국", "방콕"),
                    new Airport("DMK", "방콕/돈므앙", "태국", "방콕"),
                    new Airport("HKT", "푸켓", "태국", "푸켓"),
                    new Airport("CNX", "치앙마이", "태국", "치앙마이"),

                    // 4. 필리핀
                    new Airport("CEB", "세부/막탄", "필리핀", "세부"),
                    new Airport("MNL", "마닐라/니노이", "필리핀", "마닐라"),
                    new Airport("KLO", "보라카이/칼리보", "필리핀", "보라카이"),

                    // 5. 기타 아시아 & 대양주
                    new Airport("TPE", "타이베이/타오위안", "대만", "타이베이"),
                    new Airport("HKG", "홍콩", "홍콩", "홍콩"),
                    new Airport("MFM", "마카오", "마카오", "마카오"),
                    new Airport("SIN", "싱가포르/창이", "싱가포르", "싱가포르"),
                    new Airport("GUM", "괌", "미국", "괌"),
                    new Airport("SPN", "사이판", "미국", "사이판"),

                    // 6. 미주 (본토)
                    new Airport("HNL", "하와이/호놀룰루", "미국", "하와이"),
                    new Airport("LAX", "로스앤젤레스", "미국", "로스앤젤레스"),
                    new Airport("JFK", "뉴욕/JFK", "미국", "뉴욕"),

                    // 7. 유럽
                    new Airport("CDG", "파리/샤를드골", "프랑스", "파리"),
                    new Airport("LHR", "런던/히드로", "영국", "런던"),
                    new Airport("FCO", "로마/피우미치노", "이탈리아", "로마")
            );

            airportRepository.saveAll(airports);
            System.out.println("주요 공항 30개 데이터 초기화 완료");
        }

    }
}