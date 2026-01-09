package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * 预警统计VO
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "预警统计")
public class AlertStatsVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(description = "总预警数")
    private Long totalAlerts;

    @Schema(description = "未处理数")
    private Long pendingCount;

    @Schema(description = "处理中数")
    private Long processingCount;

    @Schema(description = "已处理数")
    private Long resolvedCount;

    @Schema(description = "已忽略数")
    private Long ignoredCount;

    @Schema(description = "严重预警数")
    private Long severeCount;

    @Schema(description = "各类型预警统计")
    private List<TypeStat> typeStats;

    /**
     * 类型统计
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "预警类型统计")
    public static class TypeStat implements Serializable {

        @Schema(description = "预警类型")
        private Integer alertType;

        @Schema(description = "预警类型文本")
        private String alertTypeText;

        @Schema(description = "数量")
        private Long count;
    }
}
