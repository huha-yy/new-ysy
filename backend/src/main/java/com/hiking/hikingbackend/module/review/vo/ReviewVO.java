package com.hiking.hikingbackend.module.review.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 评价信息VO（含用户简要信息）
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "评价信息")
public class ReviewVO {

    @Schema(description = "评价ID", example = "1")
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

    @Schema(description = "整体评分：1-5星", example = "5")
    private Integer overallRating;

    @Schema(description = "路线评分：1-5星", example = "4")
    private Integer routeRating;

    @Schema(description = "组织评分：1-5星", example = "5")
    private Integer organizationRating;

    @Schema(description = "安全评分：1-5星", example = "5")
    private Integer safetyRating;

    @Schema(description = "平均评分", example = "4.75")
    private Double averageRating;

    @Schema(description = "评价内容", example = "活动组织得非常好，路线设计合理，安全措施到位！")
    private String content;

    @Schema(description = "评价图片URL数组", example = "[\"https://example.com/image1.jpg\", \"https://example.com/image2.jpg\"]")
    private String[] images;

    @Schema(description = "是否匿名：0否 1是", example = "0")
    private Integer isAnonymous;

    @Schema(description = "状态：0隐藏 1显示", example = "1")
    private Integer status;

    @Schema(description = "评价时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-25 10:05:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

