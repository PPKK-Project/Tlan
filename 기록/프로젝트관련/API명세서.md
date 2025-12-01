# Tlan API 명세서

> 해외 여행 계획/공유/안전 정보를 제공하는 **Tlan(Travel Plan)** 서비스의 REST / WebSocket API 명세입니다.

---

## 0. 공통 정보

- **Base URL (예시)**
  - Local: `http://localhost:8080`
  - Prod : `https://tlan.kro.kr`
- **Content-Type**
  - Request: `application/json`
  - Response: `application/json` (별도 표기 없을 경우)
- **인증 방식**
  - `Authorization: Bearer <JWT>` 헤더
  - Auth 컬럼에 `JWT` 표기된 엔드포인트는 모두 필수
  
---

## 1. Auth / User

### 1-1. 인증 / 회원 관리

| Method | Path            | Auth | Request Body / Params                  | Response                                   | Notes           |
|--------|-----------------|------|----------------------------------------|--------------------------------------------|-----------------|
| POST   | `/signup`       | None | `UserSignUpRequest`                    | `200 OK` (이메일 인증 메일 발송)           | 회원가입        |
| POST   | `/login`        | None | `AccountCredentials{email,password}`   | `200 OK` + 헤더 `Authorization: Bearer <JWT>` | 이메일 미인증 시 `403` |
| GET    | `/verify-email` | None | `?token`                               | `200 OK` (문자열 메시지)                    | 이메일 인증     |

### 1-2. 사용자 정보

| Method | Path               | Auth | Request Body / Params | Response         | Notes       |
|--------|--------------------|------|------------------------|------------------|-------------|
| PATCH  | `/users`           | JWT  | `PatchUsersRecord`     | `200 OK`        | 내 정보 수정 |
| GET    | `/users/nickname`  | JWT  | -                      | `UserResponse`  | 내 정보 조회 |

---

## 2. Travel (여행)

여행(Trip) 단위 리소스 API.

| Method | Path                | Auth | Request Body / Params                                                                                  | Response         | Notes          |
|--------|---------------------|------|--------------------------------------------------------------------------------------------------------|------------------|----------------|
| POST   | `/travels`          | JWT  | `CreateTravelRequest{countryCode,title,startDate,endDate,travelerCount,departure,destinationCity}`    | `Travel`         | 여행 생성      |
| GET    | `/travels`          | JWT  | -                                                                                                      | `Travel[]`       | 소유/공유 목록 |
| GET    | `/travels/{travelId}` | JWT | -                                                                                                      | `TravelResponse` | 여행 상세      |
| PUT    | `/travels/{travelId}` | JWT | `UpdateTravelRequest{title,startDate,endDate}`                                                         | `TravelResponse` | 여행 수정      |
| DELETE | `/travels/{travelId}` | JWT | -                                                                                                      | `204 No Content` | 여행 삭제 (owner만) |

---

## 3. Travel Plan (일정)

여행에 속한 일(day)·장소(plan) 관리 API.

| Method | Path                                   | Auth | Request Body / Params                                                                 | Response               | Notes        |
|--------|----------------------------------------|------|----------------------------------------------------------------------------------------|------------------------|--------------|
| GET    | `/travels/{travelId}/plans`            | JWT  | -                                                                                      | `TravelPlanResponse[]` | 일정 목록    |
| POST   | `/travels/{travelId}/plans`            | JWT  | `AddPlanRequest{googlePlaceId,name,address,type,lat,lon,dayNumber,sequence,memo}`      | `TravelPlanResponse` (`201 Created`) | 일정 추가 |
| PUT    | `/travels/{travelId}/plans/{planId}`   | JWT  | `TravelPlanUpdateRequest{dayNumber,sequence,memo}`                                     | `TravelPlanResponse`   | 일정 수정    |
| DELETE | `/travels/{travelId}/plans/{planId}`   | JWT  | -                                                                                      | `204 No Content`       | 일정 삭제    |

---

## 4. Travel Permission (공유 / 권한)

여행 공유 및 권한(OWNER / EDITOR / VIEWER) 관리 API.

