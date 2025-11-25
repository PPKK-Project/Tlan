## 🚀 CI/CD 및 GCP VM 배포 환경 구축 가이드 (End-to-End)

본 가이드는 **GitHub 저장소에 코드를 푸시했을 때, 자동으로 GCP VM에 애플리케이션이 배포되는 파이프라인(Pipeline) 구축의 모든 단계**를 다룹니다.
> GCP와 저희 프로젝트를 기준으로 합니다. aws랑 달라용
---

### 1단계: Google Cloud Platform (GCP) 초기 설정

가장 먼저 배포 환경이 될 GCP 리소스를 준비해야 합니다.

#### 1.1. GCP 프로젝트 생성 및 선택

- GCP 콘솔에 접속하여 **새 프로젝트를 생성하거나 기존 프로젝트를 선택** 합니다.
  > https://velog.io/@helloaway/Docker%EC%99%80-GCP%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-React-Spring-boot-mysql-%EB%B0%B0%ED%8F%AC-%EC%B4%9D-%EC%A0%95%EB%A6%AC1%ED%8E%B8
  > (CLOUD SQL 안해도 됨)

#### 1.2. 필요한 API 활성화

배포에 필요한 서비스들의 API를 활성화해야 합니다.

- **API 및 서비스 \> 라이브러리** 메뉴로 이동하여 다음 API를 검색하고 '사용 설정'합니다.
  - **Artifact Registry API**: Docker 이미지를 저장할 저장소 서비스.
  - **Compute Engine API**: 가상 머신(VM)을 관리하는 서비스.

#### 1.3. 서비스 계정(Service Account) 생성 및 권한 부여

GitHub Actions가 GCP 리소스에 접근할 수 있도록 '대리인' 역할을 할 서비스 계정을 만듭니다.

- **IAM 및 관리자 \> 서비스 계정** 에서 **'서비스 계정 만들기'** 를 클릭합니다.
- 계정 이름을 지정하고, 다음 **역할** 을 부여합니다.
  - **Artifact Registry 관리자** (`roles/artifactregistry.admin`): Artifact Registry에 이미지를 푸시하고 관리할 권한.
  - **Compute Engine 관리자** (`roles/compute.admin`): VM 인스턴스에 SSH로 접속하고 관리할 권한.
  - **서비스 계정 사용자** (`roles/iam.serviceAccountUser`): 서비스 계정이 다른 리소스에 접근할 수 있도록 하는 권한.
- 계정 생성을 완료합니다.

#### 1.4. 서비스 계정 키(JSON) 발급 (민감 정보\!)

- 생성된 서비스 계정의 이메일 주소를 클릭합니다.
- **키** 탭으로 이동하여 **키 추가 \> 새 키 만들기**를 선택합니다.
- 키 유형은 **JSON**으로 선택하고 '만들기'를 클릭하면 JSON 파일이 다운로드됩니다.
  > **⚠️ 중요:** 이 파일은 **매우 민감한 정보**이므로 안전하게 보관해야 하며, 나중에 GitHub Secrets에 등록할 때 **전체 내용**을 사용합니다.

#### 1.5. Artifact Registry 저장소 생성

- **Artifact Registry** 메뉴로 이동하여 **'저장소 만들기'**를 클릭합니다.
  - **이름** (예: `tlan-repo`)을 입력합니다.
  - **형식**은 **Docker**를 선택합니다.
  - **리전**은 `asia-northeast3` (서울) 또는 원하는 위치로 설정합니다.

---

### 2단계: GitHub Actions 소개

GitHub Actions는 GitHub 저장소 내에서 코드 빌드, 테스트, 배포 등의 워크플로우를 자동화할 수 있게 해주는 CI/CD(지속적 통합/지속적 배포) 플랫폼입니다. `.github/workflows` 디렉터리에 YAML 형식의 파일을 작성하여 워크플로우를 정의하면, 특정 이벤트(예: `push`, `pull_request`)가 발생했을 때 정의된 작업들이 자동으로 실행됩니다.

