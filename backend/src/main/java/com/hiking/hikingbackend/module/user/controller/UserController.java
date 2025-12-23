package com.hiking.hikingbackend.module.user.controller;

import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.user.dto.UserProfileDTO;
import com.hiking.hikingbackend.module.user.service.UserService;
import com.hiking.hikingbackend.module.user.vo.UserProfileVO;
import com.hiking.hikingbackend.module.user.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "用户管理", description = "用户信息相关接口")
@Validated
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 获取当前用户信息
     *
     * @return 用户信息
     */
    @Operation(summary = "获取当前用户信息", description = "需要登录，从JWT获取用户ID")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/info")
    public Result<UserVO> getCurrentUser() {
        // 从 SecurityContext 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        UserVO userVO = userService.getCurrentUser(userId);
        return Result.success(userVO);
    }

    /**
     * 更新用户档案
     *
     * @param profileDTO 档案信息
     * @return 操作结果
     */
    @Operation(summary = "更新用户档案", description = "需要登录，更新用户个人信息")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/profile")
    public Result<Void> updateUserProfile(@Valid @RequestBody UserProfileDTO profileDTO) {
        // 从 SecurityContext 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        userService.updateUserProfile(userId, profileDTO);
        return Result.success("更新成功");
    }

    /**
     * 获取用户档案
     *
     * @return 用户档案信息
     */
    @Operation(summary = "获取用户档案", description = "需要登录，获取用户完整档案信息")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/profile/info")
    public Result<UserProfileVO> getUserProfile() {
        // 从 SecurityContext 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        UserProfileVO userProfileVO = userService.getUserProfile(userId);
        return Result.success(userProfileVO);
    }
}
