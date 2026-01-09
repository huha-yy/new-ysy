package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 签到进度VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "签到进度")
public class CheckInProgressVO {

    @Schema(description = "活动ID")
    private Long activityId;

    @Schema(description = "签到点总数")
    private Integer totalCheckpoints;

    @Schema(description = "已签到数")
    private Integer checkedInCount;

    @Schema(description = "签到进度（百分比）")
    private Integer progress;

    @Schema(description = "是否可以签到")
    private Boolean canCheckIn;

    @Schema(description = "状态消息")
    private String message;

    @Schema(description = "签到点列表")
    private List<CheckInStatusVO> checkpointStatusList;
}