#### 주요 구성 요소

- **Workflow (워크플로우)**: 하나 이상의 Job으로 구성된 자동화된 프로세스 전체를 의미합니다. `.yml` 파일 하나가 하나의 워크플로우입니다.

이 가이드에서는 `main` 브랜치에 코드가 푸시(`push` 이벤트)될 때, GitHub 호스팅 Runner에서 CI/CD 워크플로우가 실행되도록 설정합니다.

---


### 3단계: GitHub 저장소 및 Secrets 설정

이제 GitHub에서 CI/CD를 실행할 준비를 합니다.

#### 2.1. 프로젝트 코드 업로드

- `BACK`, `FRONT`, `.github/workflows/main.yml` 등 **모든 프로젝트 파일을 GitHub 저장소에 푸시**합니다.

#### 2.2. GitHub Secrets 설정

민감한 정보를 코드에 노출하지 않기 위해 GitHub Secrets에 등록합니다.

- 프로젝트 저장소의 **Settings \> Secrets and variables \> Actions**로 이동하여 **'New repository secret'**을 클릭하고 다음 정보들을 등록합니다.

| Secret 이름 | 값 (Value) | 설명 |
| :--- | :--- | :--- |
| **GCP_PROJECT_ID** | `your-gcp-project-id` | 1단계에서 생성한 GCP 프로젝트의 ID입니다. |
| **GCP_SA_KEY** | (1-4에서 다운로드한 JSON 파일의 전체 내용) | **서비스 계정 키 파일의 전체 내용**을 복사/붙여넣기 합니다. |
| **VM_NAME** | `your-vm-instance-name` | 배포할 GCP VM의 이름입니다. (4단계에서 생성) |
| **VM_ZONE** | `asia-northeast3-c` | VM이 위치한 Zone입니다. (4단계에서 생성) |
| **VITE_KOSIS_KEY** | (KOSIS API 키) | 프론트엔드 빌드 시 필요한 API 키입니다. |
| **VITE_GOOGLE_MAPS_API_KEY** | (Google Maps API 키) | 프론트엔드 빌드 시 필요한 API 키입니다. |
| **BACKEND_CONFIG_FILE** | (`application.properties` 파일의 전체 내용) | 백엔드 Spring Boot의 설정 파일 내용을 복사/붙여넣기 합니다. |
| **FRONTEND_CONFIG_FILE** | (`.env` 파일의 전체 내용) | 프론트엔드의 런타임 환경변수 파일 내용을 복사/붙여넣기 합니다. |

---

### 4단계: GCP Compute Engine (VM) 설정

실제 애플리케이션이 구동될 서버 환경을 구축합니다.

#### 3.1. VM 인스턴스 생성

- **Compute Engine \> VM 인스턴스**에서 **'인스턴스 만들기'**를 클릭합니다.
  - **이름** (예: `teamproject-vm`), **리전** (예: `asia-northeast3`), **영역** (예: `asia-northeast3-c`)을 지정합니다.
  - **방화벽** 섹션에서 **`HTTP 트래픽 허용`**과 **`HTTPS 트래픽 허용`**을 모두 체크합니다.
  - **운영체제**는 **`Ubuntu 20.04 LTS`** 또는 선호하는 Linux 배포판을 선택합니다.
- **'만들기'**를 클릭하여 인스턴스를 생성합니다.

#### 3.2. VM에 접속하여 필수 도구 설치

생성된 VM 인스턴스 목록에서 **'SSH'** 버튼을 눌러 터미널에 접속하고, 아래 명령어를 순서대로 실행하여 **Docker**, **Docker Compose**, **gcloud CLI**를 설치합니다.

```bash
# 시스템 패키지 업데이트
sudo apt-get update

# Docker 설치
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가 (sudo 없이 docker 명령어 사용 가능)
sudo usermod -aG docker $USER
# --- 중요 ---
# 그룹 변경사항을 적용하려면 SSH 세션을 종료했다가 다시 접속해야 합니다.
exit
```

