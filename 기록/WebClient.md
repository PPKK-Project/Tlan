
## 1\. ⚙️ $\text{API}$별 $\text{WebClient}$ $\text{Bean}$ 정의 (Configuration)

접근하려는 각 외부 $\text{API}$의 $\text{Base URL}$에 맞춰 $\text{WebClient}$ $\text{Bean}$을 생성하고, `@Bean` 메서드 이름을 $\text{Qualifier}$로 사용할 수 있도록 명확하게 정의합니다.

```java
// WebClientConfig.java

@Configuration
public class WebClientConfig {

    // 1. 환율 API 전용 WebClient
    @Bean
    public WebClient currencyWebClient(WebClient.Builder builder) {
        return builder.baseUrl("https://api.currency-service.com")
                      .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                      .build();
    }

    // 2. 날씨 API 전용 WebClient
    @Bean
    public WebClient weatherWebClient(WebClient.Builder builder) {
        return builder.baseUrl("https://api.weather-provider.com/v1")
                      .build();
    }
}
```

-----

## 2\. 🗂️ 데이터 모델 (`DTO`) 정의

각 $\text{API}$의 응답을 받기 위한 개별 $\text{DTO}$와, 최종적으로 $\text{Front-End}$에 보낼 통합 $\text{DTO}$를 정의합니다.

```java
// CurrencyDto.java, WeatherDto.java 등 개별 응답 DTO 정의 (생략)

// FinalResponseDto.java (최종 통합 DTO)
public class FinalResponseDto {
    private WeatherDto weatherInfo;
    private CurrencyDto currentRate;

    // (생성자, Getter, Setter)
    public FinalResponseDto(WeatherDto weatherInfo, CurrencyDto currentRate) {
        this.weatherInfo = weatherInfo;
        this.currentRate = currentRate;
    }
}
```

-----

## 3\. 🧩 서비스 로직: $\text{Bean}$ 주입 및 병렬 호출

서비스 클래스에서는 `@Qualifier`를 사용해 필요한 $\text{WebClient}$ $\text{Bean}$을 주입받고, `Mono.zip()`을 사용하여 병렬 처리를 수행합니다.

```java
// DataIntegrationService.java

@Service
public class DataIntegrationService {

    private final WebClient currencyClient;
    private final WebClient weatherClient;

    // @Qualifier를 사용하여 사용할 WebClient Bean을 명시적으로 주입
    public DataIntegrationService(
            @Qualifier("currencyWebClient") WebClient currencyClient,
            @Qualifier("weatherWebClient") WebClient weatherClient) {
        this.currencyClient = currencyClient;
        this.weatherClient = weatherClient;
    }

    // 환율 API 호출 (Currency WebClient 사용)
    private Mono<CurrencyDto> fetchCurrencyRate(String base) {
        return currencyClient.get().uri("/latest?base={base}", base)
                .retrieve()
                .bodyToMono(CurrencyDto.class);
    }

    // 날씨 API 호출 (Weather WebClient 사용)
    private Mono<WeatherDto> fetchWeatherInfo(String city) {
        return weatherClient.get().uri("/forecast?city={city}", city)
                .retrieve()
                .bodyToMono(WeatherDto.class);
    }
}
```

-----

## 4\. 🔗 컨트롤러에서 $\text{Front-End}$로 반환

컨트롤러에서는 $\text{Service}$에서 반환받은 `Mono<FinalResponseDto>`를 그대로 $\text{return}$하면, $\text{Spring Boot}$가 이 비동기 결과를 기다렸다가 \*\*하나의 통합된 $\text{JSON}$\*\*으로 변환하여 클라이언트에게 전송합니다.

```java
// DataController.java

@RestController
@RequestMapping("/api/v1")
public class DataController {

    private final DataIntegrationService integrationService;

    // ... (생성자 주입)

    @GetMapping("/integrated-info")
    public Mono<FinalResponseDto> getCombinedInfo(
            @RequestParam String base) {
        
        // 병렬 처리된 Mono를 반환
        return integrationService.fetchCurrencyRate(base);
    }
}
```

### ✨ 최종 결과

$\text{Front-End}$는 `/api/v1/integrated-info` 엔드포인트를 호출하면, 두 $\text{API}$ 호출이 병렬로 실행된 후 합쳐진 아래와 같은 형태의 $\text{JSON}$ 응답을 받게 됩니다.

```json
{
  "currentRate": {
    // ... 환율 API 데이터
  }
}
```