package com.hiking.hikingbackend.module.route.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 签到点信息VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "签到点信息")
public class CheckpointVO {

    @Schema(description = "签到点ID", example = "1")
    private Long id;

    @Schema(description = "路线ID", example = "1")
    private Long routeId;

    @Schema(description = "签到点名称", example = "香炉峰")
    private String name;

    @Schema(description = "签到点描述", example = "香山最高点，可俯瞰北京城")
    private String description;

    @Schema(description = "纬度", example = "39.9950")
    private BigDecimal latitude;

    @Schema(description = "经度", example = "116.1925")
    private BigDecimal longitude;

    @Schema(description = "有效签到半径（米）", example = "50")
    private Integer radius;

    @Schema(description = "顺序号", example = "2")
    private Integer sequence;

    @Schema(description = "类型：1集合点 2途中点 3终点", example = "2")
    private Integer checkpointType;

    @Schema(description = "类型文本", example = "途中点")
    private String checkpointTypeText;

    @Schema(description = "是否必签：0否 1是", example = "1")
    private Integer isRequired;

    @Schema(description = "是否必签文本", example = "是")
    private String isRequiredText;

    @Schema(description = "预计到达时间（从出发算起，分钟）", example = "120")
    private Integer expectedArriveMinutes;

    @Schema(description = "创建时间", example = "2024-12-24 20:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