다시 SSH로 접속한 후, 아래 명령어를 마저 실행합니다.

```bash
# gcloud CLI 설치
sudo apt-get install -y apt-transport-https ca-certificates gnupg

echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

sudo apt-get update
sudo apt-get install -y google-cloud-cli
```

#### 3.3. VM 내 Docker 네트워크 생성

컨테이너들이 서로 통신할 수 있도록 Docker 네트워크를 생성합니다.

```bash
docker network create my-app-network
```
#### 3.4. VM 인스턴스에 HTTPS (SSL/TLS) 적용
이 단계는 Let's Encrypt의 Certbot을 사용하여 도메인 인증서를 발급받고, 이를 Nginx 컨테이너에서 사용할 수 있도록 환경을 준비하는 과정입니다.

- 도메인 사용해서 A타입으로 DNS 설정 VM인스턴스의 외부 IP로 해주고 (도메인 발급 필요)
VN 인스턴스의 내부에서 Certbot 을 이용해서 인증서 발급 후 Nginx를 사용해 적용
> https://내도메인.한국 

에서 도메인 하나 만들고 고급설정(DNS)에 IP연결(A) 에 외부 ip 넣고 저장

```bash
sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot certonly --standalone -d your-domain.com --preferred-challenges http
```
이제 CI/CD의 **CD Job (deploy 단계)** 에서 프론트엔드 Nginx 컨테이너를 실행할 때, 이 인증서 파일들이 저장된 /etc/letsencrypt 디렉토리를 컨테이너 내부로 **마운트(Mount)** 하도록 docker run 명령어를 수정해야 합니다.

Let's Encrypt 인증서는 90일마다 갱신해야 합니다. Certbot이 설치되면 시스템에 자동 갱신을 위한 cron 또는 systemd 타이머가 자동으로 등록됩니다.

---

## 5단계: Dockerfile 및 워크플로우 (main.yml) 이해

`main.yml` 파일은 GitHub Actions가 수행해야 할 작업을 순서대로 정의합니다. 크게 **CI (Continuous Integration) Job**과 **CD (Continuous Deployment) Job**으로 나뉩니다.

### 4.1. CI Job (`build-and-push`) 상세 설명

이 단계는 코드를 빌드하고, Docker 이미지로 만든 후, GCP Artifact Registry에 저장하는 역할을 합니다.

| 순서 | 작업 내용 | 역할 및 핵심 포인트 |
| :--- | :--- | :--- |
| **1. 인증** | GCP에 서비스 계정 키(`GCP_SA_KEY`)를 사용하여 인증합니다. | **Artifact Registry에 이미지 푸시 권한**을 확보합니다. |
| **2. 빌드 (백엔드)** | `BACK` 디렉터리에 있는 Spring Boot 코드를 Docker 이미지로 빌드합니다. | Spring Boot 애플리케이션과 JRE 환경을 포함하는 Docker 이미지를 생성합니다. |
| **3. 빌드 (프론트엔드)** | `FRONT` 디렉터리에 있는 React 코드를 Docker 이미지로 빌드합니다. | **핵심**: Secrets에 저장된 `VITE_*` 키들을 `--build-arg` 옵션을 통해 **빌드 시점에 주입**하여, API 키가 포함된 정적 파일을 생성합니다. |
| **4. 이미지 태그** | 빌드된 이미지에 GCP Artifact Registry 경로와 `latest` 태그를 붙입니다. | `asia-northeast3-docker.pkg.dev/$GCP_PROJECT_ID/tlan-repo/frontend-app:latest`와 같은 **고유 주소**를 만듭니다. |
| **5. 푸시** | 태그가 붙은 두 이미지를 GCP Artifact Registry로 업로드합니다. | VM에서 다운로드할 수 있도록 **이미지를 중앙 저장소에 안전하게 보관**합니다. |

