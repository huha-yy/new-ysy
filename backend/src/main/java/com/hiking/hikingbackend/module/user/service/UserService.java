package com.hiking.hikingbackend.module.user.service;

import com.hiking.hikingbackend.module.user.dto.UserLoginDTO;
import com.hiking.hikingbackend.module.user.dto.UserProfileDTO;
import com.hiking.hikingbackend.module.user.dto.UserRegisterDTO;
import com.hiking.hikingbackend.module.user.vo.LoginVO;
import com.hiking.hikingbackend.module.user.vo.UserProfileVO;
import com.hiking.hikingbackend.module.user.vo.UserVO;

/**
 * 用户服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface UserService {

    /**
     * 用户注册
     *
     * @param userRegisterDTO 注册信息
     * @return 登录响应（包含token）
     */
    LoginVO register(UserRegisterDTO userRegisterDTO);

    /**
     * 用户登录
     *
     * @param userLoginDTO 登录信息
     * @return 登录响应（包含token）
     */
    LoginVO login(UserLoginDTO userLoginDTO);

    /**
     * 获取当前用户信息
     *
     * @param userId 用户ID
     * @return 用户信息VO
     */
    UserVO getCurrentUser(Long userId);

    /**
     * 获取用户档案
     *
     * @param userId 用户ID
     * @return 用户档案VO
     */
    UserProfileVO getUserProfile(Long userId);

    /**
     * 更新用户档案
     *
     * @param userId      用户ID
     * @param profileDTO 档案信息
     */
    void updateUserProfile(Long userId, UserProfileDTO profileDTO);
}