| Method | Path                                     | Auth | Request Body / Params                              | Response                    | Notes                      |
|--------|------------------------------------------|------|---------------------------------------------------|-----------------------------|----------------------------|
| POST   | `/travels/{travelId}/share`              | JWT  | `TravelPermissionCreateRequest{email,role}`       | `200 OK`                    | 초대/권한 부여 (owner만)  |
| GET    | `/travels/{travelId}/share`              | JWT  | -                                                 | `TravelPermissionResponse[]` | 해당 여행 권한 목록        |
| PUT    | `/travels/{travelId}/share/{permissionId}` | JWT | `TravelPermissionUpdateRequest{role}`             | `TravelPermissionResponse`  | 권한 수정 (owner만)       |
| DELETE | `/travels/{travelId}/share/{permissionId}` | JWT | -                                                 | `204 No Content`            | 공유 취소 (owner만)       |
| GET    | `/travels/share`                         | JWT  | -                                                 | `TravelResponse[]`          | 내가 공유받은 여행 목록    |
| GET    | `/travels/{travelId}/role`               | JWT  | -                                                 | `String` (role)             | 해당 여행에서 내 역할 조회 |

---

## 5. Chat (WebSocket + REST)

여행별 채팅 및 플랜 변경 알림.

### 5-1. WebSocket (STOMP)

| Type       | Destination                      | Auth | Body                                  | Response     | Notes            |
|------------|----------------------------------|------|---------------------------------------|-------------|------------------|
| STOMP SEND | `/chat/message/{travelId}`       | JWT  | `ChatMessageRequest{email,content}`   | - (broadcast)| 채팅 메시지 전송 |
| STOMP SEND | `/travels/{travelId}`            | JWT  | `String isUpdated`                    | - (broadcast)| 플랜 변경 알림   |

### 5-2. REST (채팅 기록)

| Method | Path                    | Auth | Params | Response             | Notes           |
|--------|-------------------------|------|--------|----------------------|-----------------|
| GET    | `/chat/message/{travelId}` | JWT | -      | `ChattingResponse[]` | 채팅 기록 조회  |

---

## 6. Flight (Playwright 크롤링)

항공편 검색 및 여행에 항공편 정보 저장.

| Method | Path               | Auth | Request Body / Params                                                        | Response      | Notes          |
|--------|--------------------|------|-------------------------------------------------------------------------------|---------------|----------------|
| GET    | `/flight`          | JWT  | `FlightSearchRequest{depAp,arrAp,depDate,retDate,adult}`                     | `FlightData[]`| Playwright 기반 크롤링 검색 |
| POST   | `/flight/{travelId}` | JWT | `FlightData`                                                                 | `Flight`      | 특정 여행에 항공편 저장 |

---

## 7. Airport

공항 목록 조회.

| Method | Path            | Auth | Params | Response    | Notes     |
|--------|-----------------|------|--------|-------------|-----------|
| GET    | `/api/airports` | JWT  | -      | `Airport[]` | 공항 목록 |

---

## 8. External Info / Places

외부 데이터(Google Places, 안전정보, 대사관, 환율, 긴급 번호 등)를 조회하는 API.  
일부는 공개(인증 불필요) 엔드포인트입니다.

| Method | Path                        | Auth | Params / Body                                                      | Response                                   | Notes          |
|--------|----------------------------|------|--------------------------------------------------------------------|--------------------------------------------|----------------|
| GET    | `/place`                   | None | `PlaceApiRequest{keyword,lat,lon,radius,type}`                     | `Mono<JsonNode>` (Google Places 결과)      | 장소 검색      |
| GET    | `/geocode`                 | None | `address`                                                          | `Mono<JsonNode>`                           | 주소 → 좌표    |
| GET    | `/countries`               | None | -                                                                  | `SafetyApiResponse.CountrySafetyInfo[]`    | 국가별 여행경보 |
| GET    | `/embassy`                 | None | `countryName`                                                      | `Mono<JsonNode>`                           | 대사관 정보    |
| GET    | `/embassy/travels/{travelId}` | None | `travelId`                                                        | `Mono<JsonNode>`                           | 해당 여행지 대사관 |
| GET    | `/currency`                | None | `country`                                                          | `String` (환율 정보)                       | KRW 1000 기준 |
| GET    | `/emergency/{travelId}`    | None | `travelId`                                                         | `Mono<JsonNode>`                           | 여행지 긴급 번호 |

---

## 9. 보안 및 네트워크 규칙 요약

- **JWT 필요 엔드포인트**
  - Auth 컬럼에 `JWT`로 표기된 모든 경로
  - 헤더: `Authorization: Bearer <access_token>`
- **공개 엔드포인트**
  - `/login`, `/signup`, `/verify-email`
  - `/place`, `/geocode`
  - `/countries`, `/embassy/**`
  - `/currency`, `/emergency/**`
  - 정적 파일, Swagger UI
- **CORS**
  - 허용 Origin: `http://localhost:5173`, `http://localhost:5174`, `http://localhost`, `https://tlan.kro.kr`

