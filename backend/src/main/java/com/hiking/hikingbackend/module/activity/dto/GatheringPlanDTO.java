package com.hiking.hikingbackend.module.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 集合方案DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "集合方案请求")
public class GatheringPlanDTO {

    @Schema(description = "集合时间", example = "2024-12-28 07:30:00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "集合时间不能为空")
    private LocalDateTime gatheringTime;

    @Schema(description = "集合地点详细地址", example = "香山公园东门广场", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "集合地点不能为空")
    @Size(max = 200, message = "集合地点最多200个字符")
    private String gatheringAddress;

    @Schema(description = "集合点纬度", example = "39.9900")
    @DecimalMin(value = "-90.0", message = "纬度范围-90到90")
    @DecimalMax(value = "90.0", message = "纬度范围-90到90")
    private BigDecimal gatheringLatitude;

    @Schema(description = "集合点经度", example = "116.1900")
    @DecimalMin(value = "-180.0", message = "经度范围-180到180")
    @DecimalMax(value = "180.0", message = "经度范围-180到180")
    private BigDecimal gatheringLongitude;

    @Schema(description = "交通指引", example = "地铁西郊线香山站下车，步行约10分钟")
    @Size(max = 1000, message = "交通指引最多1000个字符")
    private String transportGuide;

    @Schema(description = "携带物品清单", example = "身份证、水壶、防晒霜、登山杖")
    @Size(max = 1000, message = "携带物品清单最多1000个字符")
    private String itemsToBring;

    @Schema(description = "注意事项", example = "请准时到达，过时不候")
    @Size(max = 1000, message = "注意事项最多1000个字符")
    private String notice;

    @Schema(description = "组织者联系电话", example = "13800138000")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String organizerPhone;
}

