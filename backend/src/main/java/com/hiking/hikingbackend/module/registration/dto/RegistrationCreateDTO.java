package com.hiking.hikingbackend.module.registration.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 报名创建DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "报名创建请求")
public class RegistrationCreateDTO {

    @Schema(description = "活动ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "活动ID不能为空")
    @Positive(message = "活动ID必须为正数")
    private Long activityId;

    @Schema(description = "报名备注", example = "第一次参加，希望多多关照")
    @Size(max = 500, message = "报名备注最多500个字符")
    private String remark;
}

