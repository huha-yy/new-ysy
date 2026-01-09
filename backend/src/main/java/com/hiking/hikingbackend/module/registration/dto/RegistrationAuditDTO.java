package com.hiking.hikingbackend.module.registration.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 报名审核DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "报名审核请求")
public class RegistrationAuditDTO {

    @Schema(description = "报名ID（从URL路径参数获取，请求体中可不传）", example = "1")
    private Long registrationId;

    @Schema(description = "审核结果：true通过，false拒绝", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "审核结果不能为空")
    private Boolean approved;

    @Schema(description = "拒绝原因（审核拒绝时必填）", example = "活动人数已满")
    @Size(max = 500, message = "拒绝原因最多500个字符")
    private String rejectReason;
}

