package com.hiking.hikingbackend.module.checkin.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.module.checkin.dto.AlertHandleDTO;
import com.hiking.hikingbackend.module.checkin.dto.AlertQuery;
import com.hiking.hikingbackend.module.checkin.dto.TrackRecordDTO;
import com.hiking.hikingbackend.module.checkin.vo.AlertStatsVO;
import com.hiking.hikingbackend.module.checkin.vo.AlertVO;

/**
 * 预警服务接口
 * <p>
 * 提供预警检测、创建、查询、处理等功能
 *
 * @author hiking-system
 * @since 2025-01-14
 */
public interface AlertService {

    // ==================== 预警检测 ====================

    /**
     * 检测轨迹预警（在上报轨迹时调用）
     * <p>
     * 检测内容：
     * <ul>
     *   <li>偏离路线预警：用户位置距离路线点位超过阈值</li>
     *   <li>严重偏离预警：用户位置距离路线点位超过严重阈值</li>
     *   <li>长时间静止预警：同一位置持续超过阈值时间</li>
     * </ul>
     *
     * @param userId    用户ID
     * @param activityId 活动ID
     * @param track     轨迹记录
     */
    void checkTrackAlerts(Long userId, Long activityId, TrackRecordDTO track);

    /**
     * 检测超时未签到预警（定时任务调用）
     * <p>
     * 检测所有进行中的活动，对于已超过预计签到时间但仍未签到用户，
     * 创建超时未签到预警（每个签到点只创建一次）
     */
    void checkTimeoutAlerts();

    /**
     * 检测失联预警（定时任务调用）
     * <p>
     * 检测所有进行中的活动参与者，对于超过阈值时间无轨迹上报的用户，
     * 创建失联预警（同一用户同一活动只创建一次）
     */
    void checkLostContactAlerts();

    // ==================== 预警查询与处理 ====================

    /**
     * 获取活动的预警列表
     *
     * @param activityId 活动ID
     * @param query      查询条件
     * @return 分页结果
     */
    IPage<AlertVO> getActivityAlerts(Long activityId, AlertQuery query);

    /**
     * 获取用户的预警列表（管理员查询所有用户预警）
     *
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<AlertVO> getAlertList(AlertQuery query);

    /**
     * 处理预警
     *
     * @param organizerId 处理人ID（活动组织者或管理员）
     * @param alertId     预警ID
     * @param dto         处理信息
     */
    void handleAlert(Long organizerId, Long alertId, AlertHandleDTO dto);

    /**
     * 获取预警统计
     *
     * @param activityId 活动ID
     * @return 预警统计
     */
    AlertStatsVO getAlertStats(Long activityId);

    /**
     * 获取活动未处理预警数量
     *
     * @param activityId 活动ID
     * @return 未处理预警数量
     */
    Long getPendingAlertCount(Long activityId);
}
