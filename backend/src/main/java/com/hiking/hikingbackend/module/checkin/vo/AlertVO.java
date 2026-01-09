package com.hiking.hikingbackend.module.checkin.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预警事件VO
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "预警事件详情")
public class AlertVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "预警ID")
    private Long id;

    @Schema(description = "活动ID")
    private Long activityId;

    @Schema(description = "活动标题")
    private String activityTitle;

    @Schema(description = "触发用户ID")
    private Long userId;

    @Schema(description = "触发用户昵称")
    private String userNickname;

    @Schema(description = "触发用户头像")
    private String userAvatar;

    @Schema(description = "预警类型：1偏离路线 2严重偏离 3长时间静止 4超时未签到 5失联")
    private Integer alertType;

    @Schema(description = "预警类型文本")
    private String alertTypeText;

    @Schema(description = "预警级别：1警告 2严重")
    private Integer alertLevel;

    @Schema(description = "预警级别文本")
    private String alertLevelText;

    @Schema(description = "触发时纬度")
    private BigDecimal latitude;

    @Schema(description = "触发时经度")
    private BigDecimal longitude;

    @Schema(description = "预警描述")
    private String description;

    @Schema(description = "触发时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime triggerTime;

    @Schema(description = "处理状态：0未处理 1处理中 2已处理 3已忽略")
    private Integer handleStatus;

    @Schema(description = "处理状态文本")
    private String handleStatusText;

    @Schema(description = "处理人ID")
    private Long handleBy;

    @Schema(description = "处理人昵称")
    private String handleByNickname;

    @Schema(description = "处理时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime handleTime;

    @Schema(description = "处理备注")
    private String handleRemark;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "是否严重（用于前端标识）")
    private Boolean isSevere;
}
