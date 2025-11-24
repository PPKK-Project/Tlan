# ERD 구조 개선
프로젝트가 진행됨에 따라 기능이 여러가지가 더 추가되었고 추가된 기능에 따라 데이터베이스가 개선이 되어야한다고 생각해서 ERD 구조를 개선하려고 합니다.

현재 User > Travel > 각종 여행지 
형식으로 이루어져있는데 현재 저희가 추가를 고려하고있는 기능중
> 여행 일정에 따라 여행계획을 세우고 WebSocket을 사용해 계획을 공유할사람과 실시간으로 수정 (및 채팅)이 가능한 기능

> 위 기능을 토대로 세운 계획들을 지도에 1일차 2일차 3일차 이런식으로 구분해서 1 2 3 4 5 로 핀을찍어서 간편하게 보게 해주는 기능

정도가 있을텐데 이 기능을 구현하기 위해서는 Travel 테이블에 여행계획을 일차별로 알 수 있게 혹은 여행계획을 저장하는 테이블을 따로 만들어야 한다고 생각했습니다.

권한별로 계획수정을 나눈다면 User 테이블에 ROLE도 추가 되어야하겠죠
(굳이 권한을 추가하지않고 Travel에 계획을 볼수있는 유저를 저장하는 필드를 만들어 유저를 추가한다거나 여러 방법이 있을거같습니다.)

# 문제 정리
## 1. Travel 테이블에 여행 계획 순서등을 저장할 수 있는 필드 OR 테이블 추가
이 단계에서 생각해 볼 수 있는 방법은 두가지 입니다.
1. 테이블을 여러개 추가해 일차별로 계획 디테일을 저장하는 방법
2. 배열안에 정보를 담아 하나의 컬럼에 넣는 방법

1번의 장점으로는 **쿼리 및 검색에서 매우 효과적이며 데이터무결성, 성능, 확장성을 챙길 수 있습니다.**\
단점으로는 **초기설계가 복잡하며, 데이터를 가져올 때 JOIN 쿼리가 필요합니다.**

2번의 장점으로는 **설계가 단순하며 유연합니다.**\
단점으로는 **검색이 어려움, 업데이트의 비효율성, 데이터 무결성 관리의 어려움**이 있습니다.

## 2. 여행계획수정을 할 수 있는 User 권한 추가 / 혹은 볼 수 있는 User를 Travel에 추가

## 3. 채팅 기능을 추가한다면 테이블을 더 추가해야함 (알림 기능이 있따면 해당 테이블도 추가 필요)

> 2번 3번을 함께 고려해봤을때 1번에서 테이블을 세부적으로 나눠야지 2,3번이 좀 더 편리할거 같네요\
다음 회의때 여행계획순서 테이블 세분화 하면서 같이 고려하면 좋을거같스빈다.



```mermaid
erDiagram
    USER {
        Long id PK
        String email
        String password
        String nickname
    }

    TRAVEL {
        Long id PK
        Long user_id FK "여행 생성자"
        String countryCode
        String title
    }

    TRAVEL_PERMISSION {
        Long id PK
        Long travel_id FK "공유된 여행"
        Long user_id FK "공유받은 사용자"
        String role "역할"
    }

    TRAVEL_PLAN {
        Long id PK
        Long travel_id FK "소속된 여행"
        Long place_id FK "계획된 장소"
        int sequence "순서"
        String memo "메모"
        int dayNumber "여행 일차"
    }

    PLACE {
        Long id PK
        String name
        String type
        String address
        Double latitude
        Double longitude
    }

    ACCOMMODATION {
        Long id PK
        Long place_id FK "장소 정보"
        String phoneNumber
    }

    ATTRACTION {
        Long id PK
        Long place_id FK "장소 정보"
        Boolean openingHours
    }

    RESTAURANT {
        Long id PK
        Long place_id FK "장소 정보"
        String phoneNumber
    }

    USER ||--o{ TRAVEL : "creates"
    USER ||--o{ TRAVEL_PERMISSION : "has"
    TRAVEL ||--o{ TRAVEL_PERMISSION : "is_shared_via"
    TRAVEL ||--o{ TRAVEL_PLAN : "has"
    PLACE ||--o{ TRAVEL_PLAN : "is_planned_in"
    PLACE ||--o{ ACCOMMODATION : "details_as"
    PLACE ||--o{ ATTRACTION : "details_as"
    PLACE ||--o{ RESTAURANT : "details_as"

```


