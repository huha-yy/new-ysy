package com.hiking.hikingbackend.module.message.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 消息信息VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "消息信息")
public class MessageVO {

    @Schema(description = "消息ID", example = "1")
    private Long id;

    @Schema(description = "接收用户ID", example = "10")
    private Long userId;

    @Schema(description = "消息标题", example = "报名审核通过")
    private String title;

    @Schema(description = "消息内容", example = "您的报名申请已通过审核，请准时参加活动")
    private String content;

    @Schema(description = "消息类型：1系统通知 2报名通知 3活动通知 4预警通知", example = "2")
    private Integer messageType;

    @Schema(description = "消息类型文本", example = "报名通知")
    private String messageTypeName;

    @Schema(description = "关联业务ID（如活动ID）", example = "1")
    private Long relatedId;

    @Schema(description = "关联业务类型（如activity）", example = "activity")
    private String relatedType;

    @Schema(description = "是否已读：0未读 1已读", example = "0")
    private Integer isRead;

    @Schema(description = "阅读时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime readTime;

    @Schema(description = "创建时间", example = "2024-12-24 20:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-25 10:05:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

