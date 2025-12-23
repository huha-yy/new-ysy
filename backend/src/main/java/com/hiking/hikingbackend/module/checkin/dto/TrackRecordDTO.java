package com.hiking.hikingbackend.module.checkin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 轨迹记录DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "轨迹记录")
public class TrackRecordDTO {

    @Schema(description = "活动ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "活动ID不能为空")
    private Long activityId;

    @Schema(description = "纬度", example = "39.9042", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "纬度不能为空")
    private BigDecimal latitude;

    @Schema(description = "经度", example = "116.4074", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "经度不能为空")
    private BigDecimal longitude;

    @Schema(description = "海拔（米）", example = "100")
    private Integer elevation;

    @Schema(description = "定位精度（米）", example = "10")
    private Integer accuracy;

    @Schema(description = "移动速度（km/h）", example = "5.5")
    private BigDecimal speed;

    @Schema(description = "记录时间", example = "2024-12-23 10:30:00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "记录时间不能为空")
    private LocalDateTime recordTime;
}

