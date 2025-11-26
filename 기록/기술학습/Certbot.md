# 🛠️ Certbot HTTPS 적용 명령어 수정 및 정리

| 번호 | 구분 | 수정/정리된 명령어 | 수정/정리 사유 및 설명 |
| :--- | :--- | :--- | :--- |
| 1 | **디렉토리 생성** | `sudo mkdir -p /etc/letsencrypt` | 인증서 설정 파일을 위한 디렉토리입니다. (`md` 파일에 누락된 필수 단계입니다.) |
| 2 | **디렉토리 생성** | `sudo mkdir -p /var/www/certbot` | Webroot 인증을 위한 디렉토리입니다. |
| 3 | **시스템 업데이트** | `sudo apt update` | `apt install` 전에 시스템 패키지 목록을 최신화합니다. |
| 4 | **Snapd 설치** | `sudo apt install -y snapd` | Certbot 설치를 위해 `snapd`를 설치합니다. (`md` 파일의 1.1\~1.2 단계와 일치) |
| 5 | **Snapd 핵심 업데이트** | `sudo snap install core` <br> `sudo snap refresh core` | `snap` 환경을 최신 상태로 유지합니다. (`md` 파일의 1.2 단계와 일치) |
| 6 | **Certbot 설치** | `sudo snap install --classic certbot` | `apt` 설치 후 제거하고 **Snap**으로 재설치했던 과정을 하나로 통일했습니다. (`md` 파일의 1.3 단계와 일치) |
| 7 | **심볼릭 링크** | `sudo ln -s /snap/bin/certbot /usr/bin/certbot` | `certbot` 명령어를 전역에서 사용하기 위한 링크입니다. (`/user/bin/certbot` 오타를 `/usr/bin/certbot`으로 수정했습니다.) |
| 8 | **DH 매개변수 생성** | `sudo openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048` | **Diffie-Hellman 매개변수**를 생성하여 SSL 보안 강도를 높입니다. (개별 명령어에 있었으나 `md` 파일에 누락된 필수 보안 설정입니다.) |
| 9 | **Nginx SSL 설정 파일 생성** | `sudo bash -c 'cat > /etc/letsencrypt/options-ssl-nginx.conf' <<EOF` <br> `... (내용) ...` <br> `EOF` | Nginx에 Let's Encrypt 권장 **SSL 보안 설정**을 적용합니다. (개별 명령어에 있었으나 `md` 파일에 누락된 필수 보안 설정입니다.) |
| 10 | **인증서 발급** | `sudo certbot certonly --webroot -w /var/www/certbot -d tlan.kro.kr` | 최종적으로 인증서를 발급받습니다. (중복된 명령어를 하나로 통일하고, `tlan.kro.kr` 도메인으로 명확히 했습니다.) |

-----

# 발급받은 후 Nginx.conf 설정

저는 nginx.conf 를 프론트에 넣어서 사용중이에용
tlan.kro.kr 라고 되어있는부분이나 자기에게 맞게 수정 필요
이거 그대로 적으면 오류나용

```conf
# 80 포트 서버: HTTP 요청을 HTTPS로 리디렉션
server {
    listen 80;
    server_name tlan.kro.kr;

    # Certbot 도메인 소유권 인증을 위한 경로
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 그 외 모든 HTTP 요청은 HTTPS로 리디렉션
    location / {
        return 301 https://$host$request_uri;
    }
}

# 443 포트 서버: 실제 HTTPS 서비스
server {
    listen 443 ssl;
    server_name tlan.kro.kr;

    # SSL 인증서 경로
    ssl_certificate /etc/letsencrypt/live/tlan.kro.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tlan.kro.kr/privkey.pem;

    # SSL 관련 권장 설정
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root   /usr/share/nginx/html; # 모든 정적 파일의 기본 위치 설정
    index  index.html;

    # Certbot 도메인 소유권 인증을 위한 경로
    # Let's Encrypt가 http://tlan.kro.kr/.well-known/acme-challenge/xxxx 에 접속하여 인증 파일을 확인합니다.
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    ....(생략)
}
```