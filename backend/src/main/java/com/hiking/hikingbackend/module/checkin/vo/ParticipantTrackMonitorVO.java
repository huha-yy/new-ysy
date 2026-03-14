package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 参与者轨迹监控VO
 *
 * @author hiking-system
 * @since 2026-03-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "参与者轨迹监控")
public class ParticipantTrackMonitorVO {

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "用户昵称")
    private String nickname;

    @Schema(description = "用户头像")
    private String avatar;

    @Schema(description = "手机号（脱敏）")
    private String phone;

    @Schema(description = "最新纬度")
    private BigDecimal latestLatitude;

    @Schema(description = "最新经度")
    private BigDecimal latestLongitude;

    @Schema(description = "最新上报时间")
    private LocalDateTime latestRecordTime;

    @Schema(description = "在线状态：0离线 1在线")
    private Integer onlineStatus;

    @Schema(description = "在线状态文本")
    private String onlineStatusText;

    @Schema(description = "是否预警：0否 1是")
    private Integer warning;

    @Schema(description = "预警原因")
    private String warningReason;

    @Schema(description = "最近轨迹点")
    private List<TrackPointVO> recentTracks;
}
