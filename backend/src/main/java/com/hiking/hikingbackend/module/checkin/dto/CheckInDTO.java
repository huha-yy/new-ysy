package com.hiking.hikingbackend.module.checkin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 签到DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "签到请求")
public class CheckInDTO {

    @Schema(description = "签到点ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "签到点ID不能为空")
    private Long checkpointId;

    @Schema(description = "当前纬度", example = "39.9042", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "纬度不能为空")
    private BigDecimal latitude;

    @Schema(description = "当前经度", example = "116.4074", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "经度不能为空")
    private BigDecimal longitude;

    @Schema(description = "备注", example = "按时到达")
    private String remark;
}

