package com.hiking.hikingbackend.module.route.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 路线查询条件DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "路线查询条件")
public class RouteQuery {

    @Schema(description = "页码", example = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页大小", example = "10")
    private Integer pageSize = 10;

    @Schema(description = "路线名称（模糊查询）", example = "香山")
    private String name;

    @Schema(description = "所属地区（模糊查询）", example = "北京")
    private String region;

    @Schema(description = "难度：1休闲 2简单 3中等 4困难 5极限", example = "2")
    private Integer difficultyLevel;

    @Schema(description = "是否公开：0否 1是", example = "1")
    private Integer isPublic;

    @Schema(description = "状态：0禁用 1正常", example = "1")
    private Integer status;
}

