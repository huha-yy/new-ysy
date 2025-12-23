package com.hiking.hikingbackend.module.activity.controller;

import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.activity.dto.GatheringPlanDTO;
import com.hiking.hikingbackend.module.activity.service.GatheringPlanService;
import com.hiking.hikingbackend.module.activity.vo.GatheringPlanVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 集合方案控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "集合方案管理", description = "集合方案相关接口")
@Validated
@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class GatheringPlanController {

    private final GatheringPlanService gatheringPlanService;

    /**
     * 创建集合方案（组织者）
     * 需要校验：当前用户是活动组织者
     *
     * @param activityId 活动ID
     * @param planDTO 集合方案信息
     * @return 集合方案ID
     */
    @Operation(summary = "创建集合方案", description = "组织者为活动创建集合方案，需要登录，仅限活动组织者")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/{activityId}/gathering-plan")
    public Result<Long> createGatheringPlan(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId,
            @Valid @RequestBody GatheringPlanDTO planDTO) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        Long planId = gatheringPlanService.createGatheringPlan(organizerId, activityId, planDTO);
        return Result.success("集合方案创建成功", planId);
    }

    /**
     * 更新集合方案（组织者）
     * 需要校验：当前用户是活动组织者、方案未发布
     *
     * @param activityId 活动ID
     * @param planDTO 集合方案信息
     * @return 操作结果
     */
    @Operation(summary = "更新集合方案", description = "组织者更新集合方案，需要登录，仅限活动组织者且方案未发布")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/{activityId}/gathering-plan")
    public Result<Void> updateGatheringPlan(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId,
            @Valid @RequestBody GatheringPlanDTO planDTO) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        gatheringPlanService.updateGatheringPlan(organizerId, activityId, planDTO);
        return Result.success("集合方案更新成功");
    }

    /**
     * 发布集合方案（组织者）
     * 需要校验：当前用户是活动组织者
     *
     * @param activityId 活动ID
     * @return 操作结果
     */
    @Operation(summary = "发布集合方案", description = "组织者发布集合方案，向参与者发送通知，需要登录，仅限活动组织者")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/{activityId}/gathering-plan/publish")
    public Result<Void> publishGatheringPlan(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        gatheringPlanService.publishGatheringPlan(organizerId, activityId);
        return Result.success("集合方案发布成功");
    }

    /**
     * 获取集合方案（参与者查看）
     * 需要校验：用户已登录
     *
     * @param activityId 活动ID
     * @return 集合方案
     */
    @Operation(summary = "获取集合方案", description = "查询活动的集合方案，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/{activityId}/gathering-plan")
    public Result<GatheringPlanVO> getGatheringPlan(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        // 获取当前用户ID（可扩展用于权限校验）
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        GatheringPlanVO gatheringPlanVO = gatheringPlanService.getGatheringPlan(activityId);
        return Result.success(gatheringPlanVO);
    }
}

