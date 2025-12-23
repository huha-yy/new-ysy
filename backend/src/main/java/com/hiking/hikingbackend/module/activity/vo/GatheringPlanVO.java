package com.hiking.hikingbackend.module.activity.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 集合方案VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "集合方案信息")
public class GatheringPlanVO {

    @Schema(description = "方案ID")
    private Long id;

    @Schema(description = "活动ID")
    private Long activityId;

    @Schema(description = "集合时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime gatheringTime;

    @Schema(description = "集合地点详细地址")
    private String gatheringAddress;

    @Schema(description = "集合点纬度")
    private BigDecimal gatheringLatitude;

    @Schema(description = "集合点经度")
    private BigDecimal gatheringLongitude;

    @Schema(description = "交通指引")
    private String transportGuide;

    @Schema(description = "携带物品清单")
    private String itemsToBring;

    @Schema(description = "注意事项")
    private String notice;

    @Schema(description = "组织者联系电话")
    private String organizerPhone;

    @Schema(description = "是否已发布：0否 1是")
    private Integer isPublished;

    @Schema(description = "发布状态文本")
    private String isPublishedText;

    @Schema(description = "发布时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime publishTime;

    @Schema(description = "创建时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

