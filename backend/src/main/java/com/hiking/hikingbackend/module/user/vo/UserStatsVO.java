package com.hiking.hikingbackend.module.user.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 用户统计数据VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsVO {

    /** 参加活动数（报名已通过） */
    private Integer joinedActivities;

    /** 已完成活动数（活动状态=已结束） */
    private Integer completedActivities;

    /** 发布活动数（作为组织者） */
    private Integer publishedActivities;

    /** 累计里程（公里，来自路线总距离） */
    private BigDecimal totalDistance;

    /** 累计爬升（米） */
    private Integer totalElevation;

    /** 累计时长（小时） */
    private BigDecimal totalDuration;

    /** 获得评价数 */
    private Integer reviews;
}
