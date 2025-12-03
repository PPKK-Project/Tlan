# 문제발생
하나의 GCP VM 안에

mariadb-server (3306:3306 노출)

spring-boot-app (8080:8080)

frontend-app (80,443)

전부 같은 VM, 같은 Docker 네트워크(my-app-network) 사용

GCP 방화벽에 sqlprotect 규칙으로 tcp:3306, 5173 전체 IP 허용중인 상황이라

docker run ... -p 3306:3306 때문에
→ VM 외부 IP의 3306 포트가 열림

sqlprotect 룰이 전체 IP(0.0.0.0/0) 허용이라
→ 전세계에서 3306으로 바로 DB 접속 시도 가능

그래서 로그에 계속
→ Access denied for user 'root'@'... 가 쏟아지는 것

구조상 DB가 인터넷 전체에 공개되어 있는 상태

# 해결방법
앱/DB/프론트가 전부 한 VM 안의 Docker 컨테이너라면,
사실 외부에서 3306 포트로 접속할 일이 없다.

spring-boot-app 컨테이너 → mariadb-server 컨테이너

같은 Docker 네트워크에서

호스트명: mariadb-server

포트: 3306

외부 클라이언트는

오직 80, 443 (프론트) 만 접속

그러니까 3306은 GCP 방화벽 + Docker 둘 다에서 막는 게 맞는 구조이다

> Docker run 에서 3306 포트 노출 제거
> 잘못연 3306 0.0.0.0/0 설정 제거