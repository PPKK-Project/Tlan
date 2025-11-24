<div align="center">
  <h1>✈️ Tlan (Travel Plan)</h1>
  <strong>나만의 여행을 계획하고, 공유하고, 쉽게 떠나보세요.</strong>
</div>

<br />

## 📋 프로젝트 개요
- **프로젝트명**: 틀랜 (Tlan)
- **개발 기간**: 2025-10-29 ~ 2025-12-10 (6주)
- **개발 인원**: 4명 (팀 프로젝트)
- **프로젝트 타입**: Full-stack Web Application (React + Spring Boot)

## 🎯 개발 배경
여행 계획을 세우는 과정은 많은 정보 탐색과 수작업 일정 조정을 필요로 합니다. 특히 **여러 웹사이트에서 장소 정보를 찾아보고 일정에 맞게 배치하는 과정은 번거롭고 비효율적**입니다. 또한, 여행 도중에는 현지 상황, 날씨, 안전 공지 등 실시간 정보 확인이 어렵고 분산되어 있어 **불편함이 많습니다**.

이러한 문제점을 해결하기 위해, 팀은 다양한 **공공 데이터 및 외부 API(Google Place API 등)** 를 활용하여
사용자가 안전하고 편리하게 해외여행 계획을 세우고, 여행 중에도 필요한 정보를 한 곳에서 확인할 수 있는 통합 여행 서비스가 필요하다고 판단하였습니다.

## ✨ 주요 기능

**여행 계획 수립**과 **실시간 정보 및 협업** 기능을 결합하여 여행의 전 과정을 지원합니다.

### 🗺️ 계획 수립 및 관리

  * **기간별 여행 계획 CRUD** 
  * **장소 검색 및 지도 연동** 
  * **PDF 계획서 다운로드** 
  * **항공권/숙박/음식점 정보 표시** 

### 🤝 실시간 협업 및 소통

  * **실시간 채팅 및 공유** 
  * **권한 기반 접근 제어** 

### 🚨 안전 및 실시간 정보

  * **위험 지역 정보** 
  * **응급 상황 대처** 
  * **실시간 환율 및 환전소** 

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
│   │   │   ├── ......./
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