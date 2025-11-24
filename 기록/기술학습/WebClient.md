
## 1\. ⚙️ $\text{API}$별 $\text{WebClient}$ $\text{Bean}$ 정의 (Configuration)

접근하려는 각 외부 $\text{API}$의 $\text{Base URL}$에 맞춰 $\text{WebClient}$ $\text{Bean}$을 생성하고, `@Bean` 메서드 이름을 $\text{Qualifier}$로 사용할 수 있도록 명확하게 정의합니다.

```java
// WebClientConfig.java
@Configuration
public class WebClientConfig {

    @Value("${api.url.place}")
    private String placeApiBaseUrl;
    @Bean
    public WebClient placeApiWebClient() {
        return WebClient.builder().baseUrl(placeApiBaseUrl).build();
    }


    @Value("${api.url.safety}")
    private String safetyApiBaseUrl;
    @Bean
    public WebClient safetyApiWebClient() {
        return WebClient.builder().baseUrl(safetyApiBaseUrl).build();
    }
}
```

-----

## 2\. 🗂️ 데이터 모델 (`DTO`) 정의

정의 하려고 했는데 Json 파일을 그대로 프론트에 전달해도 문제가 없을거 같아서
Dto로 변환 하실분은 변환하셔서 작업하셔도 문제 없습니다.

단, Dto를 사용하지 않을 경우엔 JsonNode 를 이용해 return하는 작업과 Dto변환말고 JsonNode.class 로 .bodyToMono(JsonNode.class);  변환하는 작업이 필요합니다.

-----

## 3\. 🧩 서비스 로직: $\text{Bean}$ 주입 및 병렬 호출

서비스 클래스에서는 `@Qualifier`를 사용해 필요한 $\text{WebClient}$ $\text{Bean}$을 주입받고, `Mono.zip()`을 사용하여 병렬 처리를 수행합니다.

```java
@Service
public class SafetyDataService {

    private final WebClient safetyApiWebClient;

    @Value("${api.mofa.serviceKey}")
    private String serviceKey;

    public SafetyDataService(
            @Qualifier("safetyApiWebClient") WebClient safetyApiWebClient) {
        this.safetyApiWebClient = safetyApiWebClient;
    }
    /**
     * 외교부 여행경보 API를 호출하여 DTO로 변환
     */
    public Mono<SafetyApiResponse> getCountrySafetyData() {
        return safetyApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/getTravelWarningListV3")
                        .queryParam("serviceKey", serviceKey)
                        .queryParam("returnType", "JSON")
                        .queryParam("numOfRows", "200")
                        .queryParam("pageNo", "1")
                        .build())
                .retrieve()
                .bodyToMono(SafetyApiResponse.class); // <-- DTO 클래스로 원복
    }
}
```
Dto로 변환하지 않는다면 아래 방식으로 하시면 됩니다.
```java
@Service
public class PlaceApiService {
    private final WebClient placeApiWebClient;

    @Value("${api.key.place}")
    private String placeApiKey;

    public PlaceApiService(
            @Qualifier("placeApiWebClient") WebClient placeApiWebClient) {
        this.placeApiWebClient = placeApiWebClient;
    }

    // 매개변수는 request ? dto?
    public Mono<JsonNode> fetchPlaceApiData(String keyword, String lat, String lng, String radius, String type) {
        return placeApiWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/maps/api/place/nearbysearch/json")
                        .queryParam("keyword", keyword)
                        .queryParam("location", lat+","+lng)
                        .queryParam("radius", radius)
                        .queryParam("type", type)
                        .queryParam("key", placeApiKey)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class);
    }
}
```
-----

## 4\. 🔗 컨트롤러에서 $\text{Front-End}$로 반환

컨트롤러에서는 $\text{Service}$에서 반환받은 `Mono<FinalResponseDto>`를 그대로 $\text{return}$하면, $\text{Spring Boot}$가 이 비동기 결과를 기다렸다가 \*\*하나의 통합된 $\text{JSON}$\*\*으로 변환하여 클라이언트에게 전송합니다.

Jackson 라이브러리의 JsonNode 타입으로 받으면, DTO 없이도 JSON의 계층적 구조를 유지하면서 데이터를 탐색할 수 있습니다.
`Mono<JsonNode>`, `.bodyToMono(JsonNode.class)`

```java
@RestController
@RequiredArgsConstructor
public class PlaceApiController {

    private final PlaceApiService placeApiService;

    @GetMapping("/api/place")
    public Mono<JsonNode> getPlaceApi(밑의 매개변수는 임시고 실제로는 Dto 이용해서 @RequestBody로 받거나 @RequestParam 으로 받아야 합니다.) {
        return placeApiService.fetchPlaceApiData("food", "35.15289466583233", "129.05960054547748", "3000", "food");
    }
}
```

### ✨ 최종 결과

$\text{Front-End}$는 엔드포인트를 호출하면, 아래와 같은 형태의 $\text{JSON}$ 응답을 받게 됩니다.

```json
{
  "currentRate": {
  // ... 환율 API 데이터
  }
}
```