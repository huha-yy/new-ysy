package com.hiking.hikingbackend.module.review.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 评价统计视图对象
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "评价统计")
public class ReviewStatsVO {

    /**
     * 整体评分平均
     */
    @Schema(description = "整体评分平均")
    private BigDecimal overallRating;

    /**
     * 路线评分平均
     */
    @Schema(description = "路线评分平均")
    private BigDecimal routeRating;

    /**
     * 组织评分平均
     */
    @Schema(description = "组织评分平均")
    private BigDecimal organizationRating;

    /**
     * 安全评分平均
     */
    @Schema(description = "安全评分平均")
    private BigDecimal safetyRating;

    /**
     * 评价总数
     */
    @Schema(description = "评价总数")
    private Long totalReviews;

    /**
     * 评分分布
     */
    @Schema(description = "评分分布")
    private List<RatingDistribution> ratingDistribution;

    /**
     * 评分分布项
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "评分分布项")
    public static class RatingDistribution {
        /**
         * 评分等级（1-5）
         */
        @Schema(description = "评分等级（1-5）")
        private Integer rating;

        /**
         * 该等级的评价数量
         */
        @Schema(description = "该等级的评价数量")
        private Long count;
    }
}

