package com.hiking.hikingbackend.module.registration.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 报名查询条件DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "报名查询条件")
public class RegistrationQuery {

    @Schema(description = "活动ID", example = "1")
    private Long activityId;

    @Schema(description = "用户ID", example = "10")
    private Long userId;

    @Schema(description = "状态：0待审核 1已通过 2已拒绝 3候补中 4已取消 5已缺席", example = "1")
    private Integer status;

    @Schema(description = "页码", example = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页数量", example = "10")
    private Integer pageSize = 10;
}

