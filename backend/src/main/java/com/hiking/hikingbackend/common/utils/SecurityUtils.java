package com.hiking.hikingbackend.common.utils;

import com.hiking.hikingbackend.security.CustomUserDetails;

/**
 * Security 工具类
 * <p>
 * 提供从 SecurityContext 获取用户信息的工具方法
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public class SecurityUtils {

    /**
     * 从 SecurityContext 获取当前用户ID
     *
     * @return 用户ID
     */
    public static Long getCurrentUserId() {
        try {
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getPrincipal();

            if (principal instanceof CustomUserDetails) {
                return ((CustomUserDetails) principal).getUserId();
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从 SecurityContext 获取当前用户名
     *
     * @return 用户名
     */
    public static String getCurrentUsername() {
        try {
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getPrincipal();

            if (principal instanceof CustomUserDetails) {
                return ((CustomUserDetails) principal).getUsername();
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从 SecurityContext 获取当前用户角色
     *
     * @return 用户角色
     */
    public static Integer getCurrentUserRole() {
        try {
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getPrincipal();

            if (principal instanceof CustomUserDetails) {
                return ((CustomUserDetails) principal).getRole();
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 判断当前是否已登录
     *
     * @return true已登录，false未登录
     */
    public static boolean isAuthenticated() {
        try {
            return org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication() != null
                    && org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().isAuthenticated()
                    && !"anonymousUser".equals(
                        org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .getAuthentication().getPrincipal());
        } catch (Exception e) {
            return false;
        }
    }
}