- **실행 조건**: `main` 브랜치에 코드가 푸시되면 GitHub Actions가 실행됩니다.
- **작업 흐름**:
  1.  GCP에 서비스 계정 키(`GCP_SA_KEY`)를 사용하여 인증합니다.
  2.  백엔드와 프론트엔드 코드를 각각 **Docker 이미지로 빌드**합니다.
  3.  **핵심**: 프론트엔드 빌드 시, GitHub Secrets에 저장된 `VITE_*` 키들이 `--build-arg`를 통해 **빌드 시점에 주입**됩니다.
  4.  빌드된 두 이미지는 GCP **Artifact Registry**에 `latest` 태그로 **푸시**됩니다.

### 4.2. CD Job (`deploy`) 상세 설명

이 단계는 CI Job이 성공한 후, VM에 접속하여 최신 이미지를 받아 배포(재실행)하는 역할을 합니다. **VM 내부에서 실행되는 명령어 묶음이 가장 중요합니다.** 

| 순서 | 작업 내용 | 역할 및 핵심 포인트 |
| :--- | :--- | :--- |
| **1. 설정 읽기** | GitHub Secrets에 저장된 `BACKEND_CONFIG_FILE`, `FRONTEND_CONFIG_FILE`의 내용을 환경 변수로 읽어옵니다. | 런타임에 필요한 **설정 파일 내용**을 준비합니다. |
| **2. SSH 접속** | `gcloud compute ssh` 명령어로 VM에 접속하고, 괄호 안의 모든 명령어를 실행합니다. | **배포의 실행 지점**입니다. VM의 `gcloud CLI`와 GitHub Actions의 **서비스 계정 권한**을 이용합니다. |
| **3. 이미지 Pull** | VM에서 Artifact Registry에 푸시된 최신 이미지를 `docker pull` 합니다. | **최신 버전의 애플리케이션 이미지**를 VM으로 가져옵니다. |
| **4. 기존 컨테이너 중지/삭제** | 실행 중이던 `frontend-app`, `spring-boot-app`, `mariadb-server` 컨테이너를 중지하고 삭제합니다. | **무중단은 아니지만, 가장 단순하고 안전한 업데이트 방식**입니다. |
| **5. 설정 파일 생성** | Secret에서 읽어온 설정 파일 내용을 VM의 `/tmp` 경로에 `application.properties`와 `.env` 파일로 만듭니다. | 컨테이너에 마운트할 **최종 설정 파일**을 준비합니다. |
| **6. 컨테이너 재실행** | `docker run` 명령어로 DB, 백엔드, 프론트엔드 순서로 컨테이너를 재실행합니다. | **핵심**: 설정 파일을 `/tmp`에서 컨테이너 내부로 **마운트**합니다. DB는 데이터 영속성을 위해 **Docker Volume**을 마운트합니다. |
| **7. 리소스 정리** | `docker system prune -f` 명령어로 사용하지 않는 Docker 리소스를 정리합니다. | **VM 디스크 공간 낭비를 방지**하고 깨끗하게 유지합니다. |

- **실행 조건**: CI Job이 성공하면 CD Job이 실행됩니다.
- **작업 흐름**:
  1.  GitHub Secrets에 저장된 `BACKEND_CONFIG_FILE`과 `FRONTEND_CONFIG_FILE`의 내용을 환경 변수로 읽어옵니다.
  2.  `gcloud compute ssh` 명령어를 통해 4단계에서 설정한 VM에 **원격으로 접속**합니다.
  3.  **VM 내부에서 다음 작업들이 순차적으로 실행됩니다.**
      - Artifact Registry에서 방금 푸시된 **최신 이미지**를 `docker pull`로 가져옵니다.
      - 기존에 실행 중이던 컨테이너들(ex: `frontend-app`, `spring-boot-app`, `mariadb-server`)을 모두 **중지하고 삭제**합니다.
      - GitHub Actions 환경 변수에 담아두었던 설정 파일 내용을 VM의 `/tmp` 경로에 `application.properties`와 `.env` 파일로 **생성**합니다.
      - `docker run` 명령어로 컨테이너들을 **다시 실행**합니다.
        - **MariaDB**: 데이터 영속성을 위해 Docker 볼륨(`mariadb_data`)을 사용합니다.
        - **Spring Boot**: `/tmp/application.properties` 파일을 컨테이너 내부로 **마운트**하여 실행합니다.
        - **React (Nginx)**: `/tmp/.env` 파일과 HTTPS 인증서 관련 폴더들을 **마운트**하여 실행합니다.
      - 마지막으로 `docker system prune` 명령어로 사용하지 않는 Docker 리소스를 정리하여 VM의 디스크 공간을 확보합니다.

