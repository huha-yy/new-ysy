package com.hiking.hikingbackend.module.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 活动创建DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "活动创建请求")
public class ActivityCreateDTO {

    @Schema(description = "活动标题", example = "周末香山徒步", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "活动标题不能为空")
    @Size(max = 100, message = "活动标题最多100个字符")
    private String title;

    @Schema(description = "封面图片URL", example = "https://example.com/image.jpg")
    @Size(max = 500, message = "封面图片URL最多500个字符")
    private String coverImage;

    @Schema(description = "活动详细描述", example = "这是一次轻松的香山徒步活动...", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "活动描述不能为空")
    @Size(max = 5000, message = "活动描述最多5000个字符")
    private String description;

    @Schema(description = "关联路线ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "路线ID不能为空")
    private Long routeId;

    @Schema(description = "活动日期", example = "2024-12-28", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "活动日期不能为空")
    @Future(message = "活动日期必须是未来的日期")
    private LocalDate activityDate;

    @Schema(description = "开始时间", example = "08:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "开始时间不能为空")
    private LocalTime startTime;

    @Schema(description = "预计结束时间", example = "16:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "结束时间不能为空")
    private LocalTime endTime;

    @Schema(description = "预计时长（小时）", example = "8.0")
    @DecimalMin(value = "0.1", message = "预计时长必须大于0")
    private BigDecimal durationHours;

    @Schema(description = "人数上限", example = "20", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "人数上限不能为空")
    @Min(value = 1, message = "人数上限至少为1")
    @Max(value = 200, message = "人数上限最多200")
    private Integer maxParticipants;

    @Schema(description = "报名截止时间", example = "2024-12-26 23:59:59", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "报名截止时间不能为空")
    private LocalDateTime registrationDeadline;

    @Schema(description = "难度：1休闲 2简单 3中等 4困难 5极限", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "难度等级不能为空")
    @Min(value = 1, message = "难度等级必须在1-5之间")
    @Max(value = 5, message = "难度等级必须在1-5之间")
    private Integer difficultyLevel;

    @Schema(description = "费用（元）", example = "50.00")
    @DecimalMin(value = "0.00", message = "费用不能为负数")
    private BigDecimal fee;

    @Schema(description = "费用说明", example = "包含交通费、保险费")
    @Size(max = 500, message = "费用说明最多500个字符")
    private String feeDescription;

    @Schema(description = "装备要求", example = "登山鞋、背包、水壶")
    @Size(max = 1000, message = "装备要求最多1000个字符")
    private String equipmentRequirement;

    @Schema(description = "体能要求", example = "能够完成5公里以上徒步")
    @Size(max = 500, message = "体能要求最多500个字符")
    private String fitnessRequirement;

    @Schema(description = "最小年龄限制", example = "18")
    @Min(value = 0, message = "最小年龄不能为负数")
    private Integer ageMin;

    @Schema(description = "最大年龄限制", example = "65")
    @Min(value = 0, message = "最大年龄不能为负数")
    private Integer ageMax;

    @Schema(description = "经验要求：0不限 1初级以上 2中级以上 3高级以上", example = "1")
    @Min(value = 0, message = "经验要求必须在0-3之间")
    @Max(value = 3, message = "经验要求必须在0-3之间")
    private Integer experienceRequirement;
}

