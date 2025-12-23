package com.hiking.hikingbackend.module.user.controller;

import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.module.user.dto.UserLoginDTO;
import com.hiking.hikingbackend.module.user.dto.UserRegisterDTO;
import com.hiking.hikingbackend.module.user.service.UserService;
import com.hiking.hikingbackend.module.user.vo.LoginVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 认证控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "认证管理", description = "用户注册、登录相关接口")
@Validated
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * 用户注册
     *
     * @param userRegisterDTO 注册信息
     * @return 登录响应（包含token）
     */
    @Operation(summary = "用户注册", description = "用户注册，成功后返回token")
    @PostMapping("/register")
    @ApiResponse(description = "注册成功，返回token和用户信息")
    public Result<LoginVO> register(@Valid @RequestBody UserRegisterDTO userRegisterDTO) {
        LoginVO loginVO = userService.register(userRegisterDTO);
        return Result.success("注册成功", loginVO);
    }

    /**
     * 用户登录
     *
     * @param userLoginDTO 登录信息
     * @return 登录响应（包含token）
     */
    @Operation(summary = "用户登录", description = "用户名和密码登录，成功后返回token")
    @PostMapping("/login")
    @ApiResponse(description = "登录成功，返回token和用户信息")
    public Result<LoginVO> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        LoginVO loginVO = userService.login(userLoginDTO);
        return Result.success("登录成功", loginVO);
    }
}

