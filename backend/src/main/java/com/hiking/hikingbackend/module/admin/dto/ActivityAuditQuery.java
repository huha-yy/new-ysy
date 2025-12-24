package com.hiking.hikingbackend.module.admin.dto;

import lombok.Data;

/**
 * 活动审核查询DTO
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Data
public class ActivityAuditQuery {
    
    /**
     * 页码（从1开始）
     */
    private Integer pageNum = 1;
    
    /**
     * 每页大小
     */
    private Integer pageSize = 10;
    
    /**
     * 搜索关键词（活动标题）
     */
    private String keyword;
    
    /**
     * 活动状态筛选：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回
     */
    private Integer status;
    
    /**
     * 难度等级筛选：1休闲 2简单 3中等 4困难 5极限
     */
    private Integer difficultyLevel;
}

