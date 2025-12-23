package com.hiking.hikingbackend.module.route.entity;

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
 * 签到点实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("checkpoint")
public class Checkpoint implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 路线ID
     */
    @TableField("route_id")
    private Long routeId;

    /**
     * 签到点名称
     */
    @TableField("name")
    private String name;

    /**
     * 签到点描述
     */
    @TableField("description")
    private String description;

    /**
     * 纬度
     */
    @TableField("latitude")
    private BigDecimal latitude;

    /**
     * 经度
     */
    @TableField("longitude")
    private BigDecimal longitude;

    /**
     * 有效签到半径（米）
     */
    @TableField("radius")
    private Integer radius;

    /**
     * 顺序号（1=集合点，最大=终点）
     */
    @TableField("sequence")
    private Integer sequence;

    /**
     * 类型：1集合点 2途中点 3终点
     */
    @TableField("checkpoint_type")
    private Integer checkpointType;

    /**
     * 是否必签：0否 1是
     */
    @TableField("is_required")
    private Integer isRequired;

    /**
     * 预计到达时间（从出发算起，分钟）
     */
    @TableField("expected_arrive_minutes")
    private Integer expectedArriveMinutes;

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

