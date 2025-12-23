package com.hiking.hikingbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS跨域配置类
 * <p>
 * 配置内容：
 * <ul>
 *   <li>允许来源：http://localhost:5173（Vite开发服务器）</li>
 *   <li>允许方法：GET, POST, PUT, DELETE, OPTIONS</li>
 *   <li>允许所有请求头</li>
 *   <li>允许携带Cookie</li>
 *   <li>预检请求缓存：3600秒</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Configuration
public class CorsConfig {

    /**
     * 配置CORS过滤器
     *
     * @return CorsFilter
     */
    @Bean
    public CorsFilter corsFilter() {
        // 1. 创建CORS配置对象
        CorsConfiguration config = new CorsConfiguration();

        // 2. 允许的域名（开发环境）
        config.addAllowedOrigin("http://localhost:5173");

        // 3. 允许的请求头（允许所有）
        config.addAllowedHeader("*");

        // 4. 允许的请求方法
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        // 5. 允许发送Cookie
        config.setAllowCredentials(true);

        // 6. 预检请求缓存时间（秒）
        config.setMaxAge(3600L);

        // 7. 暴露的响应头（可选）
        // config.addExposedHeader("*");

        // 8. 创建URL映射源
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        // 9. 返回CORS过滤器
        return new CorsFilter(source);
    }
}

