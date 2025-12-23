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
 * 路线实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("route")
public class Route implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 路线名称
     */
    @TableField("name")
    private String name;

    /**
     * 路线描述
     */
    @TableField("description")
    private String description;

    /**
     * 创建者用户ID
     */
    @TableField("creator_id")
    private Long creatorId;

    /**
     * 难度：1休闲 2简单 3中等 4困难 5极限
     */
    @TableField("difficulty_level")
    private Integer difficultyLevel;

    /**
     * 总里程（公里）
     */
    @TableField("total_distance")
    private BigDecimal totalDistance;

    /**
     * 累计爬升（米）
     */
    @TableField("elevation_gain")
    private Integer elevationGain;

    /**
     * 累计下降（米）
     */
    @TableField("elevation_loss")
    private Integer elevationLoss;

    /**
     * 最高海拔（米）
     */
    @TableField("max_elevation")
    private Integer maxElevation;

    /**
     * 最低海拔（米）
     */
    @TableField("min_elevation")
    private Integer minElevation;

    /**
     * 预计用时（小时）
     */
    @TableField("estimated_hours")
    private BigDecimal estimatedHours;

    /**
     * 起点名称
     */
    @TableField("start_point_name")
    private String startPointName;

    /**
     * 起点纬度
     */
    @TableField("start_latitude")
    private BigDecimal startLatitude;

    /**
     * 起点经度
     */
    @TableField("start_longitude")
    private BigDecimal startLongitude;

    /**
     * 终点名称
     */
    @TableField("end_point_name")
    private String endPointName;

    /**
     * 终点纬度
     */
    @TableField("end_latitude")
    private BigDecimal endLatitude;

    /**
     * 终点经度
     */
    @TableField("end_longitude")
    private BigDecimal endLongitude;

    /**
     * 所属地区
     */
    @TableField("region")
    private String region;

    /**
     * 是否公开：0否 1是
     */
    @TableField("is_public")
    private Integer isPublic;

    /**
     * 被使用次数
     */
    @TableField("use_count")
    private Integer useCount;

    /**
     * 状态：0禁用 1正常
     */
    @TableField("status")
    private Integer status;

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

