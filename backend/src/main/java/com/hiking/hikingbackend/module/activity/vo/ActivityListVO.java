package com.hiking.hikingbackend.module.activity.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 活动列表VO（精简版）
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "活动列表信息")
public class ActivityListVO {

    @Schema(description = "活动ID", example = "1")
    private Long id;

    @Schema(description = "活动标题", example = "周末香山徒步")
    private String title;

    @Schema(description = "封面图片URL", example = "https://example.com/image.jpg")
    private String coverImage;

    @Schema(description = "活动描述（摘要）", example = "这是一次轻松的香山徒步活动...")
    private String description;

    @Schema(description = "组织者用户ID", example = "1")
    private Long organizerId;

    @Schema(description = "组织者昵称", example = "张三")
    private String organizerNickname;

    @Schema(description = "组织者头像", example = "https://example.com/avatar.jpg")
    private String organizerAvatar;

    @Schema(description = "关联路线ID", example = "1")
    private Long routeId;

    @Schema(description = "路线名称", example = "香山环线")
    private String routeName;

    @Schema(description = "活动日期", example = "2024-12-28")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate activityDate;

    @Schema(description = "开始时间", example = "08:00:00")
    @JsonFormat(pattern = "HH:mm:ss", timezone = "GMT+8")
    private String startTime;

    @Schema(description = "难度：1休闲 2简单 3中等 4困难 5极限", example = "2")
    private Integer difficultyLevel;

    @Schema(description = "难度描述", example = "简单")
    private String difficultyText;

    @Schema(description = "费用（元）", example = "50.00")
    private BigDecimal fee;

    @Schema(description = "人数上限", example = "20")
    private Integer maxParticipants;

    @Schema(description = "当前报名人数", example = "15")
    private Integer currentParticipants;

    @Schema(description = "是否已报满", example = "false")
    private Boolean isFull;

    @Schema(description = "报名截止时间", example = "2024-12-26 23:59:59")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime registrationDeadline;

    @Schema(description = "状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回", example = "2")
    private Integer status;

    @Schema(description = "状态描述", example = "已发布")
    private String statusText;

    @Schema(description = "浏览次数", example = "128")
    private Integer viewCount;

    @Schema(description = "创建时间", example = "2024-12-20 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;
}

