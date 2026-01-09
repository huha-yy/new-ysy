package com.hiking.hikingbackend.module.checkin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 参与者签到状态VO（组织者查看用）
 * 包含用户基本信息和签到状态
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "参与者签到状态")
public class ParticipantCheckInVO {

    @Schema(description = "报名ID")
    private Long registrationId;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "用户昵称")
    private String nickname;

    @Schema(description = "用户头像")
    private String avatar;

    @Schema(description = "手机号（脱敏）")
    private String phone;

    @Schema(description = "签到点总数")
    private Integer totalCheckpoints;

    @Schema(description = "已签到数")
    private Integer checkedInCount;

    @Schema(description = "签到进度（百分比）")
    private Integer progress;

    @Schema(description = "各签到点签到状态列表（按顺序）")
    private List<CheckInStatusVO> checkpointStatusList;

    @Schema(description = "最后签到时间")
    private LocalDateTime lastCheckInTime;

    @Schema(description = "最后签到位置名称")
    private String lastCheckInLocation;

    @Schema(description = "是否预警：0否 1是（长时间未签到）")
    private Integer warning;

    @Schema(description = "预警原因")
    private String warningReason;
}