```mermaid
erDiagram
    USER {
        Long id PK "사용자 ID"
        String email UK "이메일 (로그인 ID)"
        String password "비밀번호"
        String nickname "닉네임"
        String provider "소셜 로그인 제공자 (e.g., KAKAO, GOOGLE)"
    }

    COUNTRY {
        String code PK "국가 코드 (ISO 3166-1 alpha-2)"
        String name "국가명"
    }

    TRAVEL {
        Long id PK "여행 ID"
        Long user_id FK "여행 생성자"
        String country_code FK "여행 국가"
        String title "여행 제목"
        Date startDate "여행 시작일"
        Date endDate "여행 종료일"
    }

    TRAVEL_PERMISSION {
        Long id PK "권한 ID"
        Long travel_id FK "공유된 여행"
        Long user_id FK "공유받은 사용자"
        String role "역할 (OWNER, EDITOR, VIEWER)"
    }

    PLACE {
        Long id PK "장소 ID"
        String googlePlaceId UK "Google Place ID"
        String name "장소 이름"
        String type "장소 유형 (e.g., accommodation, attraction, restaurant)"
        String address "주소"
        Double latitude "위도"
        Double longitude "경도"
        Double rating "평점"
        int reviewCount "리뷰 수"
        String imageUrl "대표 이미지 URL"
    }

    ACCOMMODATION {
        Long id PK "숙소 ID"
        Long place_id FK "장소 정보"
        String phoneNumber "전화번호"
        String website "웹사이트"
    }

    ATTRACTION {
        Long id PK "관광지 ID"
        Long place_id FK "장소 정보"
        Boolean openingHours "개장 여부 (현재)"
    }

    RESTAURANT {
        Long id PK "음식점 ID"
        Long place_id FK "장소 정보"
        String phoneNumber "전화번호"
        String cuisineType "음식 종류"
        String priceLevel "가격대"
    }

    TRAVEL_PLAN {
        Long id PK "세부 일정 ID"
        Long travel_id FK "소속된 여행"
        Long place_id FK "계획된 장소"
        int dayNumber "여행 일차"
        int sequence "일차 내 순서"
        String memo "메모"
    }

    CHAT_MESSAGE {
        Long id PK "메시지 ID"
        Long travel_id FK "채팅방(여행)"
        Long user_id FK "발신자"
        String content "메시지 내용"
        datetime createdAt "전송 시간"
    }

    RESTRICTION {
        Long id PK "제한 정보 ID"
        String country_code FK "국가 코드"
        int level "여행경보 단계"
        String description "경보 내용"
    }

    EMBASSY {
        Long id PK "대사관 ID"
        String country_code FK "국가 코드"
        String name "대사관명"
        String address "주소"
        String phoneNumber "전화번호"
        Double latitude "위도"
        Double longitude "경도"
    }

    EMERGENCY_NUMBER {
        Long id PK "응급 번호 ID"
        String country_code FK "국가 코드"
        String type "유형 (경찰, 소방, 구급차)"
        String number "전화번호"
    }

    TRAVEL_TIP {
        Long id PK "여행 팁 ID"
        String country_code FK "국가 코드"
        String category "카테고리 (문화, 교통 등)"
        String content "팁 내용"
    }

    CURRENCY {
        Long id PK "환율 ID"
        String country_code FK "국가 코드"
        String currencyCode "화폐 코드 (e.g., USD, JPY)"
        String currencyName "화폐명"
        String symbol "화폐 기호"
        Double exchangeRate "기준 환율"
        datetime lastUpdated "최종 업데이트 시간"
    }

    USER ||--o{ TRAVEL : "creates"
    USER ||--o{ TRAVEL_PERMISSION : "has"
    USER ||--o{ CHAT_MESSAGE : "sends"

    COUNTRY ||--o{ TRAVEL : "is_destination_of"
    COUNTRY ||--o{ RESTRICTION : "has"
    COUNTRY ||--o{ EMBASSY : "has"
    COUNTRY ||--o{ EMERGENCY_NUMBER : "has"
    COUNTRY ||--o{ TRAVEL_TIP : "has"
    COUNTRY ||--o{ CURRENCY : "has"

    TRAVEL ||--o{ TRAVEL_PERMISSION : "is_shared_via"
    TRAVEL ||--o{ TRAVEL_PLAN : "contains"
    TRAVEL ||--o{ CHAT_MESSAGE : "has_room_for"

    PLACE ||--o{ TRAVEL_PLAN : "is_planned_in"
    PLACE ||--o| ACCOMMODATION : "details_as"
    PLACE ||--o| ATTRACTION : "details_as"
    PLACE ||--o| RESTAURANT : "details_as"

```