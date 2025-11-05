package com.project.team.Security.Config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI tlanOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Tlan API")
                        .description("Tlan 애플리케이션을 위한 API 명세서입니다.")
                        .version("v1.0.0")
                );
    }
}