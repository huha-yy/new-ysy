package com.hiking.hikingbackend.module.checkin.controller;

import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.checkin.dto.CheckInDTO;
import com.hiking.hikingbackend.module.checkin.dto.TrackRecordDTO;
import com.hiking.hikingbackend.module.checkin.service.CheckInService;
import com.hiking.hikingbackend.module.checkin.vo.CheckInVO;
import com.hiking.hikingbackend.module.checkin.vo.CheckInProgressVO;
import com.hiking.hikingbackend.module.checkin.vo.CheckpointStatsVO;
import com.hiking.hikingbackend.module.checkin.vo.ParticipantCheckInVO;
import com.hiking.hikingbackend.module.route.entity.Checkpoint;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 签到控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "签到管理", description = "签到相关接口")
@Validated
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    /**
     * GPS签到（需登录）
     * 需要校验：用户已登录、已报名且审核通过、活动进行中、在签到范围内
     *
     * @param activityId 活动ID
     * @param checkInDTO 签到信息
     * @return 签到记录
     */
    @Operation(summary = "GPS签到", description = "用户在指定签到点进行GPS签到，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/checkin")
    public Result<CheckInVO> performCheckIn(
            @Parameter(description = "活动ID", required = true, example = "1")
            @RequestParam("activityId") Long activityId,
            @Valid @RequestBody CheckInDTO checkInDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        CheckInVO checkInVO = checkInService.performCheckIn(userId, activityId, checkInDTO);
        return Result.success("签到成功", checkInVO);
    }

    /**
     * 我的签到状态（需登录）
     * 需要校验：用户已登录
     *
     * @param activityId 活动ID
     * @return 签到进度
     */
    @Operation(summary = "我的签到状态", description = "查询当前用户在指定活动的签到进度，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/checkin-status")
    public Result<CheckInProgressVO> getMyCheckInStatus(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        CheckInProgressVO progressVO = checkInService.getCheckInStatus(userId, activityId);
        return Result.success(progressVO);
    }

    /**
     * 签到点列表（需登录）
     * 需要校验：用户已登录
     *
     * @param activityId 活动ID
     * @return 签到点列表
     */
    @Operation(summary = "签到点列表", description = "查询活动的所有签到点，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/checkpoints")
    public Result<List<Checkpoint>> getCheckpoints(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        // 获取当前用户ID（可扩展用于权限校验）
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        List<Checkpoint> checkpoints = checkInService.getCheckpointsByActivity(activityId);
        return Result.success(checkpoints);
    }

    /**
     * 轨迹上报（需登录）
     * 需要校验：用户已登录
     *
     * @param trackRecords 轨迹记录列表
     * @return 操作结果
     */
    @Operation(summary = "轨迹上报", description = "批量上报GPS轨迹记录，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/track/report")
    public Result<Void> reportTracks(@Valid @RequestBody List<TrackRecordDTO> trackRecords) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        checkInService.batchUploadTracks(userId, trackRecords);
        return Result.success("轨迹上报成功");
    }

    /**
     * 所有参与者签到状态（组织者）
     * 需要校验：当前用户是活动组织者
     *
     * @param activityId 活动ID
     * @return 参与者签到状态列表
     */
    @Operation(summary = "参与者签到状态", description = "查询活动所有参与者的签到状态，需要登录，仅限活动组织者")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/participants-status")
    public Result<List<CheckInProgressVO>> getParticipantsCheckInStatus(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        List<CheckInProgressVO> participantsStatus = checkInService.getParticipantsCheckInStatus(organizerId, activityId);
        return Result.success(participantsStatus);
    }

    /**
     * 参与者签到状态（含用户信息，用于签到监控）
     * 需校验：当前用户是活动组织者
     *
     * @param activityId 活动ID
     * @return 参与者签到状态列表（含用户信息）
     */
    @Operation(summary = "参与者签到状态（签到监控）", description = "查询活动所有参与者的签到状态（含用户信息），需要登录，仅限活动组织者")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/participants-checkin")
    public Result<List<ParticipantCheckInVO>> getParticipantsCheckInWithUser(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        List<ParticipantCheckInVO> participantsStatus = checkInService.getParticipantsCheckInWithUser(organizerId, activityId);
        return Result.success(participantsStatus);
    }

    /**
     * 签到点统计信息（用于签到监控）
     * 需校验：当前用户是活动组织者
     *
     * @param activityId 活动ID
     * @return 签到点统计列表
     */
    @Operation(summary = "签到点统计信息", description = "查询活动各签到点的签到统计，需要登录，仅限活动组织者")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/activities/{activityId}/checkpoint-stats")
    public Result<List<CheckpointStatsVO>> getCheckpointStats(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        // 获取当前用户ID
        Long organizerId = SecurityUtils.getCurrentUserId();
        if (organizerId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        List<CheckpointStatsVO> checkpointStats = checkInService.getCheckpointStats(organizerId, activityId);
        return Result.success(checkpointStats);
    }
}

