package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 签到记录VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "签到记录")
public class CheckInVO {

    @Schema(description = "签到记录ID")
    private Long id;

    @Schema(description = "签到点ID")
    private Long checkpointId;

    @Schema(description = "签到点名称")
    private String checkpointName;

    @Schema(description = "签到时间")
    private LocalDateTime checkInTime;

    @Schema(description = "签到时纬度")
    private BigDecimal latitude;

    @Schema(description = "签到时经度")
    private BigDecimal longitude;

    @Schema(description = "距签到点距离（米）")
    private Integer distanceToCheckpoint;

    @Schema(description = "状态：1正常 2迟到 3补签")
    private Integer status;

    @Schema(description = "状态文本")
    private String statusText;

    @Schema(description = "备注")
    private String remark;
}

