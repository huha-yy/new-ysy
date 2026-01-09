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
import java.time.LocalTime;

/**
 * 活动详情VO（完整版）
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "活动详情信息")
public class ActivityDetailVO {

    @Schema(description = "活动ID", example = "1")
    private Long id;

    @Schema(description = "活动标题", example = "周末香山徒步")
    private String title;

    @Schema(description = "封面图片URL", example = "https://example.com/image.jpg")
    private String coverImage;

    @Schema(description = "活动详细描述", example = "这是一次轻松的香山徒步活动...")
    private String description;

    // ========== 组织者信息 ==========
    @Schema(description = "组织者用户ID", example = "1")
    private Long organizerId;

    @Schema(description = "组织者昵称", example = "张三")
    private String organizerNickname;

    @Schema(description = "组织者头像", example = "https://example.com/avatar.jpg")
    private String organizerAvatar;

    @Schema(description = "组织者角色：0普通用户 1组织者 2管理员", example = "1")
    private Integer organizerRole;

    // ========== 路线信息 ==========
    @Schema(description = "关联路线ID", example = "1")
    private Long routeId;

    @Schema(description = "路线名称", example = "香山环线")
    private String routeName;

    @Schema(description = "路线描述", example = "香山环线是一条经典的徒步路线...")
    private String routeDescription;

    @Schema(description = "路线难度：1休闲 2简单 3中等 4困难 5极限", example = "2")
    private Integer routeDifficultyLevel;

    @Schema(description = "路线总里程（公里）", example = "5.2")
    private BigDecimal routeTotalDistance;

    @Schema(description = "路线累计爬升（米）", example = "320")
    private Integer routeElevationGain;

    @Schema(description = "路线累计下降（米）", example = "320")
    private Integer routeElevationLoss;

    @Schema(description = "路线最高海拔（米）", example = "575")
    private Integer routeMaxElevation;

    @Schema(description = "路线最低海拔（米）", example = "80")
    private Integer routeMinElevation;

    @Schema(description = "路线预计用时（小时）", example = "4.0")
    private BigDecimal routeEstimatedHours;

    @Schema(description = "路线起点名称", example = "香山公园东门")
    private String routeStartPointName;

    @Schema(description = "路线终点名称", example = "香山公园东门")
    private String routeEndPointName;

    @Schema(description = "路线所属地区", example = "北京")
    private String routeRegion;

    // ========== 活动时间 ==========
    @Schema(description = "活动日期", example = "2024-12-28")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private LocalDate activityDate;

    @Schema(description = "开始时间", example = "08:00:00")
    @JsonFormat(pattern = "HH:mm:ss", timezone = "GMT+8")
    private LocalTime startTime;

    @Schema(description = "预计结束时间", example = "16:00:00")
    @JsonFormat(pattern = "HH:mm:ss", timezone = "GMT+8")
    private LocalTime endTime;

    @Schema(description = "预计时长（小时）", example = "8.0")
    private BigDecimal durationHours;

    // ========== 人数信息 ==========
    @Schema(description = "人数上限", example = "20")
    private Integer maxParticipants;

    @Schema(description = "当前报名人数", example = "15")
    private Integer currentParticipants;

    @Schema(description = "剩余名额", example = "5")
    private Integer remainingParticipants;

    @Schema(description = "是否已报满", example = "false")
    private Boolean isFull;

    // ========== 用户相关 ==========
    @Schema(description = "当前用户是否已报名", example = "false")
    private Boolean isRegistered;

    // ========== 报名 ==========
    @Schema(description = "报名截止时间", example = "2024-12-26 23:59:59")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime registrationDeadline;

    // ========== 难度和费用 ==========
    @Schema(description = "难度：1休闲 2简单 3中等 4困难 5极限", example = "2")
    private Integer difficultyLevel;

    @Schema(description = "难度描述", example = "简单")
    private String difficultyText;

    @Schema(description = "费用（元）", example = "50.00")
    private BigDecimal fee;

    @Schema(description = "费用说明", example = "包含交通费、保险费")
    private String feeDescription;

    // ========== 参与要求 ==========
    @Schema(description = "装备要求", example = "登山鞋、背包、水壶")
    private String equipmentRequirement;

    @Schema(description = "体能要求", example = "能够完成5公里以上徒步")
    private String fitnessRequirement;

    @Schema(description = "最小年龄限制", example = "18")
    private Integer ageMin;

    @Schema(description = "最大年龄限制", example = "65")
    private Integer ageMax;

    @Schema(description = "经验要求：0不限 1初级以上 2中级以上 3高级以上", example = "1")
    private Integer experienceRequirement;

    @Schema(description = "经验要求描述", example = "初级以上")
    private String experienceRequirementText;

    // ========== 状态 ==========
    @Schema(description = "状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回", example = "2")
    private Integer status;

    @Schema(description = "状态描述", example = "已发布")
    private String statusText;

    @Schema(description = "驳回原因", example = "活动描述不够详细")
    private String rejectReason;

    @Schema(description = "审核人ID", example = "10")
    private Long auditBy;

    @Schema(description = "审核人昵称", example = "管理员")
    private String auditorNickname;

    @Schema(description = "审核时间", example = "2024-12-21 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime auditTime;

    @Schema(description = "浏览次数", example = "128")
    private Integer viewCount;

    // ========== 时间 ==========
    @Schema(description = "创建时间", example = "2024-12-20 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-21 15:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

