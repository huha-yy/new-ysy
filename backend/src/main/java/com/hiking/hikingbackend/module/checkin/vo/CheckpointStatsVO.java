package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 签到点统计VO
 * 用于签到监控页面显示各签到点的签到情况
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "签到点统计")
public class CheckpointStatsVO {

    @Schema(description = "签到点ID")
    private Long checkpointId;

    @Schema(description = "签到点名称")
    private String name;

    @Schema(description = "签到点顺序号")
    private Integer sequence;

    @Schema(description = "签到点类型：1集合点 2途中点 3终点")
    private Integer checkpointType;

    @Schema(description = "签到点类型文本")
    private String checkpointTypeText;

    @Schema(description = "是否必签：0否 1是")
    private Integer isRequired;

    @Schema(description = "经度")
    private BigDecimal longitude;

    @Schema(description = "纬度")
    private BigDecimal latitude;

    @Schema(description = "有效半径（米）")
    private Integer radius;

    @Schema(description = "已签到人数")
    private Integer checkedCount;

    @Schema(description = "应签到总人数")
    private Integer totalCount;

    @Schema(description = "签到完成率（百分比）")
    private Integer completionRate;
}
