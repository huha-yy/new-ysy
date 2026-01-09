package com.hiking.hikingbackend.module.review.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.review.dto.ReviewCreateDTO;
import com.hiking.hikingbackend.module.review.service.ReviewService;
import com.hiking.hikingbackend.module.review.vo.ReviewVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 评价控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "评价管理", description = "评价相关接口")
@Validated
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 提交评价（需登录）
     * 需要校验：用户已登录
     *
     * @param activityId 活动ID
     * @param createDTO 评价信息
     * @return 评价ID
     */
    @Operation(summary = "提交评价", description = "提交活动评价，需要登录。仅已完成活动的参与者可评价，每人每活动仅可评价一次")
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/activities/{activityId}/reviews")
    public Result<Long> submitReview(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId,
            @Valid @RequestBody ReviewCreateDTO createDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        Long reviewId = reviewService.submitReview(userId, activityId, createDTO);
        return Result.success("评价提交成功", reviewId);
    }

    /**
     * 获取活动评价列表
     *
     * @param activityId 活动ID
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @return 评价列表
     */
    @Operation(summary = "活动评价列表", description = "查询活动的所有评价记录")
    @GetMapping("/activities/{activityId}/reviews")
    public Result<IPage<ReviewVO>> getActivityReviews(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId,
            @Parameter(description = "页码", example = "1")
            @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小", example = "10")
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        IPage<ReviewVO> page = reviewService.getActivityReviews(activityId, pageNum, pageSize);
        return Result.success(page);
    }

    /**
     * 获取活动评分统计（含各项评分平均）
     *
     * @param activityId 活动ID
     * @return 评分统计
     */
    @Operation(summary = "活动评分统计", description = "查询活动的评分统计，包含整体评分和各项评分的平均值")
    @GetMapping("/activities/{activityId}/rating-stats")
    public Result<com.hiking.hikingbackend.module.review.vo.ReviewStatsVO> getActivityRatingStats(
            @Parameter(description = "活动ID", required = true, example = "1")
            @PathVariable("activityId") Long activityId) {
        com.hiking.hikingbackend.module.review.vo.ReviewStatsVO statsVO = reviewService.getRatingStats(activityId);
        return Result.success(statsVO);
    }

    /**
     * 获取我的评价列表（需登录）
     *
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @return 评价列表
     */
    @Operation(summary = "我的评价列表", description = "查询当前用户的评价记录，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user/reviews")
    public Result<IPage<ReviewVO>> getMyReviews(
            @Parameter(description = "页码", example = "1")
            @RequestParam(value = "pageNum", defaultValue = "1") Integer pageNum,
            @Parameter(description = "每页大小", example = "10")
            @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }
        IPage<ReviewVO> page = reviewService.getUserReviews(userId, pageNum, pageSize);
        return Result.success(page);
    }

    /**
     * 获取我的评价统计（需登录）
     *
     * @return 评价统计
     */
    @Operation(summary = "我的评价统计", description = "查询当前用户的评价统计，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user/reviews/stats")
    public Result<com.hiking.hikingbackend.module.review.vo.ReviewStatsVO> getMyReviewStats() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }
        com.hiking.hikingbackend.module.review.vo.ReviewStatsVO statsVO = reviewService.getUserReviewStats(userId);
        return Result.success(statsVO);
    }

    /**
     * 删除评价（需登录，仅评价作者）
     *
     * @param reviewId 评价ID
     * @return 操作结果
     */
    @Operation(summary = "删除评价", description = "删除自己的评价，需要登录，仅限评价作者")
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/user/reviews/{reviewId}")
    public Result<Void> deleteReview(
            @Parameter(description = "评价ID", required = true, example = "1")
            @PathVariable("reviewId") Long reviewId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }
        reviewService.deleteReview(userId, reviewId);
        return Result.success("删除成功");
    }

    /**
     * 更新评价（需登录，仅评价作者）
     *
     * @param reviewId 评价ID
     * @param createDTO 更新信息
     * @return 操作结果
     */
    @Operation(summary = "更新评价", description = "更新自己的评价，需要登录，仅限评价作者")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/user/reviews/{reviewId}")
    public Result<Void> updateReview(
            @Parameter(description = "评价ID", required = true, example = "1")
            @PathVariable("reviewId") Long reviewId,
            @Valid @RequestBody ReviewCreateDTO createDTO) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }
        reviewService.updateReview(userId, reviewId, createDTO);
        return Result.success("更新成功");
    }
}

