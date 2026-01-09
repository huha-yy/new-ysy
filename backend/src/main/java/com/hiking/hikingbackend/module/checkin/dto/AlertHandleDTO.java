package com.hiking.hikingbackend.module.checkin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 预警处理DTO
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Data
@Schema(description = "预警处理请求")
public class AlertHandleDTO {

    @Schema(description = "处理状态：1处理中 2已处理 3已忽略", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "处理状态不能为空")
    private Integer handleStatus;

    @Schema(description = "处理备注")
    private String handleRemark;
}
