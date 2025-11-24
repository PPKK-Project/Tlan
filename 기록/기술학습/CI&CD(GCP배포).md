## 🚀 CI/CD 및 GCP VM 배포 환경 구축 가이드 (End-to-End)

본 가이드는 **GitHub 저장소에 코드를 푸시했을 때, 자동으로 GCP VM에 애플리케이션이 배포되는 파이프라인(Pipeline) 구축의 모든 단계**를 다룹니다.

-----

### 1단계: Google Cloud Platform (GCP) 초기 설정

가장 먼저 배포 환경이 될 GCP 리소스를 준비해야 합니다.

#### 1.1. GCP 프로젝트 생성 및 선택

  * GCP 콘솔에 접속하여 **새 프로젝트를 생성하거나 기존 프로젝트를 선택**합니다.

#### 1.2. 필요한 API 활성화

배포에 필요한 서비스들의 API를 활성화해야 합니다.

  * **API 및 서비스 \> 라이브러리** 메뉴로 이동하여 다음 API를 검색하고 '사용 설정'합니다.
      * **Artifact Registry API**: Docker 이미지를 저장할 저장소 서비스.
      * **Compute Engine API**: 가상 머신(VM)을 관리하는 서비스.

#### 1.3. 서비스 계정(Service Account) 생성 및 권한 부여

GitHub Actions가 GCP 리소스에 접근할 수 있도록 '대리인' 역할을 할 서비스 계정을 만듭니다.

  * **IAM 및 관리자 \> 서비스 계정**에서 \*\*'서비스 계정 만들기'\*\*를 클릭합니다.
  * 계정 이름을 지정하고, 다음 **역할**을 부여합니다.
      * **Artifact Registry 관리자** (`roles/artifactregistry.admin`): Artifact Registry에 이미지를 푸시하고 관리할 권한.
      * **Compute Engine 관리자** (`roles/compute.admin`): VM 인스턴스에 SSH로 접속하고 관리할 권한.
      * **서비스 계정 사용자** (`roles/iam.serviceAccountUser`): 서비스 계정이 다른 리소스에 접근할 수 있도록 하는 권한.
  * 계정 생성을 완료합니다.

#### 1.4. 서비스 계정 키(JSON) 발급 (민감 정보\!)

  * 생성된 서비스 계정의 이메일 주소를 클릭합니다.
  * **키** 탭으로 이동하여 **키 추가 \> 새 키 만들기**를 선택합니다.
  * 키 유형은 **JSON**으로 선택하고 '만들기'를 클릭하면 JSON 파일이 다운로드됩니다.
    > **⚠️ 중요:** 이 파일은 **매우 민감한 정보**이므로 안전하게 보관해야 하며, 나중에 GitHub Secrets에 등록할 때 **전체 내용**을 사용합니다.

#### 1.5. Artifact Registry 저장소 생성

  * **Artifact Registry** 메뉴로 이동하여 \*\*'저장소 만들기'\*\*를 클릭합니다.
      * **이름** (예: `tlan-repo`)을 입력합니다.
      * **형식**은 **Docker**를 선택합니다.
      * **리전**은 `asia-northeast3` (서울) 또는 원하는 위치로 설정합니다.

-----

### 2단계: GitHub 저장소 및 Secrets 설정

이제 GitHub에서 CI/CD를 실행할 준비를 합니다.

#### 2.1. 프로젝트 코드 업로드

  * `BACK`, `FRONT`, `.github/workflows/main.yml` 등 **모든 프로젝트 파일을 GitHub 저장소에 푸시**합니다.

#### 2.2. GitHub Secrets 설정

민감한 정보를 코드에 노출하지 않기 위해 GitHub Secrets에 등록합니다.

  * 프로젝트 저장소의 **Settings \> Secrets and variables \> Actions**로 이동하여 \*\*'New repository secret'\*\*을 클릭하고 다음 정보들을 등록합니다.

| Secret 이름 | 값 (Value) | 설명 |
| :--- | :--- | :--- |
| **GCP\_PROJECT\_ID** | `your-gcp-project-id` | 1단계에서 생성한 GCP 프로젝트의 ID입니다. |
| **GCP\_SA\_KEY** | (1-4에서 다운로드한 JSON 파일의 전체 내용) | **서비스 계정 키 파일의 전체 내용**을 복사/붙여넣기 합니다. |
| **VM\_NAME** | `your-vm-instance-name` | 배포할 GCP VM의 이름입니다. (3단계에서 생성) |
| **VM\_ZONE** | `asia-northeast3-c` | VM이 위치한 Zone입니다. (3단계에서 생성) |
| **VITE\_KOSIS\_KEY** | (KOSIS API 키) | 프론트엔드 빌드 시 필요한 API 키입니다. |
| **VITE\_GOOGLE\_MAPS\_API\_KEY** | (Google Maps API 키) | 프론트엔드 빌드 시 필요한 API 키입니다. |
| **BACKEND\_CONFIG\_FILE** | (`application.properties` 파일의 전체 내용) | 백엔드 Spring Boot의 설정 파일 내용을 복사/붙여넣기 합니다. |
| **FRONTEND\_CONFIG\_FILE** | (`.env` 파일의 전체 내용) | 프론트엔드의 런타임 환경변수 파일 내용을 복사/붙여넣기 합니다. |

