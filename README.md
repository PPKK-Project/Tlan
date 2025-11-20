<div align="center">
  <h1>✈️ Tlan (Travel Plan)</h1>
  <strong>나만의 여행을 계획하고, 공유하고, 쉽게 떠나보세요.</strong>
</div>

<br />

## ✨ 주요 기능

Tlan은 **여행 계획 수립**과 **실시간 정보 및 협업** 기능을 결합하여 여행의 전 과정을 지원합니다.

### 🗺️ 계획 수립 및 관리

  * **기간별 여행 계획 CRUD:** 사용자가 원하는 기간을 설정하여 관광지, 숙소, 음식점 목록을 확인하고, 기간별로 여행 계획에 저장 및 관리할 수 있습니다.
  * **장소 검색 및 지도 연동:** **Google Place API**를 활용하여 장소 정보(위치, 평점, 주소 등)를 제공하며, **Google Map API**를 이용해 지도에 경로를 시각적으로 표시합니다.
  * **PDF 계획서 다운로드:** 저장된 여행 계획(일정, 지도, 정보)을 **PDF 파일**로 깔끔하게 정리하여 출력하고 다운로드할 수 있습니다. (참고: `src/components/pdfPages/`)
  * **항공권/숙박/음식점 정보 표시:** 선택한 여행지 주변의 항공권, 숙박, 음식점 등의 정보를 목록으로 표시하여 계획 수립을 돕습니다.

### 🤝 실시간 협업 및 소통

  * **실시간 채팅 및 공유:** **WebSocket**을 기반으로 동행자와 여행 계획을 **실시간으로 공유**하고, 개별 여행 계획 내에서 **채팅**을 통해 소통할 수 있습니다. (참고: `Chat.tsx`, `ChatRoomList.tsx`)
  * **권한 기반 접근 제어:** 공유된 여행 계획에 대한 권한 관리(`Travel Permission`)를 통해 안전하게 협업합니다.

### 🚨 안전 및 실시간 정보

  * **위험 지역 정보:** 외교부 기준 여행 금지/경고 국가 목록 및 해당 국가의 치안 정보를 제공합니다.
  * **응급 상황 대처:** 나라별 응급 연락처(경찰, 소방, 구급차)와 **현지 병원 위치**를 **Google Place API**를 통해 안내합니다.
  * **실시간 환율 및 환전소:** 여행지별 환율 정보를 실시간으로 제공하며, 주변 **환전 가능 장소**를 지도 API를 통해 안내합니다.

## 🛠️ 기술 스택
### Frontend
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=tanstack&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" />
</p>

### Backend
<p>
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />  <img src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white" />
  <img src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white" />
  <img src="https://img.shields.io/badge/JPA-6DB33F?style=for-the-badge&logo=hibernate&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

### Database
<p>
  <img src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

### Security
<p>
  <img src="https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" />
  <img src="https://img.shields.io/badge/OAuth2-FF7F00?style=for-the-badge&logo=oauth2&logoColor=white" />
  
</p>

### Real-Time / ImgDatabase
<p>
  <img src="https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
</p>

### API
<p>
  <img src="https://img.shields.io/badge/Google_Maps_Platform-4285F4?style=for-the-badge&logo=google-maps&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Places_API-4285F4?style=for-the-badge&logo=google-maps&logoColor=white" />
  <br>
  + 외부 API 등등
</p>

## 📂 프로젝트 폴더 구조

```
TeamProject/
├── 📁 BACK/                     # 🐘 Spring Boot 백엔드 서버
│   ├── 📁 src/main/             # Java 소스 코드
│   │   ├── 📁 java/com/project/team/
│   │   │   ├── 📁 controller/   # API 요청을 처리하는 컨트롤러
│   │   │   ├── 📁 dto/          # 데이터 전송 객체
│   │   │   ├── 📁 exception/    # 예외 처리 관련 클래스
│   │   │   ├── 📁 entity/       # JPA 엔티티 클래스
│   │   │   ├── 📁 repository/   # 데이터베이스 접근 레이어
│   │   │   ├── 📁 security/     # Spring Security 설정 및 관련 클래스
│   │   │   ├── 📁 service/      # 비즈니스 로직 처리 서비스 클래스
│   │   │   ├── 📁 config/       # 애플리케이션 설정 클래스
│   │   │   ├── 📁 utils/        # 유틸리티 클래스
│   │   ├── 📁 resources/scripts # python 크롤링 파일
│   ├── 📁 src/main
│   └── 📄 build.gradle
│
├── 📁 FRONT/                    # ⚛️ React 프론트엔드 (Vite 기반)
│   └── 📁 teamproject/
│       ├── 📁 src/
│       │   ├── 📁 assets/       # 사용하는 이미지 등
│       │   ├── 📁 components/   # 재사용 컴포넌트
│       │   │   └── 📁 login/    # 로그인과 관련된 컴포넌트 
│       │   │   └── 📁 main/     # 메인페이지 구성요소
│       │   │   └── 📁 myPage/   # 마이페이지 구성요소
│       │   │   └── 📁 pdfPages/ # PDF 페이지, 변환
│       │   │   └── 📁 plan/     # 여행계획 페이지 관련요소
│       │   ├── 📁 css/          # 스타일시트 (Tailwind, Chat.css 등)
│       │   ├── 📁 hooks/        # 커스텀 훅 등
│       │   ├── 📁 util/         # 각종 유틸 컴포넌트
│       │   ├── 📄 main.tsx       # 라우터 설정 및 최상위 컴포넌트
│       ├── 📄 package.json
│       └── 📄 vite.config.ts    # Vite 빌드 설정
│
└── 📁 기록/                     # 📝 프로젝트 문서 및 기술 결정 기록
    ├── 📄 API명세서.md
    └── 📄 WebSocket.md / WebClient.md 등 핵심 기술 결정 문서
```