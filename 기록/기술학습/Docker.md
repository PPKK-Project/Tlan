## 📝 도커파일(Dockerfile) 작성 가이드

도커파일은 도커 이미지를 빌드하기 위한 명령어들을 순차적으로 나열해 놓은 **텍스트 파일**입니다. 이 파일은 컨테이너화할 애플리케이션의 **운영 환경을 정의**합니다.

-----

## 1\. 도커파일의 기본 구조 및 빌드 과정

도커 이미지는 도커파일에 정의된 각 명령어(**Instruction**)가 실행되어 생성되는 **'레이어(Layer)'** 들의 집합입니다.

### 💡 레이어(Layer)의 중요성

  * **재사용성**: 한 번 빌드된 레이어는 **캐시**되어 다음 빌드 시 변경 사항이 없으면 재사용됩니다.
  * **용량 효율**: 여러 이미지가 같은 레이어를 **공유**할 수 있어 디스크 공간을 절약합니다.
  * **빌드 속도**: 캐시를 활용하여 빌드 속도를 높입니다.

-----

## 2\. 도커파일의 필수 명령어

| 명령어 | 역할 | 설명 |
| :--- | :--- | :--- |
| **FROM** | 베이스 이미지 설정 | 모든 도커파일의 **첫 번째 명령어**입니다. 이미지 빌드를 시작할 기본 환경(OS, 런타임 등)을 지정합니다. |
| **RUN** | 빌드 시 명령 실행 | 이미지 빌드 과정에서 필요한 명령(예: 패키지 설치, 파일 다운로드)을 실행하고 그 결과를 새로운 **레이어로 저장**합니다. |
| **CMD** | 컨테이너 실행 명령 | 컨테이너가 시작될 때 **기본적으로 실행될 명령**을 지정합니다. 도커파일당 하나만 사용 가능하며, `docker run` 명령으로 덮어쓸 수 있습니다. |
| **ENTRYPOINT** | 컨테이너 실행 명령 | 컨테이너가 시작될 때 **항상 실행될 명령**을 지정합니다. `docker run`으로 덮어쓸 수 없으며, **CMD와 함께 사용**되어 실행될 인수(Arguments)를 설정하는 데 주로 쓰입니다. |

### 예시: CMD와 ENTRYPOINT의 차이

| 사용법 | `docker run <image>` 실행 시 결과 |
| :--- | :--- |
| `CMD ["echo", "Hello"]` | `Hello` 출력 |
| `CMD ["echo", "World"]` + `docker run <image> Korea` | `Korea` 출력 (CMD가 덮어쓰임) |
| `ENTRYPOINT ["echo"]` `CMD ["Hello"]` | `Hello` 출력 (CMD는 인수로 사용됨) |
| `ENTRYPOINT ["echo"]` `CMD ["Hello"]` + `docker run <image> World` | `World` 출력 (CMD만 덮어쓰고 ENTRYPOINT는 유지됨) |

-----

## 3\. 파일 및 환경 설정 명령어

| 명령어 | 역할 | 설명 |
| :--- | :--- | :--- |
| **COPY** | 파일 복사 | **호스트 머신**의 파일/디렉토리를 **이미지 내부**로 복사합니다. 가장 흔하게 사용됩니다. |
| **ADD** | 파일 복사 (고급) | `COPY`와 비슷하지만, tar 아카이브를 자동으로 압축 해제하거나 원격 URL에서 파일을 가져올 수 있는 추가 기능이 있습니다. **보안/캐싱 문제로 보통 COPY를 권장합니다.** |
| **WORKDIR** | 작업 디렉토리 설정 | `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD`와 같은 명령어들이 실행될 이미지 내의 **작업 디렉토리를 지정**합니다. |
| **ENV** | 환경 변수 설정 | 이미지 내부에서 사용할 **영구적인 환경 변수**를 설정합니다. |
| **ARG** | 빌드 시 변수 설정 | **빌드 시간(Build Time)**에만 사용되는 변수를 정의합니다. 컨테이너 내부에서는 사용할 수 없습니다. `docker build --build-arg key=value`로 값을 전달합니다. |
| **EXPOSE** | 포트 노출 | 컨테이너가 수신 대기하는 포트(**Port**)를 **문서화**합니다. 실제로 포트를 외부와 연결하려면 `docker run -p` 옵션이 필요합니다. |

-----

