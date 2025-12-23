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
 * 路线点位实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("route_point")
public class RoutePoint implements Serializable {

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
     * 点位类型：1途经点 2风险点 3休息点 4补给点
     */
    @TableField("point_type")
    private Integer pointType;

    /**
     * 点位名称
     */
    @TableField("name")
    private String name;

    /**
     * 点位描述
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
     * 海拔（米）
     */
    @TableField("elevation")
    private Integer elevation;

    /**
     * 顺序号
     */
    @TableField("sequence")
    private Integer sequence;

    /**
     * 风险等级：1低 2中 3高（仅风险点）
     */
    @TableField("risk_level")
    private Integer riskLevel;

    /**
     * 风险提示（仅风险点）
     */
    @TableField("risk_tip")
    private String riskTip;

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

