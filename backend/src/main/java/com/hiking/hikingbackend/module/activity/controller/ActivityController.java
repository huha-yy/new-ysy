package com.hiking.hikingbackend.module.activity.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.activity.dto.ActivityAuditDTO;
import com.hiking.hikingbackend.module.activity.dto.ActivityCreateDTO;
import com.hiking.hikingbackend.module.activity.dto.ActivityQuery;
import com.hiking.hikingbackend.module.activity.dto.ActivityUpdateDTO;
import com.hiking.hikingbackend.module.activity.service.ActivityService;
import com.hiking.hikingbackend.module.activity.vo.ActivityDetailVO;
import com.hiking.hikingbackend.module.activity.vo.ActivityListVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 活动控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "活动管理", description = "活动相关接口")
@Validated
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    /**
     * 活动列表（公开接口）
     *
     * @param query 查询条件
     * @return 活动列表分页结果
     */
    @Operation(summary = "活动列表", description = "支持分页、关键词、难度、日期范围筛选，公开接口无需登录")
    @GetMapping("/activities")
    public Result<IPage<ActivityListVO>> getActivityList(ActivityQuery query) {
        IPage<ActivityListVO> page = activityService.getActivityList(query);
        return Result.success(page);
    }

    /**
     * 活动详情（公开接口）
     *
     * @param activityId 活动ID
     * @return 活动详情
     */
    @Operation(summary = "活动详情", description = "查看活动完整信息，公开接口无需登录")
    @GetMapping("/activities/{id}")
    public Result<ActivityDetailVO> getActivityDetail(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("id") Long activityId) {
        // 获取当前用户ID（可能为空）
        Long userId = SecurityUtils.getCurrentUserId();
        ActivityDetailVO detailVO = activityService.getActivityDetail(activityId, userId);
        return Result.success(detailVO);
    }

    /**
     * 发布活动（组织者接口）
     * 需要校验：当前用户必须是组织者或管理员
     *
     * @param createDTO 创建信息
     * @return 活动ID
     */
    @Operation(summary = "发布活动", description = "创建新活动，状态为草稿，需要登录，仅限组织者或管理员")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/activities")
    public Result<Long> createActivity(@Valid @RequestBody ActivityCreateDTO createDTO) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        Long activityId = activityService.createActivity(organizerId, createDTO);
        return Result.success("发布成功", activityId);
    }

    /**
     * 更新活动（组织者本人接口）
     * 需要校验：当前用户必须是活动组织者
     *
     * @param activityId 活动ID
     * @param updateDTO 更新信息
     * @return 操作结果
     */
    @Operation(summary = "更新活动", description = "更新活动信息，需要登录，仅限活动组织者本人，只有草稿和驳回状态可修改")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/activities/{id}")
    public Result<Void> updateActivity(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("id") Long activityId,
            @Valid @RequestBody ActivityUpdateDTO updateDTO) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        activityService.updateActivity(organizerId, activityId, updateDTO);
        return Result.success("更新成功");
    }

    /**
     * 提交审核（组织者本人接口）
     * 需要校验：当前用户必须是活动组织者
     *
     * @param activityId 活动ID
     * @return 操作结果
     */
    @Operation(summary = "提交审核", description = "将草稿状态的活动提交审核，需要登录，仅限活动组织者本人")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/activities/{id}/submit")
    public Result<Void> submitForAudit(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("id") Long activityId) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        activityService.submitForAudit(organizerId, activityId);
        return Result.success("提交成功");
    }

    /**
     * 审核活动（管理员接口）
     * 需要校验：当前用户必须是管理员
     *
     * @param activityId 活动ID
     * @param auditDTO 审核信息
     * @return 操作结果
     */
    @Operation(summary = "审核活动", description = "管理员审核活动，通过或驳回，需要登录，仅限管理员")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/activities/{id}/audit")
    public Result<Void> auditActivity(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("id") Long activityId,
            @Valid @RequestBody ActivityAuditDTO auditDTO) {
        // 获取当前用户ID
        Long auditorId = SecurityUtils.getCurrentUserId();
        if (auditorId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        activityService.auditActivity(auditorId, auditDTO);
        return Result.success("审核成功");
    }

    /**
     * 删除活动（组织者本人接口）
     * 需要校验：当前用户必须是活动组织者
     *
     * @param activityId 活动ID
     * @return 操作结果
     */
    @Operation(summary = "删除活动", description = "删除活动，需要登录，仅限活动组织者本人，只有草稿和驳回状态可删除")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/activities/{id}")
    public Result<Void> deleteActivity(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("id") Long activityId) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        activityService.deleteActivity(organizerId, activityId);
        return Result.success("删除成功");
    }

    /**
     * 取消活动（组织者本人接口）
     * 需要校验：当前用户必须是活动组织者
     *
     * @param activityId 活动ID
     * @return 操作结果
     */
    @Operation(summary = "取消活动", description = "取消已发布的活动，需要登录，仅限活动组织者本人")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/activities/{id}/cancel")
    public Result<Void> cancelActivity(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("id") Long activityId) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        activityService.cancelActivity(organizerId, activityId);
        return Result.success("取消成功");
    }

    /**
     * 我发布的活动（需登录）
     * 获取当前登录用户发布的所有活动
     *
     * @return 我发布的活动列表
     */
    @Operation(summary = "我发布的活动", description = "获取当前用户发布的所有活动，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user/activities")
    public Result<IPage<ActivityListVO>> getMyActivities(ActivityQuery query) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        // TODO: 查询当前用户发布的活动
        // 目前先返回空结果，后续实现
        throw new RuntimeException("功能开发中");
    }

    /**
     * 我参与的活动（需登录）
     * 获取当前登录用户报名的所有活动
     *
     * @return 我参与的活动列表
     */
    @Operation(summary = "我参与的活动", description = "获取当前用户报名的所有活动，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user/joined-activities")
    public Result<IPage<ActivityListVO>> getJoinedActivities(ActivityQuery query) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        // TODO: 查询当前用户参与的活动
        // 目前先返回空结果，后续实现
        throw new RuntimeException("功能开发中");
    }
}

