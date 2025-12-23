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
 * 签到记录实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("check_in_record")
public class CheckInRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 活动ID
     */
    @TableField("activity_id")
    private Long activityId;

    /**
     * 签到点ID
     */
    @TableField("checkpoint_id")
    private Long checkpointId;

    /**
     * 签到时间
     */
    @TableField(value = "check_in_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime checkInTime;

    /**
     * 签到时纬度
     */
    @TableField("latitude")
    private BigDecimal latitude;

    /**
     * 签到时经度
     */
    @TableField("longitude")
    private BigDecimal longitude;

    /**
     * 距签到点距离（米）
     */
    @TableField("distance_to_checkpoint")
    private Integer distanceToCheckpoint;

    /**
     * 状态：1正常 2迟到 3补签
     */
    @TableField("status")
    private Integer status;

    /**
     * 备注
     */
    @TableField("remark")
    private String remark;

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

