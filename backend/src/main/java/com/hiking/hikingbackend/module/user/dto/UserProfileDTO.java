package com.hiking.hikingbackend.module.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 档案更新请求DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {

    /**
     * 真实姓名
     */
    @Size(max = 32, message = "真实姓名长度不能超过32个字符")
    private String realName;

    /**
     * 性别：0未知 1男 2女
     */
    private Integer gender;

    /**
     * 出生日期
     */
    private LocalDate birthDate;

    /**
     * 徒步经验：0新手 1初级 2中级 3高级 4专业
     */
    private Integer experienceLevel;

    /**
     * 健康状况描述
     */
    @Size(max = 256, message = "健康状况描述长度不能超过256个字符")
    private String healthStatus;

    /**
     * 病史/过敏史
     */
    @Size(max = 512, message = "病史描述长度不能超过512个字符")
    private String medicalHistory;

    /**
     * 紧急联系人姓名
     */
    @Size(max = 32, message = "紧急联系人姓名长度不能超过32个字符")
    private String emergencyContact;

    /**
     * 紧急联系人电话
     */
    private String emergencyPhone;

    /**
     * 常用装备清单
     */
    @Size(max = 512, message = "装备清单长度不能超过512个字符")
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
    @Size(max = 128, message = "偏好地区长度不能超过128个字符")
    private String preferenceRegion;

    /**
     * 个人简介
     */
    @Size(max = 256, message = "个人简介长度不能超过256个字符")
    private String bio;
}

