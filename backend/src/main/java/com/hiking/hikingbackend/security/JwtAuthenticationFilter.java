package com.hiking.hikingbackend.security;

import com.hiking.hikingbackend.common.utils.JwtUtils;
import com.hiking.hikingbackend.config.JwtProperties;
import com.hiking.hikingbackend.security.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT认证过滤器
 * <p>
 * 从请求头中提取JWT Token，验证有效性，并设置认证信息到SecurityContext
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final UserDetailsService userDetailsService;

    private final JwtUtils jwtUtils;

    private final JwtProperties jwtProperties;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. 从请求头中获取Token
            String authHeader = request.getHeader(jwtProperties.getHeader());
            String token = extractToken(authHeader);

            // 2. 如果Token不存在，直接放行
            if (!StringUtils.hasText(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 3. 验证Token有效性
            String username = jwtUtils.getUsernameFromToken(token);

            if (username != null && jwtUtils.validateToken(token)) {
                // 4. Token有效，加载用户详情
                log.debug("JWT Token验证成功，用户名：{}", username);
                CustomUserDetails userDetails = (CustomUserDetails) userDetailsService.loadUserByUsername(username);

                // 5. 创建认证对象
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // 6. 设置认证详情（包含IP等信息）
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. 将认证信息设置到SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.info("用户认证成功，用户名：{}", username);
            }

            // 8. 继续过滤器链
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("JWT Token验证失败：{}", e.getMessage());
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
        }
    }

    /**
     * 从Authorization请求头中提取Token
     * <p>
     * 格式：Bearer {token}
     *
     * @param authHeader Authorization请求头
     * @return Token字符串
     */
    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith(jwtProperties.getPrefix())) {
            return authHeader.substring(jwtProperties.getPrefix().length());
        }
        return null;
    }
}

