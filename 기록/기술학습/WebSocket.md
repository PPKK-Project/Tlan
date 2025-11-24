# 웹소켓 
## SpringBoot 설정

### 1. WebSocketConfig.java 
- 웹소켓 통신의 규칙과 접속 지점 설정
1. 웹소켓 엔드포인트 등록(registerStampEndpoints)
```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    // 클라이언트는 ws://localhost:8080/ws-stomp로 연결을 시도함
    // /ws-stamp : 웹소켓 연결을 시도하는 초기 HTTP 엔드포인트
    registry.addEndpoint("/ws-stomp")
            .setAllowedOriginPatterns("*") // 모든 출처 허용 (CORS)
            .withSockJS(); // SockJS를 사용하여 하위 브라우저 호환성 확보
}
```


2. 메시지 브로커 및 앱 목적지 설정(configureMessageBroker)
```java
@Override
public void configureMessageBroker(MessageBrokerRegistry config) {
    // 1. Simple Broker 설정
    config.enableSimpleBroker("/topic");
    // 서버가 클라이언트에게 메시지를 보낼 때 사용하는 목적지(Topic)의 접두사 (예 : `/topic/counter`)
    // 2. Application Destination Prefix 설정
    config.setApplicationDestinationPrefixes("/app");
}
```

## React (클라이언트) 설정

### 1. 연결 설정 및 활성화 (useEffect 내부)
```js
const client = new Client({
    // SockJS를 사용하여 Spring Boot에서 설정한 엔드포인트(/ws-stomp)로 연결을 시도합니다.
    webSocketFactory: () => new SockJS('http://localhost:8080/ws-stomp'),
    // STOMP 연결이 성공적으로 수립된 후 실행
    onConnect: () => {
        // /topic/counter로 전송되는 메시지를 실시간으로 받아보겠다는 요청
        client.subscribe('/topic/counter', (message) => {
            // 3. 메시지 수신 및 화면 업데이트
            const newCount = parseInt(message.body);
            setCount(newCount); 
        });
    },
});
client.activate(); // 연결 시작
```
### 2. 서버로 메시지 발행
```js
const increaseCounter = () => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
          // WebSocketConfig에서 설정한 접두사 /app을 사용하여, 이 메시지를 (@MessageMapping("/counter/increase"))로 전달하도록 요청
            destination: '/app/counter/increase',
            // 단순히 트리거 역할만 하므로, 메시지 본문은 비어 있습니다. 서버는 이 메시지를 받고 카운트만 증가시킨 후, /topic/counter로 브로드캐스트하여 모든 클라이언트의 화면을 업데이트하게 됩니다.
            body: '' 
        });
        console.log('카운트 증가 메시지 발행');
    }
};
```

# 정리
## 1. 클라이언트 (React) → 서버 (Spring Controller) 통신:
- 발행(Publish): stompClient.publish({ destination: **'/app/...'** })
- 서버는 @MessageMapping("/...")으로 받음. (단일 요청)

## 2. 서버 (Spring) → 클라이언트 (React) 통신:
- 구독(Subscribe): client.subscribe('**/topic/...'**)
- 서버는 SimpMessagingTemplate 등을 사용하여 /topic/으로 시작하는 주소로 메시지를 브로드캐스트함. (N명에게 전파)



# 🎯 STOMP 메시징 경로 및 역할

### 1. 📣 발행/구독 채널 (Topic)

| 항목 | 주소 예시 | 역할 | 설명 |
| :---: | :---: | :--- | :--- |
| **접두사** | `/topic` | **메시지 브로커** | 서버가 클라이언트에게 **브로드캐스트**할 때 사용하는 주소의 접두사입니다. |
| **구독 대상** | `/topic/counter` | **주제 (Topic)** | `counter`라는 주제를 구독한 **모든** 클라이언트에게 메시지가 전송됩니다. |
| **구독 대상** | `/topic/count` | **주제 (Topic)** | `count`라는 주제를 구독한 **모든** 클라이언트에게 메시지가 전송됩니다. |

* `/topic/` 뒤에 붙는 **counter**와 **count**는 **서로 완전히 독립된 별개의 채널(주제)** 입니다.
* 클라이언트는 `client.subscribe('/topic/counter', ...)`처럼 구독한 채널의 메시지만 수신하게 됩니다.
* 서버는 구독자들에게 메시지를 보낼 때, `/topic/counter`와 `/topic/count` 중 **어떤 주제로 보낼지 선택**하여 전송할 수 있습니다.

### 2. ✍️ 서버 요청 (App Destination)

| 항목 | 주소 예시 | 역할 | 설명 |
| :---: | :---: | :--- | :--- |
| **접두사** | `/app` | **애플리케이션 목적지** | 클라이언트가 **서버의 특정 로직을 호출**하기 위해 사용하는 주소의 접두사입니다. |
| **매핑 대상** | `/app/counter/increase` | **Controller 호출** | Spring Boot의 `@MessageMapping("/counter/increase")` 메서드로 연결됩니다. |
| **매핑 대상** | `/app/count/increase` | **Controller 호출** | Spring Boot의 `@MessageMapping("/count/increase")` 메서드로 연결됩니다. |

* 이 `/app/...` 경로는 일반적인 Spring MVC의 `@RequestMapping`처럼 서버의 **특정 로직을 실행**하기 위한 엔드포인트 역할을 합니다.
* 클라이언트가 `/app/counter/increase`로 메시지를 보내면, 서버는 해당 `@MessageMapping`이 실행되고, 그 로직 안에서 카운트를 증가시킨 후, 원하는 **`/topic/...` 채널로 새로운 값을 브로드캐스트**하는 것입니다.

---

## 💡 구독별 독립 전송 시뮬레이션

> **시나리오:**
> 1. 클라이언트 A,B는 `/topic/counter` 구독.
> 2. 클라이언트 C,D는 `/topic/count` 구독.
> 3. 서버가 `/topic/counter`로 **1**을 전송.
> 4. 서버가 `/topic/count`로 **2**을 전송.

| 클라이언트 | 구독 채널 | 수신 메시지 | 화면 표시 값 |
| :---: | :---: | :---: | :---: |
| **A** | `/topic/counter` | **1** | 1 |
| **B** | `/topic/counter` | **1** | 1 |
| **C** | `/topic/count` | **2** | 2 |
| **D** | `/topic/count` | **2** | 2 |

각 클라이언트는 자신이 **명시적으로 구독한 채널의 메시지**만 수신하므로, 두 카운터는 **완전히 독립적**으로 실시간 업데이트를 처리할 수 있게 됩니다. 이 방식은 게시판 알림, 채팅방 분리, 사용자별 상태 분리 등 실시간 서비스 응용의 **가장 기본적인 원리**가 됩니다.