package com.hiking.hikingbackend.module.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 活动审核DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "活动审核请求")
public class ActivityAuditDTO {

    @Schema(description = "活动ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "活动ID不能为空")
    @Positive(message = "活动ID必须为正数")
    private Long activityId;

    @Schema(description = "审核结果：true通过，false驳回", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "审核结果不能为空")
    private Boolean approved;

    @Schema(description = "驳回原因（审核驳回时必填）", example = "活动描述不够详细")
    @Size(max = 500, message = "驳回原因最多500个字符")
    private String rejectReason;
}

