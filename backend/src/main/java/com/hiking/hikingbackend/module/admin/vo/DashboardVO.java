package com.hiking.hikingbackend.module.admin.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Dashboard统计数据VO
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dashboard统计数据")
public class DashboardVO {
    
    /**
     * 用户总数
     */
    @Schema(description = "用户总数", example = "1256")
    private Long userCount;
    
    /**
     * 活动总数
     */
    @Schema(description = "活动总数", example = "89")
    private Long activityCount;
    
    /**
     * 报名总数
     */
    @Schema(description = "报名总数", example = "3420")
    private Long registrationCount;
    
    /**
     * 待审核活动数
     */
    @Schema(description = "待审核活动数", example = "5")
    private Long pendingAuditCount;
    
    /**
     * 今日新增用户
     */
    @Schema(description = "今日新增用户", example = "12")
    private Long todayNewUsers;
    
    /**
     * 今日新增活动
     */
    @Schema(description = "今日新增活动", example = "3")
    private Long todayNewActivities;
    
    /**
     * 周活跃用户数
     */
    @Schema(description = "周活跃用户数", example = "458")
    private Long weeklyActiveUsers;
    
    /**
     * 本月报名数
     */
    @Schema(description = "本月报名数", example = "856")
    private Long monthlyRegistrations;
    
    /**
     * 待审核活动列表（Dashboard用）
     */
    @Schema(description = "待审核活动列表")
    private List<ActivitySimpleVO> pendingActivities;
    
    /**
     * 最近活动列表（Dashboard用）
     */
    @Schema(description = "最近活动列表")
    private List<ActivitySimpleVO> recentActivities;
    
    /**
     * 简单活动信息（用于Dashboard列表展示）
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivitySimpleVO {
        /**
         * 活动ID
         */
        private Long id;
        
        /**
         * 活动标题
         */
        private String title;
        
        /**
         * 组织者名称
         */
        private String organizerName;
        
        /**
         * 活动状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回
         */
        private Integer status;
        
        /**
         * 人数上限
         */
        private Integer maxParticipants;
        
        /**
         * 当前报名人数
         */
        private Integer currentParticipants;
        
        /**
         * 创建时间
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
        private LocalDateTime createTime;
        
        /**
         * 活动开始时间（组合了activity_date + start_time）
         */
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
        private LocalDateTime startTime;
    }
}

