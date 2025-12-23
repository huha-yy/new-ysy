package com.hiking.hikingbackend.module.activity.service;

import com.hiking.hikingbackend.module.activity.dto.GatheringPlanDTO;
import com.hiking.hikingbackend.module.activity.vo.GatheringPlanVO;

/**
 * 集合方案服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface GatheringPlanService {

    /**
     * 创建集合方案（组织者）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @param planDTO 集合方案信息
     * @return 集合方案ID
     */
    Long createGatheringPlan(Long organizerId, Long activityId, GatheringPlanDTO planDTO);

    /**
     * 更新集合方案（组织者）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @param planDTO 集合方案信息
     */
    void updateGatheringPlan(Long organizerId, Long activityId, GatheringPlanDTO planDTO);

    /**
     * 发布集合方案（组织者，向参与者发送通知）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     */
    void publishGatheringPlan(Long organizerId, Long activityId);

    /**
     * 获取集合方案（参与者查看）
     *
     * @param activityId 活动ID
     * @return 集合方案
     */
    GatheringPlanVO getGatheringPlan(Long activityId);
}

