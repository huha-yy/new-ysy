package com.hiking.hikingbackend.module.registration.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 报名信息VO（含用户简要信息）
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "报名信息")
public class RegistrationVO {

    @Schema(description = "报名ID", example = "1")
    private Long id;

    @Schema(description = "用户ID", example = "10")
    private Long userId;

    @Schema(description = "用户昵称", example = "张三")
    private String userNickname;

    @Schema(description = "用户头像", example = "https://example.com/avatar.jpg")
    private String userAvatar;

    @Schema(description = "活动ID", example = "1")
    private Long activityId;

    @Schema(description = "活动标题", example = "周末香山徒步")
    private String activityTitle;

    @Schema(description = "活动封面图片", example = "https://example.com/activity.jpg")
    private String activityCoverImage;

    @Schema(description = "活动日期", example = "2024-12-28")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private String activityDate;

    @Schema(description = "状态：0待审核 1已通过 2已拒绝 3候补中 4已取消 5已缺席", example = "1")
    private Integer status;

    @Schema(description = "状态描述", example = "已通过")
    private String statusText;

    @Schema(description = "排队序号", example = "5")
    private Integer queueNumber;

    @Schema(description = "报名备注", example = "第一次参加，希望多多关照")
    private String remark;

    @Schema(description = "拒绝原因", example = "活动人数已满")
    private String rejectReason;

    @Schema(description = "审核人昵称", example = "活动组织者")
    private String auditorNickname;

    @Schema(description = "审核时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime auditTime;

    @Schema(description = "取消时间", example = "2024-12-26 15:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime cancelTime;

    @Schema(description = "取消原因", example = "临时有事")
    private String cancelReason;

    @Schema(description = "报名时间", example = "2024-12-24 20:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

