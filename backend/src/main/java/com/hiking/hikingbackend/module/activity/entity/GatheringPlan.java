package com.hiking.hikingbackend.module.activity.entity;

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
 * 集合方案实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("gathering_plan")
public class GatheringPlan implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 活动ID（唯一）
     */
    @TableField("activity_id")
    private Long activityId;

    /**
     * 集合时间
     */
    @TableField(value = "gathering_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime gatheringTime;

    /**
     * 集合地点详细地址
     */
    @TableField("gathering_address")
    private String gatheringAddress;

    /**
     * 集合点纬度
     */
    @TableField("gathering_latitude")
    private BigDecimal gatheringLatitude;

    /**
     * 集合点经度
     */
    @TableField("gathering_longitude")
    private BigDecimal gatheringLongitude;

    /**
     * 交通指引
     */
    @TableField("transport_guide")
    private String transportGuide;

    /**
     * 携带物品清单
     */
    @TableField("items_to_bring")
    private String itemsToBring;

    /**
     * 注意事项
     */
    @TableField("notice")
    private String notice;

    /**
     * 组织者联系电话
     */
    @TableField("organizer_phone")
    private String organizerPhone;

    /**
     * 是否已发布：0否 1是
     */
    @TableField("is_published")
    private Integer isPublished;

    /**
     * 发布时间
     */
    @TableField(value = "publish_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime publishTime;

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