-----

### 3단계: GCP Compute Engine (VM) 설정

실제 애플리케이션이 구동될 서버 환경을 구축합니다.

#### 3.1. VM 인스턴스 생성

  * **Compute Engine \> VM 인스턴스**에서 \*\*'인스턴스 만들기'\*\*를 클릭합니다.
      * **이름** (예: `teamproject-vm`), **리전** (예: `asia-northeast3`), **영역** (예: `asia-northeast3-c`)을 지정합니다.
      * **방화벽** 섹션에서 \*\*`HTTP 트래픽 허용`\*\*과 \*\*`HTTPS 트래픽 허용`\*\*을 모두 체크합니다.
      * **운영체제**는 **`Ubuntu 20.04 LTS`** 또는 선호하는 Linux 배포판을 선택합니다.
  * \*\*'만들기'\*\*를 클릭하여 인스턴스를 생성합니다.

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
sudo apt-get update && sudo apt-get install -y google-cloud-cli
```

#### 3.3. VM 내 Docker 네트워크 생성

컨테이너들이 서로 통신할 수 있도록 Docker 네트워크를 생성합니다.

```bash
docker network create my-app-network
```

-----

### 4단계: Dockerfile 및 워크플로우 (main.yml) 이해

모든 준비가 완료되었으니, 자동화된 배포의 핵심인 **`main.yml`** 파일의 동작 방식을 이해합니다.

#### 4.1. CI Job (`build-and-push`)

  * **실행 조건**: `main` 브랜치에 코드가 푸시되면 GitHub Actions가 실행됩니다.
  * **작업 흐름**:
    1.  GCP에 서비스 계정 키(`GCP_SA_KEY`)를 사용하여 인증합니다.
    2.  백엔드와 프론트엔드 코드를 각각 **Docker 이미지로 빌드**합니다.
    3.  **핵심**: 프론트엔드 빌드 시, GitHub Secrets에 저장된 `VITE_*` 키들이 `--build-arg`를 통해 **빌드 시점에 주입**됩니다.
    4.  빌드된 두 이미지는 GCP **Artifact Registry**에 `latest` 태그로 **푸시**됩니다.
        > 

#### 4.2. CD Job (`deploy`)

  * **실행 조건**: CI Job이 성공하면 CD Job이 실행됩니다.
  * **작업 흐름**:
    1.  GitHub Secrets에 저장된 `BACKEND_CONFIG_FILE`과 `FRONTEND_CONFIG_FILE`의 내용을 환경 변수로 읽어옵니다.
    2.  `gcloud compute ssh` 명령어를 통해 3단계에서 설정한 VM에 **원격으로 접속**합니다.
    3.  **VM 내부에서 다음 작업들이 순차적으로 실행됩니다.**
          * Artifact Registry에서 방금 푸시된 **최신 이미지**를 `docker pull`로 가져옵니다.
          * 기존에 실행 중이던 컨테이너들(ex: `frontend-app`, `spring-boot-app`, `mariadb-server`)을 모두 **중지하고 삭제**합니다.
          * GitHub Actions 환경 변수에 담아두었던 설정 파일 내용을 VM의 `/tmp` 경로에 `application.properties`와 `.env` 파일로 **생성**합니다.
          * `docker run` 명령어로 컨테이너들을 **다시 실행**합니다.
              * **MariaDB**: 데이터 영속성을 위해 Docker 볼륨(`mariadb_data`)을 사용합니다.
              * **Spring Boot**: `/tmp/application.properties` 파일을 컨테이너 내부로 **마운트**하여 실행합니다.
              * **React (Nginx)**: `/tmp/.env` 파일과 HTTPS 인증서 관련 폴더들을 **마운트**하여 실행합니다.
          * 마지막으로 `docker system prune` 명령어로 사용하지 않는 Docker 리소스를 정리하여 VM의 디스크 공간을 확보합니다.

-----

### 🎉 배포 완료

이제 `main` 브랜치에 코드를 푸시하면, 이 모든 과정이 자동으로 실행되어 **GCP VM에 최신 버전의 애플리케이션이 배포**됩니다.

-----