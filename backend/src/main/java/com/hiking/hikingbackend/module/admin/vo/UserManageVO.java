package com.hiking.hikingbackend.module.admin.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户管理详情VO
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "用户管理详情信息")
public class UserManageVO {
    
    /**
     * 用户ID
     */
    @Schema(description = "用户ID", example = "1")
    private Long id;
    
    /**
     * 用户名
     */
    @Schema(description = "用户名", example = "hiking_lover")
    private String username;
    
    /**
     * 昵称
     */
    @Schema(description = "昵称", example = "登山爱好者")
    private String nickname;
    
    /**
     * 头像URL
     */
    @Schema(description = "头像URL", example = "https://example.com/avatar.jpg")
    private String avatar;
    
    /**
     * 手机号
     */
    @Schema(description = "手机号", example = "13812345678")
    private String phone;
    
    /**
     * 邮箱
     */
    @Schema(description = "邮箱", example = "lover@hiking.com")
    private String email;
    
    /**
     * 角色：0普通用户 1组织者 2管理员
     */
    @Schema(description = "角色：0普通用户 1组织者 2管理员", example = "0")
    private Integer role;
    
    /**
     * 状态：0禁用 1正常
     */
    @Schema(description = "状态：0禁用 1正常", example = "1")
    private Integer status;
    
    /**
     * 发布活动数量（组织者）
     */
    @Schema(description = "发布活动数量（组织者）", example = "12")
    private Integer activityCount;
    
    /**
     * 报名次数（普通用户）
     */
    @Schema(description = "报名次数（普通用户）", example = "8")
    private Integer registrationCount;
    
    /**
     * 最后登录时间
     */
    @Schema(description = "最后登录时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime lastLoginTime;
    
    /**
     * 创建时间
     */
    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @Schema(description = "更新时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

