package com.hiking.hikingbackend.module.checkin.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预警事件实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("alert_event")
public class AlertEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 活动ID
     */
    @TableField("activity_id")
    private Long activityId;

    /**
     * 触发用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 预警类型：1偏离路线 2严重偏离 3长时间静止 4超时未签到 5失联
     */
    @TableField("alert_type")
    private Integer alertType;

    /**
     * 预警级别：1警告 2严重
     */
    @TableField("alert_level")
    private Integer alertLevel;

    /**
     * 触发时纬度
     */
    @TableField("latitude")
    private BigDecimal latitude;

    /**
     * 触发时经度
     */
    @TableField("longitude")
    private BigDecimal longitude;

    /**
     * 预警描述
     */
    @TableField("description")
    private String description;

    /**
     * 触发时间
     */
    @TableField(value = "trigger_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime triggerTime;

    /**
     * 处理状态：0未处理 1处理中 2已处理 3已忽略
     */
    @TableField("handle_status")
    private Integer handleStatus;

    /**
     * 处理人ID
     */
    @TableField("handle_by")
    private Long handleBy;

    /**
     * 处理时间
     */
    @TableField(value = "handle_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime handleTime;

    /**
     * 处理备注
     */
    @TableField("handle_remark")
    private String handleRemark;

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

