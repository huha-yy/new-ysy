package com.hiking.hikingbackend.module.admin.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "数据统计VO")
public class StatisticsVO {

    @Schema(description = "概览数据")
    private OverviewVO overview;

    @Schema(description = "增长率数据")
    private GrowthVO growth;

    @Schema(description = "热门活动排行")
    private List<TopActivityVO> topActivities;

    @Schema(description = "优秀组织者排行")
    private List<TopOrganizerVO> topOrganizers;

    @Schema(description = "活动难度分布")
    private List<DifficultyDistVO> activityByDifficulty;

    @Schema(description = "月度报名趋势")
    private List<MonthlyRegistrationVO> registrationByMonth;

    @Schema(description = "系统健康度")
    private HealthVO health;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewVO {
        private Integer totalUsers;
        private Integer totalActivities;
        private Integer totalRegistrations;
        private Integer totalCheckins;
        private Integer newUsersThisMonth;
        private Integer newActivitiesThisMonth;
        private Integer completedActivities;
        private Integer ongoingActivities;
        private Integer newRegistrationsThisMonth;
    }
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrowthVO {
        private BigDecimal userGrowth;
        private BigDecimal activityGrowth;
        private BigDecimal registrationGrowth;
        private BigDecimal checkinRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopActivityVO {
        private Long id;
        private String title;
        private Integer registrations;
        private BigDecimal rating;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopOrganizerVO {
        private Long id;
        private String name;
        private Integer activities;
        private Integer totalParticipants;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DifficultyDistVO {
        private String level;
        private Integer count;
        private BigDecimal percent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRegistrationVO {
        private String month;
        private Integer count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealthVO {
        private BigDecimal userActivityRate;
        private BigDecimal activityCompletionRate;
        private BigDecimal userSatisfaction;
        private BigDecimal checkinCompletionRate;
    }
}
