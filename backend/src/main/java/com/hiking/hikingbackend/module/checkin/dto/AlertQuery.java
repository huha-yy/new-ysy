package com.hiking.hikingbackend.module.checkin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 预警查询条件DTO
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Data
@Schema(description = "预警查询条件")
public class AlertQuery {

    @Schema(description = "页码", example = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页大小", example = "10")
    private Integer pageSize = 10;

    @Schema(description = "预警类型：1偏离路线 2严重偏离 3长时间静止 4超时未签到 5失联")
    private Integer alertType;

    @Schema(description = "预警级别：1警告 2严重")
    private Integer alertLevel;

    @Schema(description = "处理状态：0未处理 1处理中 2已处理 3已忽略")
    private Integer handleStatus;

    @Schema(description = "用户ID（查询指定用户的预警）")
    private Long userId;
}
