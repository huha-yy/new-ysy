package com.hiking.hikingbackend.common.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT工具类
 * <p>
 * 功能：
 * <ul>
 *   <li>生成Token（包含用户ID、用户名、角色）</li>
 *   <li>解析Token获取用户信息</li>
 *   <li>验证Token是否有效</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Component
public class JwtUtils {

    /**
     * JWT配置属性
     */
    private final com.hiking.hikingbackend.config.JwtProperties jwtProperties;

    /**
     * 用户ID声明
     */
    public static final String CLAIM_KEY_USER_ID = "userId";

    /**
     * 用户名声明
     */
    public static final String CLAIM_KEY_USERNAME = "username";

    /**
     * 角色声明
     */
    public static final String CLAIM_KEY_ROLE = "role";

    /**
     * 构造函数
     *
     * @param jwtProperties JWT配置属性
     */
    @Autowired
    public JwtUtils(com.hiking.hikingbackend.config.JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    /**
     * 生成JWT Token
     *
     * @param userId   用户ID
     * @param username 用户名
     * @param role     角色（0普通用户 1组织者 2管理员）
     * @return JWT Token
     */
    public String generateToken(Long userId, String username, Integer role) {
        // 准备载荷数据
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_KEY_USER_ID, userId);
        claims.put(CLAIM_KEY_USERNAME, username);
        claims.put(CLAIM_KEY_ROLE, role);

        // 计算过期时间
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtProperties.getExpiration());

        // 生成Token
        return Jwts.builder()
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * 从Token中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get(CLAIM_KEY_USER_ID, Long.class);
        } catch (Exception e) {
            log.error("从Token中获取用户ID失败：{}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token中获取用户名
     *
     * @param token JWT Token
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get(CLAIM_KEY_USERNAME, String.class);
        } catch (Exception e) {
            log.error("从Token中获取用户名失败：{}", e.getMessage());
            return null;
        }
    }

    /**
     * 从Token中获取角色
     *
     * @param token JWT Token
     * @return 角色
     */
    public Integer getRoleFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get(CLAIM_KEY_ROLE, Integer.class);
        } catch (Exception e) {
            log.error("从Token中获取角色失败：{}", e.getMessage());
            return null;
        }
    }

    /**
     * 验证Token是否有效
     *
     * @param token JWT Token
     * @return true有效，false无效
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            log.error("Token验证失败：{}", e.getMessage());
            return false;
        }
    }

    /**
     * 检查Token是否过期
     *
     * @param token JWT Token
     * @return true已过期，false未过期
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseToken(token);
            Date expiration = claims.getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            log.error("检查Token过期时间失败：{}", e.getMessage());
            return true;
        }
    }

    /**
     * 获取Token的过期时间
     *
     * @param token JWT Token
     * @return 过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration();
        } catch (Exception e) {
            log.error("获取Token过期时间失败：{}", e.getMessage());
            return null;
        }
    }

    /**
     * 解析Token获取Claims
     *
     * @param token JWT Token
     * @return Claims
     */
    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 获取签名密钥
     *
     * @return 签名密钥
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

