package com.hiking.hikingbackend.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * 自定义用户详情实现类
 * <p>
 * 实现Spring Security的UserDetails接口，用于JWT认证
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码（加密后的）
     */
    private String password;

    /**
     * 角色：0普通用户 1组织者 2管理员
     */
    private Integer role;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 状态：0禁用 1正常
     */
    private Integer status;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 将角色转换为权限
        String authority = "ROLE_" + roleToString();
        return List.of(new SimpleGrantedAuthority(authority));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // 状态为1时未被锁定（正常），状态为0时被锁定（禁用）
        return status == 1;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // 状态为1时才能登录
        return status == 1;
    }

    /**
     * 将角色数字转换为字符串
     *
     * @param role 角色数字
     * @return 角色字符串
     */
    private String roleToString() {
        return switch (role) {
            case 0 -> "USER";
            case 1 -> "ORGANIZER";
            case 2 -> "ADMIN";
            default -> "USER";
        };
    }
}

