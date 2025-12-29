package com.hiking.hikingbackend.module.route.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 路线创建DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "路线创建请求")
public class RouteCreateDTO {

    @Schema(description = "路线名称", example = "香山南线徒步路线", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "路线名称不能为空")
    @Size(max = 100, message = "路线名称最多100个字符")
    private String name;

    @Schema(description = "路线描述", example = "这是一条风景优美的徒步路线，适合初级爱好者")
    @Size(max = 2000, message = "路线描述最多2000个字符")
    private String description;

    @Schema(description = "难度：1休闲 2简单 3中等 4困难 5极限", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "难度等级不能为空")
    @Min(value = 1, message = "难度等级必须在1-5之间")
    @Max(value = 5, message = "难度等级必须在1-5之间")
    private Integer difficultyLevel;

    @Schema(description = "总里程（公里）", example = "8.5")
    @DecimalMin(value = "0.1", message = "总里程必须大于0")
    private BigDecimal totalDistance;

    @Schema(description = "累计爬升（米）", example = "500")
    @Min(value = 0, message = "累计爬升不能为负数")
    private Integer elevationGain;

    @Schema(description = "累计下降（米）", example = "480")
    @Min(value = 0, message = "累计下降不能为负数")
    private Integer elevationLoss;

    @Schema(description = "最高海拔（米）", example = "557")
    @Min(value = 0, message = "最高海拔不能为负数")
    private Integer maxElevation;

    @Schema(description = "最低海拔（米）", example = "100")
    @Min(value = 0, message = "最低海拔不能为负数")
    private Integer minElevation;

    @Schema(description = "预计用时（小时）", example = "4.5")
    @DecimalMin(value = "0.1", message = "预计用时必须大于0")
    private BigDecimal estimatedHours;

    @Schema(description = "起点名称", example = "香山公园东门")
    @Size(max = 100, message = "起点名称最多100个字符")
    private String startPointName;

    @Schema(description = "起点纬度", example = "39.9925")
    @DecimalMin(value = "-90.0", message = "纬度范围-90到90")
    @DecimalMax(value = "90.0", message = "纬度范围-90到90")
    private BigDecimal startLatitude;

    @Schema(description = "起点经度", example = "116.1908")
    @DecimalMin(value = "-180.0", message = "经度范围-180到180")
    @DecimalMax(value = "180.0", message = "经度范围-180到180")
    private BigDecimal startLongitude;

    @Schema(description = "终点名称", example = "香山公园北门")
    @Size(max = 100, message = "终点名称最多100个字符")
    private String endPointName;

    @Schema(description = "终点纬度", example = "39.9980")
    @DecimalMin(value = "-90.0", message = "纬度范围-90到90")
    @DecimalMax(value = "90.0", message = "纬度范围-90到90")
    private BigDecimal endLatitude;

    @Schema(description = "终点经度", example = "116.1950")
    @DecimalMin(value = "-180.0", message = "经度范围-180到180")
    @DecimalMax(value = "180.0", message = "经度范围-180到180")
    private BigDecimal endLongitude;

    @Schema(description = "所属地区", example = "北京海淀区")
    @Size(max = 100, message = "所属地区最多100个字符")
    private String region;

    @Schema(description = "是否公开：0否 1是", example = "1")
    private Integer isPublic;

    @Schema(description = "路线点列表", example = "[{\"lng\": 116.39, \"lat\": 39.90}, {\"lng\": 116.40, \"lat\": 39.91}]")
    @NotEmpty(message = "路线点不能为空")
    @Size(min = 2, message = "至少需要2个路线点（起点和终点）")
    private List<RoutePointDTO> routePoints;

    @Schema(description = "签到点列表")
    private List<CheckpointDTO> checkpoints;

    @Schema(description = "途经点列表")
    private List<WaypointDTO> waypoints;

    /**
     * 路线点DTO
     */
    @Data
    @Schema(description = "路线点")
    public static class RoutePointDTO {
        @Schema(description = "经度", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "经度不能为空")
        private Double lng;

        @Schema(description = "纬度", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "纬度不能为空")
        private Double lat;
    }

    /**
     * 签到点DTO
     */
    @Data
    @Schema(description = "签到点")
    public static class CheckpointDTO {
        @Schema(description = "签到点名称", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "签到点名称不能为空")
        private String name;

        @Schema(description = "纬度", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "纬度不能为空")
        private Double latitude;

        @Schema(description = "经度", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "经度不能为空")
        private Double longitude;

        @Schema(description = "签到半径（米）", example = "100")
        private Integer radius;

        @Schema(description = "序号")
        private Integer sequence;

        @Schema(description = "类型：1集合点 2途中点 3终点")
        private Integer type;

        @Schema(description = "是否必签：0否 1是")
        private Boolean isRequired;
    }

    /**
     * 途经点DTO
     */
    @Data
    @Schema(description = "途经点")
    public static class WaypointDTO {
        @Schema(description = "途经点名称", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "途经点名称不能为空")
        private String name;

        @Schema(description = "纬度", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "纬度不能为空")
        private Double latitude;

        @Schema(description = "经度", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "经度不能为空")
        private Double longitude;

        @Schema(description = "点位类型")
        private Integer pointType;

        @Schema(description = "序号")
        private Integer sequence;
    }
}

