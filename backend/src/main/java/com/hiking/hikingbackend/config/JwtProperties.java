package com.hiking.hikingbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT配置属性类
 * <p>
 * 从application.yml中读取JWT相关配置
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /**
     * JWT密钥
     */
    private String secret;

    /**
     * JWT过期时间（毫秒）
     */
    private Long expiration;

    /**
     * Token头部标识
     */
    private String header;

    /**
     * Token前缀
     */
    private String prefix;
}

