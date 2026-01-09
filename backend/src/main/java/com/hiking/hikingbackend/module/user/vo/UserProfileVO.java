package com.hiking.hikingbackend.module.user.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户档案VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileVO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像URL
     */
    private String avatar;

    /**
     * 真实姓名
     */
    private String realName;

    /**
     * 性别：0未知 1男 2女
     */
    private Integer gender;

    /**
     * 出生日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate birthDate;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 徒步经验：0新手 1初级 2中级 3高级 4专业
     */
    private Integer experienceLevel;

    /**
     * 健康状况描述
     */
    private String healthStatus;

    /**
     * 病史/过敏史
     */
    private String medicalHistory;

    /**
     * 紧急联系人姓名
     */
    private String emergencyContact;

    /**
     * 紧急联系人电话
     */
    private String emergencyPhone;

    /**
     * 常用装备清单
     */
    private String equipmentList;

    /**
     * 偏好强度：1低 2中 3高
     */
    private Integer preferenceIntensity;

    /**
     * 偏好里程：1短(<10km) 2中(10-20km) 3长(>20km)
     */
    private Integer preferenceDistance;

    /**
     * 偏好地区（多个逗号分隔）
     */
    private String preferenceRegion;

    /**
     * 个人简介
     */
    private String bio;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

