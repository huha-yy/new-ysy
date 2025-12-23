package com.hiking.hikingbackend.module.message.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 消息查询条件DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "消息查询条件")
public class MessageQuery {

    @Schema(description = "页码", example = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页大小", example = "10")
    private Integer pageSize = 10;

    @Schema(description = "消息类型：1系统通知 2报名通知 3活动通知 4预警通知", example = "1")
    private Integer messageType;

    @Schema(description = "是否已读：0未读 1已读", example = "0")
    private Integer isRead;
}

