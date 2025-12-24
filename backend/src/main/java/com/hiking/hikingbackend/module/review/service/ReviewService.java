package com.hiking.hikingbackend.module.review.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.module.review.dto.ReviewCreateDTO;
import com.hiking.hikingbackend.module.review.vo.ReviewVO;
import com.hiking.hikingbackend.module.review.vo.ReviewStatsVO;

/**
 * 评价服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface ReviewService {

    /**
     * 提交评价（仅已完成活动的参与者）
     *
     * @param userId 用户ID
     * @param activityId 活动ID
     * @param createDTO 评价信息
     * @return 评价ID
     */
    Long submitReview(Long userId, Long activityId, ReviewCreateDTO createDTO);

    /**
     * 获取活动评价列表
     *
     * @param activityId 活动ID
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @return 分页结果
     */
    IPage<ReviewVO> getActivityReviews(Long activityId, Integer pageNum, Integer pageSize);

    /**
     * 获取活动评分统计
     *
     * @param activityId 活动ID
     * @return 评分统计
     */
    ReviewStatsVO getRatingStats(Long activityId);
}

