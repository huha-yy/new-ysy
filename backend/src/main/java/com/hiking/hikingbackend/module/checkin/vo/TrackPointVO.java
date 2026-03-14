package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 轨迹点VO
 *
 * @author hiking-system
 * @since 2026-03-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "轨迹点")
public class TrackPointVO {

    @Schema(description = "纬度")
    private BigDecimal latitude;

    @Schema(description = "经度")
    private BigDecimal longitude;

    @Schema(description = "记录时间")
    private LocalDateTime recordTime;

    @Schema(description = "定位精度（米）")
    private Integer accuracy;
}
