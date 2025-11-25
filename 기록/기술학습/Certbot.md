## 🛠️ Certbot HTTPS 적용 명령어 수정 및 정리

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
