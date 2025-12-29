package com.hiking.hikingbackend.module.admin.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.admin.dto.ActivityAuditQuery;
import com.hiking.hikingbackend.module.admin.dto.UserListQuery;
import com.hiking.hikingbackend.module.admin.dto.UserStatusUpdateDTO;
import com.hiking.hikingbackend.module.admin.service.AdminService;
import com.hiking.hikingbackend.module.admin.vo.ActivityAuditVO;
import com.hiking.hikingbackend.module.admin.vo.DashboardVO;
import com.hiking.hikingbackend.module.admin.vo.UserListVO;
import com.hiking.hikingbackend.module.admin.vo.UserManageVO;
import com.hiking.hikingbackend.module.admin.vo.UserStatsVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员控制器
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Tag(name = "管理员后台", description = "管理员后台相关接口")
@Validated
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * 获取Dashboard统计数据
     * 
     * @return Dashboard统计数据
     */
    @Operation(summary = "获取Dashboard统计数据", description = "获取后台首页的统计概览数据", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/dashboard")
    public Result<DashboardVO> getDashboard() {
        DashboardVO dashboardVO = adminService.getDashboard();
        return Result.success(dashboardVO);
    }

    /**
     * 获取用户列表（分页）
     * 
     * @param query 查询参数
     * @return 用户列表分页结果
     */
    @Operation(summary = "获取用户列表", description = "分页查询用户列表，支持按角色、状态、关键词筛选", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/users")
    public Result<IPage<UserListVO>> getUserList(UserListQuery query) {
        IPage<UserListVO> page = adminService.getUserList(query);
        return Result.success(page);
    }

    /**
     * 更新用户状态（启用/禁用）
     * 
     * @param userId 用户ID
     * @param dto 状态更新DTO
     * @return 操作结果
     */
    @Operation(summary = "更新用户状态", description = "启用或禁用用户账号", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/users/{userId}/status")
    public Result<Void> updateUserStatus(
            @Parameter(description = "用户ID", required = true, example = "1")
            @PathVariable("userId") Long userId,
            @Valid @RequestBody UserStatusUpdateDTO dto) {
        
        // 获取当前操作人ID
        Long operatorId = SecurityUtils.getCurrentUserId();
        if (operatorId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }
        
        adminService.updateUserStatus(userId, dto.getStatus(), operatorId);
        return Result.success("状态更新成功");
    }

    /**
     * 获取待审核活动列表（分页）
     * 
     * @param query 查询参数
     * @return 待审核活动列表分页结果
     */
    @Operation(summary = "获取待审核活动列表", description = "分页查询待审核的活动列表", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/audit")
    public Result<IPage<ActivityAuditVO>> getPendingActivities(ActivityAuditQuery query) {
        IPage<ActivityAuditVO> page = adminService.getPendingActivities(query);
        return Result.success(page);
    }

    /**
     * 获取所有活动列表（管理员视角）
     * 
     * @param query 查询参数
     * @return 活动列表分页结果
     */
    @Operation(summary = "获取所有活动列表", description = "管理员视角查看所有活动，支持按状态筛选", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities")
    public Result<IPage<ActivityAuditVO>> getAllActivities(ActivityAuditQuery query) {
        IPage<ActivityAuditVO> page = adminService.getAllActivities(query);
        return Result.success(page);
    }

    /**
     * 获取用户详情（管理员视角）
     * 
     * @param userId 用户ID
     * @return 用户详情
     */
    @Operation(summary = "获取用户详情", description = "查看用户的完整信息，包括统计数据", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/users/{userId}")
    public Result<UserManageVO> getUserDetail(
            @Parameter(description = "用户ID", required = true, example = "1")
            @PathVariable("userId") Long userId) {
        UserManageVO userManageVO = adminService.getUserDetail(userId);
        return Result.success(userManageVO);
    }

    /**
     * 获取用户统计信息
     * 
     * @return 用户统计信息
     */
    @Operation(summary = "获取用户统计信息", description = "获取用户总数的分类统计", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/users/stats")
    public Result<UserStatsVO> getUserStats() {
        UserStatsVO userStatsVO = adminService.getUserStats();
        return Result.success(userStatsVO);
    }
}

