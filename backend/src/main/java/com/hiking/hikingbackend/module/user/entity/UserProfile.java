package com.hiking.hikingbackend.module.user.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户档案实体类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("user_profile")
public class UserProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID（唯一）
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 真实姓名
     */
    @TableField("real_name")
    private String realName;

    /**
     * 性别：0未知 1男 2女
     */
    @TableField("gender")
    private Integer gender;

    /**
     * 出生日期
     */
    @TableField(value = "birth_date")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate birthDate;

    /**
     * 徒步经验：0新手 1初级 2中级 3高级 4专业
     */
    @TableField("experience_level")
    private Integer experienceLevel;

    /**
     * 健康状况描述
     */
    @TableField("health_status")
    private String healthStatus;

    /**
     * 病史/过敏史
     */
    @TableField("medical_history")
    private String medicalHistory;

    /**
     * 紧急联系人姓名
     */
    @TableField("emergency_contact")
    private String emergencyContact;

    /**
     * 紧急联系人电话
     */
    @TableField("emergency_phone")
    private String emergencyPhone;

    /**
     * 常用装备清单
     */
    @TableField("equipment_list")
    private String equipmentList;

    /**
     * 偏好强度：1低 2中 3高
     */
    @TableField("preference_intensity")
    private Integer preferenceIntensity;

    /**
     * 偏好里程：1短(<10km) 2中(10-20km) 3长(>20km)
     */
    @TableField("preference_distance")
    private Integer preferenceDistance;

    /**
     * 偏好地区（多个逗号分隔）
     */
    @TableField("preference_region")
    private String preferenceRegion;

    /**
     * 个人简介
     */
    @TableField("bio")
    private String bio;

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

