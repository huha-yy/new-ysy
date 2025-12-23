package com.hiking.hikingbackend.module.route.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 签到点创建DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "签到点创建请求")
public class CheckpointCreateDTO {

    @Schema(description = "签到点名称", example = "香炉峰", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "签到点名称不能为空")
    @Size(max = 50, message = "签到点名称最多50个字符")
    private String name;

    @Schema(description = "签到点描述", example = "香山最高点，可俯瞰北京城")
    @Size(max = 500, message = "签到点描述最多500个字符")
    private String description;

    @Schema(description = "纬度", example = "39.9950", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "纬度不能为空")
    @DecimalMin(value = "-90.0", message = "纬度范围-90到90")
    @DecimalMax(value = "90.0", message = "纬度范围-90到90")
    private BigDecimal latitude;

    @Schema(description = "经度", example = "116.1925", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "经度不能为空")
    @DecimalMin(value = "-180.0", message = "经度范围-180到180")
    @DecimalMax(value = "180.0", message = "经度范围-180到180")
    private BigDecimal longitude;

    @Schema(description = "有效签到半径（米）", example = "50")
    @Min(value = 10, message = "签到半径至少为10米")
    @Max(value = 500, message = "签到半径最多为500米")
    private Integer radius;

    @Schema(description = "顺序号", example = "2")
    @Min(value = 1, message = "顺序号必须大于0")
    private Integer sequence;

    @Schema(description = "类型：1集合点 2途中点 3终点", example = "2")
    @Min(value = 1, message = "签到点类型必须在1-3之间")
    @Max(value = 3, message = "签到点类型必须在1-3之间")
    private Integer checkpointType;

    @Schema(description = "是否必签：0否 1是", example = "1")
    private Integer isRequired;

    @Schema(description = "预计到达时间（从出发算起，分钟）", example = "120")
    @Min(value = 0, message = "预计到达时间不能为负数")
    private Integer expectedArriveMinutes;
}