> main.yml 파일은 Ai 사용하셔서 프로젝트에 맞게 작성하시는걸 추천 드립니다.
---


### 🚨 발생 가능한 문제 및 해결 방안

파이프라인을 운영하다 보면 예상치 못한 문제들이 발생할 수 있습니다. 다음은 자주 겪을 수 있는 문제와 그에 대한 해결 방안입니다.

#### 1. 방화벽 문제

- **문제점**: VM 인스턴스 설정 시 `HTTP/HTTPS 트래픽 허용`을 체크했음에도 불구하고, 배포된 애플리케이션에 접속할 수 없는 경우가 있습니다.
- **원인**: GCP 방화벽 규칙은 기본적으로 80, 443 포트만 허용합니다. 만약 백엔드(예: 8080)나 프론트엔드(예: 3000)를 다른 포트로 직접 노출하는 경우, 해당 포트가 방화벽에 의해 차단됩니다.
- **해결 방안**:
  - **VPC 네트워크 > 방화벽** 메뉴로 이동합니다.
  - **방화벽 규칙 만들기**를 클릭하여 애플리케이션이 사용하는 특정 포트(예: `tcp:8080`)에 대한 인그레스(Ingress) 규칙을 추가합니다.
  - 규칙의 **대상 태그**를 VM 인스턴스의 **네트워크 태그**와 일치시켜 해당 VM에만 규칙이 적용되도록 설정하는 것이 좋습니다.

#### 2. VM 인스턴스 디스크 용량 부족

- **문제점**: 배포가 반복되면서 VM의 디스크 공간이 가득 차서 `docker pull`이 실패하거나 서버가 멈추는 현상이 발생할 수 있습니다.
- **원인**: `docker system prune -f` 명령어가 사용하지 않는 이미지를 정리해주지만, 계속 쌓이는 Docker 볼륨 데이터, 애플리케이션 로그 파일 등은 삭제하지 않습니다.
- **해결 방안**:
  - **주기적인 모니터링**: SSH 접속 후 `df -h` 명령어로 디스크 사용량을 주기적으로 확인합니다.
  - **로그 관리**: 애플리케이션 로그가 과도하게 쌓이지 않도록 `logrotate`와 같은 도구를 설정하여 오래된 로그를 자동으로 압축하거나 삭제하는 정책을 마련합니다.
  - **불필요한 볼륨 정리**: `docker volume ls`로 생성된 볼륨 목록을 확인하고, 더 이상 사용하지 않는 볼륨은 `docker volume rm <볼륨이름>` 명령어로 삭제합니다.

---

### 🎉 배포 완료

이제 `main` 브랜치에 코드를 푸시하면, 이 모든 과정이 자동으로 실행되어 **GCP VM에 최신 버전의 애플리케이션이 배포**됩니다.

---

> 어렵다면 AI에게 Springboot React 기반 프로젝트를 GCP VM인스턴스에 Docker 이용해서 배포하고싶다고 말하면 잘 설명 해줍니다 \
오류나면 그대로 복사해서 물어보면 해결가능해요


도커 빌드
vm인스턴스 도커설치
artifact registory 도커 푸쉬
vm인스턴스에서 컨테이너 pull
vm인스턴스 안에서 도커 실행시키고 컨테이너실행