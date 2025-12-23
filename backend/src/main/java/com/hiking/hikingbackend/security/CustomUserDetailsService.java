package com.hiking.hikingbackend.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * 自定义用户详情服务实现类
 * <p>
 * 实现Spring Security的UserDetailsService接口
 * 根据用户名查询用户，并返回CustomUserDetails
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserMapper userMapper;

    /**
     * 根据用户名加载用户详情
     *
     * @param username 用户名
     * @return 用户详情
     * @throws UsernameNotFoundException 用户不存在时抛出
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("加载用户详情，用户名：{}", username);

        // 1. 根据用户名查询用户
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, username);
        User user = userMapper.selectOne(queryWrapper);

        // 2. 校验用户是否存在
        if (user == null) {
            log.warn("用户不存在，用户名：{}", username);
            throw new UsernameNotFoundException("用户名或密码错误");
        }

        // 3. 校验用户状态
        if (user.getStatus() == 0) {
            log.warn("用户已被禁用，用户名：{}", username);
            throw new UsernameNotFoundException("用户名或密码错误");
        }

        // 4. 构建CustomUserDetails
        return CustomUserDetails.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .role(user.getRole())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .status(user.getStatus())
                .build();
    }
}

