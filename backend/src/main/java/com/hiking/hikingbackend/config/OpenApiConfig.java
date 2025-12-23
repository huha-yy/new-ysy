package com.hiking.hikingbackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI配置类（Swagger文档配置）
 * <p>
 * 配置内容：
 * <ul>
 *   <li>API文档基本信息</li>
 *   <li>JWT认证配置</li>
 *   <li>Knife4j界面美化</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Configuration
public class OpenApiConfig {

    /**
     * JWT认证的安全方案名称
     */
    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    /**
     * 配置OpenAPI文档信息
     *
     * @return OpenAPI
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // API文档基本信息
                .info(new Info()
                        .title("户外徒步活动管理系统 API")
                        .description("基于SpringBoot的户外徒步活动管理系统接口文档")
                        .version("1.0")
                        .contact(new Contact()
                                .name("hiking-system")
                                .email("hiking@example.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                // JWT认证配置
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name("Authorization")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("请输入JWT Token，格式：Bearer {token}")
                                        .in(SecurityScheme.In.HEADER)));
    }
}

