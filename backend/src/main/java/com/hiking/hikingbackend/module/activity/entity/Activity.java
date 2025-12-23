package com.hiking.hikingbackend.module.activity.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 活动实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("activity")
public class Activity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 活动标题
     */
    @TableField("title")
    private String title;

    /**
     * 封面图片URL
     */
    @TableField("cover_image")
    private String coverImage;

    /**
     * 活动详细描述
     */
    @TableField("description")
    private String description;

    /**
     * 组织者用户ID
     */
    @TableField("organizer_id")
    private Long organizerId;

    /**
     * 关联路线ID
     */
    @TableField("route_id")
    private Long routeId;

    /**
     * 活动日期
     */
    @TableField(value = "activity_date")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate activityDate;

    /**
     * 开始时间
     */
    @TableField(value = "start_time")
    @JsonFormat(pattern = "HH:mm:ss", timezone = "GMT+8")
    private LocalTime startTime;

    /**
     * 预计结束时间
     */
    @TableField(value = "end_time")
    @JsonFormat(pattern = "HH:mm:ss", timezone = "GMT+8")
    private LocalTime endTime;

    /**
     * 预计时长（小时）
     */
    @TableField("duration_hours")
    private BigDecimal durationHours;

    /**
     * 人数上限
     */
    @TableField("max_participants")
    private Integer maxParticipants;

    /**
     * 当前报名人数
     */
    @TableField("current_participants")
    private Integer currentParticipants;

    /**
     * 报名截止时间
     */
    @TableField(value = "registration_deadline")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime registrationDeadline;

    /**
     * 难度：1休闲 2简单 3中等 4困难 5极限
     */
    @TableField("difficulty_level")
    private Integer difficultyLevel;

    /**
     * 费用（元）
     */
    @TableField("fee")
    private BigDecimal fee;

    /**
     * 费用说明
     */
    @TableField("fee_description")
    private String feeDescription;

    /**
     * 装备要求
     */
    @TableField("equipment_requirement")
    private String equipmentRequirement;

    /**
     * 体能要求
     */
    @TableField("fitness_requirement")
    private String fitnessRequirement;

    /**
     * 最小年龄限制
     */
    @TableField("age_min")
    private Integer ageMin;

    /**
     * 最大年龄限制
     */
    @TableField("age_max")
    private Integer ageMax;

    /**
     * 经验要求：0不限 1初级以上 2中级以上 3高级以上
     */
    @TableField("experience_requirement")
    private Integer experienceRequirement;

    /**
     * 状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回
     */
    @TableField("status")
    private Integer status;

    /**
     * 驳回原因
     */
    @TableField("reject_reason")
    private String rejectReason;

    /**
     * 审核人ID
     */
    @TableField("audit_by")
    private Long auditBy;

    /**
     * 审核时间
     */
    @TableField(value = "audit_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime auditTime;

    /**
     * 浏览次数
     */
    @TableField("view_count")
    private Integer viewCount;

    /**
     * 创建者ID（插入时自动填充）
     */
    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private Long createBy;

    /**
     * 更新者ID（更新时自动填充）
     */
    @TableField(value = "update_by", fill = FieldFill.UPDATE)
    private Long updateBy;

    /**
     * 创建时间（插入时自动填充）
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    /**
     * 更新时间（插入和更新时自动填充）
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