## 💡 실전 예제: Spring Boot 및 React 애플리케이션 도커파일

멀티 스테이지 빌드는 빌드 환경과 최종 실행 환경을 분리하여 **최종 이미지 크기를 대폭 줄이는** 현대적인 도커파일 작성 방식입니다.

-----

### 1\. ☕ Spring Boot 애플리케이션 도커파일 (멀티 스테이지)

Spring Boot 애플리케이션은 보통 Maven이나 Gradle로 빌드하여 `.jar` 파일을 생성합니다.

#### 파일 구조

```
/spring-app
  ├── Dockerfile
  ├── build.gradle
  └── src/ (소스 코드)
```

#### 📄 Dockerfile 내용

```dockerfile
# ----------------------------------------------------
# 1단계: 빌드 환경 (Build Stage)
# Gradle을 사용하여 JAR 파일을 빌드합니다.
# ----------------------------------------------------
FROM gradle:8.5-jdk17 AS builder

# 작업 디렉토리 설정
WORKDIR /app

# Gradle Wrapper 및 종속성 파일 복사 (캐시 활용)
# 자주 변경되지 않는 파일들을 먼저 복사하여 도커 캐시를 효율적으로 사용합니다.
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# 종속성 다운로드 (새로운 레이어)
# 소스 코드가 변경되어도 이 레이어는 캐시를 유지할 수 있습니다.
RUN ./gradlew dependencies

# 나머지 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드
# 'build/libs/' 디렉토리에 JAR 파일이 생성됩니다.
RUN ./gradlew build -x test

# ----------------------------------------------------
# 2단계: 실행 환경 (Runtime Stage)
# 가볍고 안전한 JRE(Java Runtime Environment)만 사용합니다.
# ----------------------------------------------------
FROM openjdk:17-jre-slim

# 아규먼트 (빌드 단계에서 생성된 JAR 파일 이름)
# Spring Boot의 기본 JAR 파일 패턴을 따릅니다.
ARG JAR_FILE=build/libs/*.jar

# 작업 디렉토리 설정
WORKDIR /usr/app

# 1단계(builder)에서 생성된 JAR 파일을 복사
# cp 명령을 사용하여 'app.jar'이라는 이름으로 복사합니다.
COPY --from=builder /app/${JAR_FILE} app.jar

# 컨테이너 실행 시 사용할 포트 노출
EXPOSE 8080

# 애플리케이션 실행 명령
# -Djava.security.egd=file:/dev/./urandom: 난수 생성 속도 개선 옵션
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
```
-----

### 2\. ⚛️ React 애플리케이션 도커파일 (멀티 스테이지)

React 애플리케이션은 Node.js로 빌드된 후, 빌드된 정적 파일(HTML, CSS, JS)을 **Nginx** 같은 웹 서버를 통해 서비스하는 것이 일반적이며 가장 효율적입니다.

#### 파일 구조

```
/react-app
  ├── Dockerfile
  ├── package.json
  ├── package-lock.json
  ├── .env (환경 변수)
  ├── nginx.conf (Nginx 설정 파일)
  └── src/ (소스 코드)
```

#### 📄 Dockerfile 내용

```dockerfile
# ----------------------------------------------------
# 1단계: 빌드 환경 (Build Stage)
# Node.js를 사용하여 React 프로젝트를 빌드합니다.
# ----------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# 종속성 파일 복사
COPY package*.json ./

# 종속성 설치 (캐시 레이어)
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# React 프로젝트 빌드 (정적 파일 생성)
# 'build' 디렉토리에 결과물이 생성됩니다.
RUN npm run build

# ----------------------------------------------------
# 2단계: 실행 환경 (Runtime Stage)
# 매우 가벼운 Nginx를 사용하여 정적 파일을 서빙합니다.
# ----------------------------------------------------
FROM nginx:alpine

# Nginx 설정을 컨테이너 내부의 기본 경로로 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 1단계(builder)에서 생성된 빌드 결과물을 Nginx의 웹 서버 루트 디렉토리로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 기본 포트 노출
EXPOSE 80

# Nginx는 기본적으로 CMD가 설정되어 있으므로 별도로 정의하지 않아도 됩니다.
```

#### 🌟 특징
  * **환경 설정:** `nginx.conf` 파일을 통해 프록시 설정, 캐시 설정 등 상세한 웹 서버 제어가 가능합니다.

