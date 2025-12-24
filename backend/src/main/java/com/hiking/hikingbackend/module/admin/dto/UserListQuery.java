package com.hiking.hikingbackend.module.admin.dto;

import lombok.Data;

/**
 * 用户列表查询DTO
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Data
public class UserListQuery {
    
    /**
     * 页码（从1开始）
     */
    private Integer pageNum = 1;
    
    /**
     * 每页大小
     */
    private Integer pageSize = 10;
    
    /**
     * 搜索关键词（用户名、昵称、手机号、邮箱）
     */
    private String keyword;
    
    /**
     * 角色筛选：0普通用户 1组织者 2管理员
     */
    private Integer role;
    
    /**
     * 状态筛选：0禁用 1正常
     */
    private Integer status;
}

