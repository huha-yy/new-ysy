package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 单个签到点的签到状态VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "签到点状态")
public class CheckInStatusVO {

    @Schema(description = "签到点ID")
    private Long checkpointId;

    @Schema(description = "签到点名称")
    private String checkpointName;

    @Schema(description = "签到点顺序号")
    private Integer sequence;

    @Schema(description = "签到点类型：1集合点 2途中点 3终点")
    private Integer checkpointType;

    @Schema(description = "签到点类型文本")
    private String checkpointTypeText;

    @Schema(description = "是否必签：0否 1是")
    private Integer isRequired;

    @Schema(description = "是否已签到：0否 1是")
    private Integer isCheckedIn;

    @Schema(description = "签到记录")
    private CheckInVO checkInRecord;
}

