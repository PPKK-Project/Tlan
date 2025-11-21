FROM gradle:7.6.1-jdk17 AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# Runtime Stage: JAR 파일이 실행되는 최종 환경
FROM eclipse-temurin:17-jre-focal
WORKDIR /app

# --- Python & Playwright 환경 설치 시작 ---
# eclipse-temurin:17-jre-focal은 Debian/Ubuntu 기반이므로 apt 사용

# 1. apt 업데이트 및 Python 3, pip, 필수 Playwright 시스템 종속성 설치
# 문제가 되는 libharfbuzz-icu를 제거하고, 필수 Playwright 런타임 종속성을 재조정합니다.
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    # Playwright 최소 필수 종속성 (Focal 기준)
    libnss3 \
    libfontconfig1 \
    libgtk-3-0 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgstreamer-plugins-base1.0-0 \
    libgstreamer1.0-0 \
    libicu-dev \
    libjpeg-turbo8 \
    libpangocairo-1.0-0 \
    libwebp-dev \
    libwoff-dev \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 && \
    rm -rf /var/lib/apt/lists/*

# 2. 필요한 크롤링 라이브러리 설치 (beautifulsoup4와 requests)
RUN pip3 install beautifulsoup4 requests

# 3. Playwright Python 패키지 설치
RUN pip3 install playwright

# 4. Playwright 브라우저 바이너리 설치 (Chromium, Firefox, WebKit)
# 이 명령이 실제 브라우저 파일을 컨테이너 내부에 다운로드합니다.
RUN python3 -m playwright install --with-deps

# --- Python & Playwright 환경 설치 끝 ---

# 빌드 스테이지에서 최종 JAR 복사
COPY --from=build /app/build/libs/team-0.0.1-SNAPSHOT.jar app.jar

# Spring Boot 실행
ENTRYPOINT ["java", "-jar", "/app/app.jar"]