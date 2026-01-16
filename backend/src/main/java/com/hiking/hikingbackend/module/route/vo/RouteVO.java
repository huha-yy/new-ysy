package com.hiking.hikingbackend.module.route.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 路线信息VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "路线信息")
public class RouteVO {

    @Schema(description = "路线ID", example = "1")
    private Long id;

    @Schema(description = "路线名称", example = "香山南线徒步路线")
    private String name;

    @Schema(description = "路线描述", example = "这是一条风景优美的徒步路线，适合初级爱好者")
    private String description;

    @Schema(description = "创建者用户ID", example = "5")
    private Long creatorId;

    @Schema(description = "创建者昵称", example = "张三")
    private String creatorNickname;

    @Schema(description = "创建者头像", example = "https://example.com/avatar.jpg")
    private String creatorAvatar;

    @Schema(description = "难度：1休闲 2简单 3中等 4困难 5极限", example = "2")
    private Integer difficultyLevel;

    @Schema(description = "难度文本", example = "简单")
    private String difficultyLevelText;

    @Schema(description = "总里程（公里）", example = "8.5")
    private BigDecimal totalDistance;

    @Schema(description = "累计爬升（米）", example = "500")
    private Integer elevationGain;

    @Schema(description = "累计下降（米）", example = "480")
    private Integer elevationLoss;

    @Schema(description = "最高海拔（米）", example = "557")
    private Integer maxElevation;

    @Schema(description = "最低海拔（米）", example = "100")
    private Integer minElevation;

    @Schema(description = "预计用时（小时）", example = "4.5")
    private BigDecimal estimatedHours;

    @Schema(description = "起点名称", example = "香山公园东门")
    private String startPointName;

    @Schema(description = "起点纬度", example = "39.9925")
    private BigDecimal startLatitude;

    @Schema(description = "起点经度", example = "116.1908")
    private BigDecimal startLongitude;

    @Schema(description = "终点名称", example = "香山公园北门")
    private String endPointName;

    @Schema(description = "终点纬度", example = "39.9980")
    private BigDecimal endLatitude;

    @Schema(description = "终点经度", example = "116.1950")
    private BigDecimal endLongitude;

    @Schema(description = "所属地区", example = "北京海淀区")
    private String region;

    @Schema(description = "是否公开：0否 1是", example = "1")
    private Integer isPublic;

    @Schema(description = "被使用次数", example = "15")
    private Integer useCount;

    @Schema(description = "状态：0禁用 1正常", example = "1")
    private Integer status;

    @Schema(description = "状态文本", example = "正常")
    private String statusText;

    @Schema(description = "签到点列表")
    private List<CheckpointVO> checkpoints;

    @Schema(description = "路线轨迹点列表")
    private List<RoutePointVO> routePoints;

    @Schema(description = "途经点列表")
    private List<RoutePointVO> waypoints;

    @Schema(description = "风险点列表")
    private List<RoutePointVO> riskPoints;

    @Schema(description = "休息点列表")
    private List<RoutePointVO> restPoints;

    @Schema(description = "补给点列表")
    private List<RoutePointVO> supplyPoints;

    @Schema(description = "起点信息")
    private PointVO startPoint;

    @Schema(description = "终点信息")
    private PointVO endPoint;

    @Schema(description = "当前用户是否可以编辑此路线", example = "true")
    private Boolean canEdit;

    @Schema(description = "创建时间", example = "2024-12-24 20:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;

    /**
     * 路线点VO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "路线点信息")
    public static class RoutePointVO {
        @Schema(description = "点位ID")
        private Long id;

        @Schema(description = "点位名称")
        private String name;

        @Schema(description = "点位描述")
        private String description;

        @Schema(description = "纬度")
        private BigDecimal latitude;

        @Schema(description = "经度")
        private BigDecimal longitude;

        @Schema(description = "海拔（米）")
        private Integer elevation;

        @Schema(description = "点位类型：1途经点 2风险点 3休息点 4补给点 5路线轨迹点")
        private Integer pointType;

        @Schema(description = "序号")
        private Integer sequence;

        @Schema(description = "风险等级：1低 2中 3高（仅风险点）")
        private Integer riskLevel;

        @Schema(description = "风险提示（仅风险点）")
        private String riskTip;
    }

    /**
     * 简单点位VO（用于起点终点）
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "点位信息")
    public static class PointVO {
        @Schema(description = "点位名称")
        private String name;

        @Schema(description = "纬度")
        private BigDecimal latitude;

        @Schema(description = "经度")
        private BigDecimal longitude;
    }
}

