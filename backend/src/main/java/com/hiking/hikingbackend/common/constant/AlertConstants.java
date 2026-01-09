package com.hiking.hikingbackend.common.constant;

/**
 * 预警常量类
 * <p>
 * 定义预警功能相关的常量，包括：
 * <ul>
 *   <li>预警类型枚举</li>
 *   <li>预警级别枚举</li>
 *   <li>处理状态枚举</li>
 *   <li>默认阈值配置</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2025-01-14
 */
public class AlertConstants {

    private AlertConstants() {
    }

    // ==================== 预警类型 ====================
    /**
     * 预警类型：偏离路线
     */
    public static final int ALERT_TYPE_ROUTE_DEVIATION = 1;

    /**
     * 预警类型：严重偏离
     */
    public static final int ALERT_TYPE_SEVERE_DEVIATION = 2;

    /**
     * 预警类型：长时间静止
     */
    public static final int ALERT_TYPE_LONG_STATIONARY = 3;

    /**
     * 预警类型：超时未签到
     */
    public static final int ALERT_TYPE_TIMEOUT_NO_CHECKIN = 4;

    /**
     * 预警类型：失联
     */
    public static final int ALERT_TYPE_LOST_CONTACT = 5;

    // ==================== 预警级别 ====================
    /**
     * 预警级别：警告
     */
    public static final int ALERT_LEVEL_WARNING = 1;

    /**
     * 预警级别：严重
     */
    public static final int ALERT_LEVEL_SEVERE = 2;

    // ==================== 处理状态 ====================
    /**
     * 处理状态：未处理
     */
    public static final int HANDLE_STATUS_PENDING = 0;

    /**
     * 处理状态：处理中
     */
    public static final int HANDLE_STATUS_PROCESSING = 1;

    /**
     * 处理状态：已处理
     */
    public static final int HANDLE_STATUS_RESOLVED = 2;

    /**
     * 处理状态：已忽略
     */
    public static final int HANDLE_STATUS_IGNORED = 3;

    // ==================== 消息类型 ====================
    /**
     * 消息类型：预警通知（对应message表的message_type字段）
     */
    public static final int MESSAGE_TYPE_ALERT = 4;

    // ==================== 默认阈值（可通过dict_data配置覆盖） ====================
    /**
     * 默认偏离路线阈值（米）
     */
    public static final double DEFAULT_DEVIATION_THRESHOLD = 200.0;

    /**
     * 默认严重偏离阈值（米）
     */
    public static final double DEFAULT_SEVERE_DEVIATION_THRESHOLD = 500.0;

    /**
     * 默认长时间静止阈值（分钟）
     */
    public static final int DEFAULT_STATIONARY_THRESHOLD_MINUTES = 30;

    /**
     * 默认签到超时阈值（分钟）
     */
    public static final int DEFAULT_CHECKIN_TIMEOUT_MINUTES = 20;

    /**
     * 默认失联时间阈值（分钟）
     */
    public static final int DEFAULT_LOST_CONTACT_THRESHOLD_MINUTES = 60;

    /**
     * 默认定时检测间隔（分钟）
     */
    public static final int DEFAULT_CHECK_INTERVAL_MINUTES = 5;

    /**
     * 静止判定距离阈值（米）- 在此范围内视为同一位置
     */
    public static final double STATIONARY_DISTANCE_THRESHOLD = 50.0;

    // ==================== 字典配置编码 ====================
    /**
     * 预警配置字典编码
     */
    public static final String DICT_CODE_ALERT_CONFIG = "alert_config";

    /**
     * 配置项：偏离路线阈值
     */
    public static final String CONFIG_KEY_DEVIATION_THRESHOLD = "deviation_threshold";

    /**
     * 配置项：严重偏离阈值
     */
    public static final String CONFIG_KEY_SEVERE_DEVIATION_THRESHOLD = "severe_deviation_threshold";

    /**
     * 配置项：静止时间阈值
     */
    public static final String CONFIG_KEY_STATIONARY_THRESHOLD = "stationary_threshold";

    /**
     * 配置项：签到超时阈值
     */
    public static final String CONFIG_KEY_CHECKIN_TIMEOUT = "checkin_timeout";

    /**
     * 配置项：失联时间阈值
     */
    public static final String CONFIG_KEY_LOST_CONTACT_THRESHOLD = "lost_contact_threshold";

    /**
     * 配置项：检测间隔
     */
    public static final String CONFIG_KEY_CHECK_INTERVAL = "check_interval";

    // ==================== 预警类型文本 ====================
    /**
     * 获取预警类型文本
     */
    public static String getAlertTypeText(Integer alertType) {
        if (alertType == null) {
            return "未知";
        }
        return switch (alertType) {
            case ALERT_TYPE_ROUTE_DEVIATION -> "偏离路线";
            case ALERT_TYPE_SEVERE_DEVIATION -> "严重偏离";
            case ALERT_TYPE_LONG_STATIONARY -> "长时间静止";
            case ALERT_TYPE_TIMEOUT_NO_CHECKIN -> "超时未签到";
            case ALERT_TYPE_LOST_CONTACT -> "失联";
            default -> "未知";
        };
    }

    /**
     * 获取预警级别文本
     */
    public static String getAlertLevelText(Integer alertLevel) {
        if (alertLevel == null) {
            return "未知";
        }
        return switch (alertLevel) {
            case ALERT_LEVEL_WARNING -> "警告";
            case ALERT_LEVEL_SEVERE -> "严重";
            default -> "未知";
        };
    }

    /**
     * 获取处理状态文本
     */
    public static String getHandleStatusText(Integer handleStatus) {
        if (handleStatus == null) {
            return "未知";
        }
        return switch (handleStatus) {
            case HANDLE_STATUS_PENDING -> "未处理";
            case HANDLE_STATUS_PROCESSING -> "处理中";
            case HANDLE_STATUS_RESOLVED -> "已处理";
            case HANDLE_STATUS_IGNORED -> "已忽略";
            default -> "未知";
        };
    }
}
