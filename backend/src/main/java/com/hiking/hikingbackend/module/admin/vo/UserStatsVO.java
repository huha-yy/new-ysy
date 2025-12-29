package com.hiking.hikingbackend.module.admin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户统计VO
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "用户统计信息")
public class UserStatsVO {
    
    /**
     * 用户总数
     */
    @Schema(description = "用户总数", example = "1256")
    private Long total;
    
    /**
     * 普通用户数
     */
    @Schema(description = "普通用户数", example = "1200")
    private Long users;
    
    /**
     * 组织者数
     */
    @Schema(description = "组织者数", example = "50")
    private Long organizers;
    
    /**
     * 管理员数
     */
    @Schema(description = "管理员数", example = "6")
    private Long admins;
    
    /**
     * 已禁用用户数
     */
    @Schema(description = "已禁用用户数", example = "12")
    private Long disabled;
}

