package com.hiking.hikingbackend.module.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

/**
 * 活动查询条件DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "活动查询条件")
public class ActivityQuery {

    @Schema(description = "关键词搜索（标题、描述）", example = "周末徒步")
    private String keyword;

    @Schema(description = "难度等级：1休闲 2简单 3中等 4困难 5极限", example = "2")
    private Integer difficultyLevel;

    @Schema(description = "地区筛选", example = "北京")
    private String region;

    @Schema(description = "活动开始日期（起始）", example = "2024-12-25")
    private LocalDate startDate;

    @Schema(description = "活动开始日期（结束）", example = "2024-12-31")
    private LocalDate endDate;

    @Schema(description = "活动状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回", example = "2")
    private Integer status;

    @Schema(description = "页码", example = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页数量", example = "10")
    private Integer pageSize = 10;
}

