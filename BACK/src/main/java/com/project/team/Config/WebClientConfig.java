package com.project.team.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {


    /**
     * Place api
     */
    @Value("${api.url.place}")
    private String placeApiBaseUrl;
    @Bean
    public WebClient placeApiWebClient() {
        return WebClient.builder().baseUrl(placeApiBaseUrl).build();
    }


    /**
     * Safety Data Api
     */
    @Value("${api.url.safety}")
    private String safetyApiBaseUrl;
    @Bean
    public WebClient safetyApiWebClient() {
        return WebClient.builder().baseUrl(safetyApiBaseUrl).build();
    }

    /**
    * Currency api*/

    @Value("${api.url.currency}")
    private String currencyBaseUrl;
    @Bean
    public WebClient currencyWebClient() { return WebClient.builder().baseUrl(currencyBaseUrl).build(); }

    /**
     * embassy api
     */
    @Value("${api.url.embassy}")
    private String embassyBaseUrl;
    @Bean
    public WebClient embassyApiWebClient() {
        return WebClient.builder().baseUrl(embassyBaseUrl).build();
    }

}
