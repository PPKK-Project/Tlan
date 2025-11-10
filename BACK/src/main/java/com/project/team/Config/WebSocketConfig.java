package com.project.team.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 1. Simple Broker 설정: '/topic'으로 시작하는 목적지로 메시지를 라우팅
        // (클라이언트가 구독할 주소의 접두사)
        config.enableSimpleBroker("/topic");
        // 2. Application Destination Prefix 설정: '/app'으로 시작하는 메시지는
        // @MessageMapping이 붙은 Controller로 라우팅
        // (클라이언트가 서버로 메시지를 보낼 때 사용할 접두사)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트는 'ws://localhost:8080/ws-stomp'로 연결을 시도함
        registry.addEndpoint("/ws-stomp")
                // CORS 허용 (React 개발 서버 주소 명시 권장)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
