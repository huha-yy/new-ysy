package com.hiking.hikingbackend.module.registration.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.registration.dto.RegistrationAuditDTO;
import com.hiking.hikingbackend.module.registration.dto.RegistrationCreateDTO;
import com.hiking.hikingbackend.module.registration.dto.RegistrationQuery;
import com.hiking.hikingbackend.module.registration.service.RegistrationService;
import com.hiking.hikingbackend.module.registration.vo.RegistrationVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 报名控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "报名管理", description = "报名相关接口")
@Validated
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    /**
     * 提交报名（需登录）
     * 需要校验：用户已登录
     *
     * @param createDTO 报名信息
     * @return 报名ID
     */
    @Operation(summary = "提交报名", description = "提交活动报名申请，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/registrations")
    public Result<Long> submitRegistration(@Valid @RequestBody RegistrationCreateDTO createDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        Long registrationId = registrationService.submitRegistration(userId, createDTO);
        return Result.success("报名成功", registrationId);
    }

    /**
     * 审核报名（需登录，组织者）
     * 需要校验：当前用户是活动组织者
     *
     * @param registrationId 报名ID
     * @param auditDTO 审核信息
     * @return 操作结果
     */
    @Operation(summary = "审核报名", description = "组织者审核报名申请，需要登录，仅限活动组织者")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/registrations/{id}/audit")
    public Result<Void> auditRegistration(
            @Parameter(description = "报名ID", required = true, example = "1")
            @PathVariable("id") Long registrationId,
            @Valid @RequestBody RegistrationAuditDTO auditDTO) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        // 将路径参数中的报名ID设置到DTO中
        auditDTO.setRegistrationId(registrationId);

        registrationService.auditRegistration(organizerId, auditDTO);
        return Result.success("审核成功");
    }

    /**
     * 取消报名（需登录，本人）
     * 需要校验：当前用户是报名者本人
     *
     * @param registrationId 报名ID
     * @return 操作结果
     */
    @Operation(summary = "取消报名", description = "用户取消自己的报名，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/registrations/{id}/cancel")
    public Result<Void> cancelRegistration(
            @Parameter(description = "报名ID", required = true, example = "1")
            @PathVariable("id") Long registrationId) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        registrationService.cancelRegistration(userId, registrationId);
        return Result.success("取消成功");
    }

    /**
     * 活动的报名列表（需登录，组织者/管理员）
     * 需要校验：当前用户是活动组织者或管理员
     *
     * @param activityId 活动ID
     * @param query 查询条件
     * @return 报名列表
     */
    @Operation(summary = "活动报名列表", description = "查询活动的所有报名记录，需要登录，仅限活动组织者或管理员")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/registrations")
    public Result<IPage<RegistrationVO>> getActivityRegistrations(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId,
            RegistrationQuery query) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        // 强制按活动ID查询
        query.setActivityId(activityId);
        
        IPage<RegistrationVO> page = registrationService.getRegistrationList(query);
        return Result.success(page);
    }

    /**
     * 我的报名列表（需登录）
     * 需要校验：用户已登录
     *
     * @param query 查询条件
     * @return 我的报名列表
     */
    @Operation(summary = "我的报名", description = "查询当前用户的所有报名记录，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user/registrations")
    public Result<IPage<RegistrationVO>> getMyRegistrations(RegistrationQuery query) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        IPage<RegistrationVO> page = registrationService.getMyRegistrations(userId, query);
        return Result.success(page);
    }
}
