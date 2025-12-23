package com.hiking.hikingbackend.module.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 评价实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("review")
public class Review implements Serializable {

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
     * 整体评分：1-5星
     */
    @TableField("overall_rating")
    private Integer overallRating;

    /**
     * 路线评分：1-5星
     */
    @TableField("route_rating")
    private Integer routeRating;

    /**
     * 组织评分：1-5星
     */
    @TableField("organization_rating")
    private Integer organizationRating;

    /**
     * 安全评分：1-5星
     */
    @TableField("safety_rating")
    private Integer safetyRating;

    /**
     * 评价内容
     */
    @TableField("content")
    private String content;

    /**
     * 评价图片URL（多个逗号分隔）
     */
    @TableField("images")
    private String images;

    /**
     * 是否匿名：0否 1是
     */
    @TableField("is_anonymous")
    private Integer isAnonymous;

    /**
     * 状态：0隐藏 1显示
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

