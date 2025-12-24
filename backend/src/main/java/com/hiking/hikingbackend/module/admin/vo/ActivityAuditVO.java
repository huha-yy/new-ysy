package com.hiking.hikingbackend.module.admin.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 活动审核VO
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "活动审核信息")
public class ActivityAuditVO {
    
    /**
     * 活动ID
     */
    @Schema(description = "活动ID", example = "1")
    private Long id;
    
    /**
     * 活动标题
     */
    @Schema(description = "活动标题", example = "长城野长城穿越之旅")
    private String title;
    
    /**
     * 封面图片URL
     */
    @Schema(description = "封面图片URL", example = "https://example.com/activity.jpg")
    private String coverImage;
    
    /**
     * 活动描述
     */
    @Schema(description = "活动描述", example = "这是一次极具挑战性的野长城穿越活动...")
    private String description;
    
    /**
     * 组织者ID
     */
    @Schema(description = "组织者ID", example = "10")
    private Long organizerId;
    
    /**
     * 组织者名称
     */
    @Schema(description = "组织者名称", example = "户外探险家")
    private String organizerName;
    
    /**
     * 活动日期
     */
    @Schema(description = "活动日期", example = "2025-01-05")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate activityDate;
    
    /**
     * 开始时间
     */
    @Schema(description = "开始时间", example = "07:00:00")
    @JsonFormat(pattern = "HH:mm:ss", timezone = "GMT+8")
    private LocalTime startTime;
    
    /**
     * 预计结束时间
     */
    @Schema(description = "预计结束时间", example = "19:00:00")
    @JsonFormat(pattern = "HH:mm:ss", timezone = "GMT+8")
    private LocalTime endTime;
    
    /**
     * 活动开始时间（组合日期和时间）
     */
    @Schema(description = "活动开始时间", example = "2025-01-05 07:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime startTimeCombined;
    
    /**
     * 人数上限
     */
    @Schema(description = "人数上限", example = "20")
    private Integer maxParticipants;
    
    /**
     * 当前报名人数
     */
    @Schema(description = "当前报名人数", example = "15")
    private Integer currentParticipants;
    
    /**
     * 难度等级：1休闲 2简单 3中等 4困难 5极限
     */
    @Schema(description = "难度等级：1休闲 2简单 3中等 4困难 5极限", example = "4")
    private Integer difficultyLevel;
    
    /**
     * 费用（元）
     */
    @Schema(description = "费用（元）", example = "199.00")
    private BigDecimal fee;
    
    /**
     * 装备要求
     */
    @Schema(description = "装备要求", example = "登山鞋、登山杖、头灯...")
    private String equipmentRequirement;
    
    /**
     * 集合地点（从gathering_plan获取）
     */
    @Schema(description = "集合地点", example = "北京市怀柔区慕田峪长城停车场")
    private String startLocation;
    
    /**
     * 活动状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回
     */
    @Schema(description = "活动状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回", example = "1")
    private Integer status;
    
    /**
     * 驳回原因（仅已驳回状态有值）
     */
    @Schema(description = "驳回原因", example = "安全措施不足")
    private String rejectReason;
    
    /**
     * 审核人ID
     */
    @Schema(description = "审核人ID", example = "1")
    private Long auditBy;
    
    /**
     * 审核时间
     */
    @Schema(description = "审核时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime auditTime;
    
    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;
}

