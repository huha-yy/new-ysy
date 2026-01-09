package com.hiking.hikingbackend.module.checkin.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.checkin.dto.AlertHandleDTO;
import com.hiking.hikingbackend.module.checkin.dto.AlertQuery;
import com.hiking.hikingbackend.module.checkin.service.AlertService;
import com.hiking.hikingbackend.module.checkin.vo.AlertStatsVO;
import com.hiking.hikingbackend.module.checkin.vo.AlertVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 预警控制器
 * <p>
 * 提供预警查询、处理、统计等接口
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Tag(name = "预警管理", description = "安全预警相关接口")
@Validated
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    /**
     * 获取活动的预警列表（组织者/管理员）
     *
     * @param activityId 活动ID
     * @param query      查询条件
     * @return 预警列表
     */
    @Operation(summary = "活动预警列表", description = "查询指定活动的预警记录，需要登录，仅限活动组织者和管理员", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/alerts")
    public Result<IPage<AlertVO>> getActivityAlerts(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId,
            AlertQuery query) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        IPage<AlertVO> page = alertService.getActivityAlerts(activityId, query);
        return Result.success(page);
    }

    /**
     * 获取预警统计（组织者/管理员）
     *
     * @param activityId 活动ID
     * @return 预警统计
     */
    @Operation(summary = "预警统计", description = "查询指定活动的预警统计数据，需要登录", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/alerts/stats")
    public Result<AlertStatsVO> getAlertStats(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        AlertStatsVO stats = alertService.getAlertStats(activityId);
        return Result.success(stats);
    }

    /**
     * 获取未处理预警数量（组织者/管理员）
     *
     * @param activityId 活动ID
     * @return 未处理数量
     */
    @Operation(summary = "未处理预警数量", description = "查询指定活动的未处理预警数量，需要登录", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/alerts/pending-count")
    public Result<Long> getPendingAlertCount(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        Long count = alertService.getPendingAlertCount(activityId);
        return Result.success(count);
    }

    /**
     * 处理预警（组织者/管理员）
     *
     * @param alertId 预警ID
     * @param dto     处理信息
     * @return 操作结果
     */
    @Operation(summary = "处理预警", description = "处理指定的预警事件，需要登录，仅限活动组织者和管理员", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/alerts/{alertId}/handle")
    public Result<Void> handleAlert(
            @Parameter(description = "预警ID", required = true, example = "1")
            @PathVariable("alertId") Long alertId,
            @Valid @RequestBody AlertHandleDTO dto) {
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        alertService.handleAlert(organizerId, alertId, dto);
        return Result.success("预警处理成功");
    }

    /**
     * 获取所有预警列表（管理员）
     *
     * @param query 查询条件
     * @return 预警列表
     */
    @Operation(summary = "所有预警列表", description = "查询所有预警记录（管理员专用），需要管理员权限", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/admin/alerts")
    public Result<IPage<AlertVO>> getAlertList(AlertQuery query) {
        IPage<AlertVO> page = alertService.getAlertList(query);
        return Result.success(page);
    }
}
