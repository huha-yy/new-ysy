package com.hiking.hikingbackend.config;

import com.hiking.hikingbackend.security.CustomUserDetailsService;
import com.hiking.hikingbackend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 配置类
 * <p>
 * 配置内容：
 * <ul>
 *   <li>禁用默认登录页面</li>
 *   <li>配置JWT认证过滤器</li>
 *   <li>放行Swagger文档路径</li>
 *   <li>配置权限规则</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final CustomUserDetailsService userDetailsService;

    /**
     * 密码编码器Bean
     *
     * @return PasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 认证提供者Bean
     *
     * @return AuthenticationProvider
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder());
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    /**
     * 认证管理器Bean
     * <p>
     * 使用 AuthenticationConfiguration 获取 AuthenticationManager，
     * 避免与 HttpSecurity 自动创建的 AuthenticationManager 冲突
     *
     * @param authenticationConfiguration 认证配置
     * @return AuthenticationManager
     * @throws Exception 异常
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * 配置安全过滤器链
     *
     * @param http HttpSecurity
     * @return SecurityFilterChain
     * @throws Exception 异常
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 禁用CSRF（JWT不需要CSRF保护）
                .csrf(AbstractHttpConfigurer::disable)

                // 禁用默认登录页面
                .formLogin(AbstractHttpConfigurer::disable)

                // 禁用登出
                .logout(AbstractHttpConfigurer::disable)

                // 配置会话管理（JWT不需要会话）
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 配置授权规则
                .authorizeHttpRequests(auth -> auth
                        // ========== 放行公开路径 ==========

                        // 放行Swagger文档相关路径
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/doc.html").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**").permitAll()

                        // 放行静态资源
                        .requestMatchers("/favicon.ico").permitAll()
                        .requestMatchers("/error").permitAll()

                        // 放行认证相关路径
                        .requestMatchers("/api/auth/**").permitAll()

                        // 其他所有请求都需要认证
                        .anyRequest().authenticated()
                );

        // 添加JWT认证过滤器
        http.addFilterBefore(jwtAuthenticationFilter,
                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 配置WebSecurity自定义器
     *
     * @return WebSecurityCustomizer
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/ignore1", "/ignore2");
    }
}
