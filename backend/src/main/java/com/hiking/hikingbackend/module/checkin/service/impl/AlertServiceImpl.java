package com.hiking.hikingbackend.module.checkin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.common.constant.AlertConstants;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.common.utils.GeoUtils;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import com.hiking.hikingbackend.module.activity.mapper.ActivityMapper;
import com.hiking.hikingbackend.module.checkin.dto.AlertHandleDTO;
import com.hiking.hikingbackend.module.checkin.dto.AlertQuery;
import com.hiking.hikingbackend.module.checkin.dto.TrackRecordDTO;
import com.hiking.hikingbackend.module.checkin.entity.AlertEvent;
import com.hiking.hikingbackend.module.checkin.entity.CheckInRecord;
import com.hiking.hikingbackend.module.checkin.entity.TrackRecord;
import com.hiking.hikingbackend.module.checkin.mapper.AlertEventMapper;
import com.hiking.hikingbackend.module.checkin.mapper.CheckInRecordMapper;
import com.hiking.hikingbackend.module.checkin.mapper.TrackRecordMapper;
import com.hiking.hikingbackend.module.checkin.service.AlertService;
import com.hiking.hikingbackend.module.checkin.vo.AlertStatsVO;
import com.hiking.hikingbackend.module.checkin.vo.AlertVO;
import com.hiking.hikingbackend.module.message.service.MessageService;
import com.hiking.hikingbackend.module.registration.entity.Registration;
import com.hiking.hikingbackend.module.registration.mapper.RegistrationMapper;
import com.hiking.hikingbackend.module.route.entity.Checkpoint;
import com.hiking.hikingbackend.module.route.entity.RoutePoint;
import com.hiking.hikingbackend.module.route.mapper.CheckpointMapper;
import com.hiking.hikingbackend.module.route.mapper.RoutePointMapper;
import com.hiking.hikingbackend.module.system.entity.DictData;
import com.hiking.hikingbackend.module.system.mapper.DictDataMapper;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 预警服务实现类
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertServiceImpl implements AlertService {

    private final AlertEventMapper alertEventMapper;
    private final TrackRecordMapper trackRecordMapper;
    private final CheckInRecordMapper checkInRecordMapper;
    private final ActivityMapper activityMapper;
    private final RegistrationMapper registrationMapper;
    private final RoutePointMapper routePointMapper;
    private final CheckpointMapper checkpointMapper;
    private final UserMapper userMapper;
    private final DictDataMapper dictDataMapper;
    private final MessageService messageService;

    // 状态常量
    private static final int ACTIVITY_STATUS_ONGOING = 3;
    private static final int REGISTRATION_STATUS_APPROVED = 1;

    // ==================== 预警检测 ====================

    /**
     * 检测轨迹预警
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkTrackAlerts(Long userId, Long activityId, TrackRecordDTO track) {
        try {
            // 1. 校验活动是否进行中
            Activity activity = activityMapper.selectById(activityId);
            if (activity == null || activity.getStatus() != ACTIVITY_STATUS_ONGOING) {
                return;
            }

            // 2. 校验用户是否已报名且审核通过
            Registration registration = getApprovedRegistration(userId, activityId);
            if (registration == null) {
                return;
            }

            // 3. 获取预警配置阈值
            Map<String, Double> config = getAlertConfig();
            double deviationThreshold = config.getOrDefault(AlertConstants.CONFIG_KEY_DEVIATION_THRESHOLD,
                    AlertConstants.DEFAULT_DEVIATION_THRESHOLD);
            double severeDeviationThreshold = config.getOrDefault(AlertConstants.CONFIG_KEY_SEVERE_DEVIATION_THRESHOLD,
                    AlertConstants.DEFAULT_SEVERE_DEVIATION_THRESHOLD);
            int stationaryThresholdMinutes = config.getOrDefault(AlertConstants.CONFIG_KEY_STATIONARY_THRESHOLD,
                    (double) AlertConstants.DEFAULT_STATIONARY_THRESHOLD_MINUTES).intValue();

            double userLat = track.getLatitude().doubleValue();
            double userLng = track.getLongitude().doubleValue();

            // 4. 检测偏离路线预警
            checkRouteDeviation(userId, activity, userLat, userLng, deviationThreshold, severeDeviationThreshold);

            // 5. 检测长时间静止预警
            checkLongStationary(userId, activity, userLat, userLng, stationaryThresholdMinutes);

        } catch (Exception e) {
            log.error("检测轨迹预警失败，用户ID：{}，活动ID：{}", userId, activityId, e);
        }
    }

    /**
     * 检测超时未签到预警
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkTimeoutAlerts() {
        try {
            // 1. 获取所有进行中的活动
            LambdaQueryWrapper<Activity> activityWrapper = new LambdaQueryWrapper<>();
            activityWrapper.eq(Activity::getStatus, ACTIVITY_STATUS_ONGOING);
            List<Activity> ongoingActivities = activityMapper.selectList(activityWrapper);

            if (ongoingActivities.isEmpty()) {
                return;
            }

            // 2. 获取预警配置
            Map<String, Double> config = getAlertConfig();
            int timeoutMinutes = config.getOrDefault(AlertConstants.CONFIG_KEY_CHECKIN_TIMEOUT,
                    (double) AlertConstants.DEFAULT_CHECKIN_TIMEOUT_MINUTES).intValue();

            LocalDateTime now = LocalDateTime.now();

            // 3. 遍历每个活动进行检测
            for (Activity activity : ongoingActivities) {
                checkActivityTimeout(activity, now, timeoutMinutes);
            }

        } catch (Exception e) {
            log.error("检测超时未签到预警失败", e);
        }
    }

    /**
     * 检测失联预警
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkLostContactAlerts() {
        try {
            // 1. 获取所有进行中的活动
            LambdaQueryWrapper<Activity> activityWrapper = new LambdaQueryWrapper<>();
            activityWrapper.eq(Activity::getStatus, ACTIVITY_STATUS_ONGOING);
            List<Activity> ongoingActivities = activityMapper.selectList(activityWrapper);

            if (ongoingActivities.isEmpty()) {
                return;
            }

            // 2. 获取预警配置
            Map<String, Double> config = getAlertConfig();
            int lostContactThresholdMinutes = config.getOrDefault(AlertConstants.CONFIG_KEY_LOST_CONTACT_THRESHOLD,
                    (double) AlertConstants.DEFAULT_LOST_CONTACT_THRESHOLD_MINUTES).intValue();

            LocalDateTime thresholdTime = LocalDateTime.now().minusMinutes(lostContactThresholdMinutes);

            // 3. 遍历每个活动进行检测
            for (Activity activity : ongoingActivities) {
                checkActivityLostContact(activity, thresholdTime);
            }

        } catch (Exception e) {
            log.error("检测失联预警失败", e);
        }
    }

    // ==================== 预警查询与处理 ====================

    @Override
    public IPage<AlertVO> getActivityAlerts(Long activityId, AlertQuery query) {
        // 1. 构建查询条件
        LambdaQueryWrapper<AlertEvent> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AlertEvent::getActivityId, activityId);

        applyAlertQueryConditions(queryWrapper, query);

        queryWrapper.orderByDesc(AlertEvent::getTriggerTime);

        // 2. 分页查询
        Page<AlertEvent> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<AlertEvent> alertPage = alertEventMapper.selectPage(page, queryWrapper);

        // 3. 转换为VO
        return alertPage.convert(alert -> convertToVO(alert, null, null));
    }

    @Override
    public IPage<AlertVO> getAlertList(AlertQuery query) {
        LambdaQueryWrapper<AlertEvent> queryWrapper = new LambdaQueryWrapper<>();

        applyAlertQueryConditions(queryWrapper, query);

        queryWrapper.orderByDesc(AlertEvent::getTriggerTime);

        Page<AlertEvent> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<AlertEvent> alertPage = alertEventMapper.selectPage(page, queryWrapper);

        return alertPage.convert(alert -> convertToVO(alert, null, null));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void handleAlert(Long organizerId, Long alertId, AlertHandleDTO dto) {
        // 1. 查询预警记录
        AlertEvent alert = alertEventMapper.selectById(alertId);
        if (alert == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "预警记录不存在");
        }

        // 2. 查询活动验证权限
        Activity activity = activityMapper.selectById(alert.getActivityId());
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 3. 验证权限（组织者或管理员）
        User organizer = userMapper.selectById(organizerId);
        if (organizer == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        boolean isOrganizer = activity.getOrganizerId().equals(organizerId);
        boolean isAdmin = organizer.getRole() != null && organizer.getRole() == 2;

        if (!isOrganizer && !isAdmin) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有活动组织者或管理员可以处理预警");
        }

        // 4. 更新预警处理状态
        alert.setHandleStatus(dto.getHandleStatus());
        alert.setHandleBy(organizerId);
        alert.setHandleTime(LocalDateTime.now());
        alert.setHandleRemark(dto.getHandleRemark());

        alertEventMapper.updateById(alert);
        log.info("预警处理完成，预警ID：{}，处理人：{}，处理状态：{}", alertId, organizerId, dto.getHandleStatus());
    }

    @Override
    public AlertStatsVO getAlertStats(Long activityId) {
        // 1. 查询所有预警
        LambdaQueryWrapper<AlertEvent> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AlertEvent::getActivityId, activityId);
        List<AlertEvent> alerts = alertEventMapper.selectList(queryWrapper);

        // 2. 统计各状态数量
        long total = alerts.size();
        long pending = alerts.stream().filter(a -> a.getHandleStatus() == AlertConstants.HANDLE_STATUS_PENDING).count();
        long processing = alerts.stream().filter(a -> a.getHandleStatus() == AlertConstants.HANDLE_STATUS_PROCESSING).count();
        long resolved = alerts.stream().filter(a -> a.getHandleStatus() == AlertConstants.HANDLE_STATUS_RESOLVED).count();
        long ignored = alerts.stream().filter(a -> a.getHandleStatus() == AlertConstants.HANDLE_STATUS_IGNORED).count();
        long severe = alerts.stream().filter(a -> a.getAlertLevel() == AlertConstants.ALERT_LEVEL_SEVERE).count();

        // 3. 统计各类型数量
        Map<Integer, Long> typeCountMap = alerts.stream()
                .collect(Collectors.groupingBy(AlertEvent::getAlertType, Collectors.counting()));

        List<AlertStatsVO.TypeStat> typeStats = AlertConstants.getAlertTypeText(1).equals("未知") ?
                Collections.emptyList() :
                Arrays.asList(1, 2, 3, 4, 5).stream()
                        .map(type -> AlertStatsVO.TypeStat.builder()
                                .alertType(type)
                                .alertTypeText(AlertConstants.getAlertTypeText(type))
                                .count(typeCountMap.getOrDefault(type, 0L))
                                .build())
                        .filter(stat -> stat.getCount() > 0)
                        .collect(Collectors.toList());

        return AlertStatsVO.builder()
                .totalAlerts(total)
                .pendingCount(pending)
                .processingCount(processing)
                .resolvedCount(resolved)
                .ignoredCount(ignored)
                .severeCount(severe)
                .typeStats(typeStats)
                .build();
    }

    @Override
    public Long getPendingAlertCount(Long activityId) {
        LambdaQueryWrapper<AlertEvent> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(AlertEvent::getActivityId, activityId)
                .eq(AlertEvent::getHandleStatus, AlertConstants.HANDLE_STATUS_PENDING);
        return alertEventMapper.selectCount(queryWrapper);
    }

    // ==================== 私有方法：检测逻辑 ====================

    /**
     * 检测路线偏离预警
     */
    private void checkRouteDeviation(Long userId, Activity activity, double userLat, double userLng,
                                      double deviationThreshold, double severeDeviationThreshold) {
        if (activity.getRouteId() == null) {
            return;
        }

        // 1. 获取路线点位
        LambdaQueryWrapper<RoutePoint> pointWrapper = new LambdaQueryWrapper<>();
        pointWrapper.eq(RoutePoint::getRouteId, activity.getRouteId())
                .orderByAsc(RoutePoint::getSequence);
        List<RoutePoint> routePoints = routePointMapper.selectList(pointWrapper);

        if (routePoints.isEmpty()) {
            return;
        }

        // 2. 找到最近的路线点位
        double minDistance = Double.MAX_VALUE;
        for (RoutePoint point : routePoints) {
            double distance = GeoUtils.calculateDistance(userLat, userLng,
                    point.getLatitude().doubleValue(), point.getLongitude().doubleValue());
            if (distance < minDistance) {
                minDistance = distance;
            }
        }

        // 3. 根据距离判断是否创建预警
        if (minDistance > severeDeviationThreshold) {
            createAlertIfNotExist(userId, activity.getId(),
                    AlertConstants.ALERT_TYPE_SEVERE_DEVIATION,
                    AlertConstants.ALERT_LEVEL_SEVERE,
                    buildDeviationDescription(minDistance, true),
                    BigDecimal.valueOf(userLat), BigDecimal.valueOf(userLng));
        } else if (minDistance > deviationThreshold) {
            createAlertIfNotExist(userId, activity.getId(),
                    AlertConstants.ALERT_TYPE_ROUTE_DEVIATION,
                    AlertConstants.ALERT_LEVEL_WARNING,
                    buildDeviationDescription(minDistance, false),
                    BigDecimal.valueOf(userLat), BigDecimal.valueOf(userLng));
        }
    }

    /**
     * 检测长时间静止预警
     */
    private void checkLongStationary(Long userId, Activity activity, double userLat, double userLng, int thresholdMinutes) {
        // 1. 查询最近thresholdMinutes分钟内的轨迹
        LocalDateTime sinceTime = LocalDateTime.now().minusMinutes(thresholdMinutes);
        LambdaQueryWrapper<TrackRecord> trackWrapper = new LambdaQueryWrapper<>();
        trackWrapper.eq(TrackRecord::getUserId, userId)
                .eq(TrackRecord::getActivityId, activity.getId())
                .ge(TrackRecord::getRecordTime, sinceTime)
                .orderByDesc(TrackRecord::getRecordTime);
        List<TrackRecord> recentTracks = trackRecordMapper.selectList(trackWrapper);

        if (recentTracks.isEmpty()) {
            return;
        }

        // 2. 检查所有轨迹点是否都在静止判定距离内
        boolean isStationary = true;
        double baseLat = recentTracks.get(0).getLatitude().doubleValue();
        double baseLng = recentTracks.get(0).getLongitude().doubleValue();

        for (TrackRecord track : recentTracks) {
            double distance = GeoUtils.calculateDistance(baseLat, baseLng,
                    track.getLatitude().doubleValue(), track.getLongitude().doubleValue());
            if (distance > AlertConstants.STATIONARY_DISTANCE_THRESHOLD) {
                isStationary = false;
                break;
            }
        }

        // 3. 如果静止且未创建过预警，则创建
        if (isStationary) {
            createAlertIfNotExist(userId, activity.getId(),
                    AlertConstants.ALERT_TYPE_LONG_STATIONARY,
                    AlertConstants.ALERT_LEVEL_SEVERE,
                    buildStationaryDescription(thresholdMinutes),
                    BigDecimal.valueOf(userLat), BigDecimal.valueOf(userLng));
        }
    }

    /**
     * 检测活动超时未签到 - 使用查询方式避免Lambda表达式问题
     */
    private void checkActivityTimeout(Activity activity, LocalDateTime now, int timeoutMinutes) {
        // 1. 获取活动的所有签到点
        if (activity.getRouteId() == null) {
            return;
        }

        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, activity.getRouteId())
                .isNotNull(Checkpoint::getExpectedArriveMinutes)
                .orderByAsc(Checkpoint::getSequence);
        List<Checkpoint> checkpoints = checkpointMapper.selectList(checkpointWrapper);

        if (checkpoints.isEmpty()) {
            return;
        }

        // 2. 计算活动开始时间
        LocalDateTime activityStart = LocalDateTime.of(activity.getActivityDate(), activity.getStartTime());

        // 3. 遍历签到点检测超时
        for (Checkpoint checkpoint : checkpoints) {
            LocalDateTime expectedTime = activityStart.plusMinutes(checkpoint.getExpectedArriveMinutes());
            LocalDateTime timeoutTime = expectedTime.plusMinutes(timeoutMinutes);

            // 如果当前时间已超过超时时间
            if (now.isAfter(timeoutTime)) {
                // 查询所有已通过报名的参与者
                LambdaQueryWrapper<Registration> regWrapper = new LambdaQueryWrapper<>();
                regWrapper.eq(Registration::getActivityId, activity.getId())
                        .eq(Registration::getStatus, REGISTRATION_STATUS_APPROVED);
                List<Registration> registrations = registrationMapper.selectList(regWrapper);

                for (Registration registration : registrations) {
                    // 使用原生查询方式检查是否已签到
                    LambdaQueryWrapper<CheckInRecord> checkinWrapper = new LambdaQueryWrapper<>();
                    checkinWrapper.eq(CheckInRecord::getUserId, registration.getUserId())
                            .eq(CheckInRecord::getActivityId, activity.getId())
                            .eq(CheckInRecord::getCheckpointId, checkpoint.getId());
                    boolean hasCheckedIn = checkInRecordMapper.selectCount(checkinWrapper) > 0;

                    // 如果未签到且未创建过预警，则创建
                    if (!hasCheckedIn) {
                        createAlertIfNotExist(registration.getUserId(), activity.getId(),
                                AlertConstants.ALERT_TYPE_TIMEOUT_NO_CHECKIN,
                                AlertConstants.ALERT_LEVEL_WARNING,
                                buildTimeoutDescription(checkpoint.getName()),
                                checkpoint.getLatitude(), checkpoint.getLongitude());
                    }
                }
            }
        }
    }

    /**
     * 检测活动失联预警
     */
    private void checkActivityLostContact(Activity activity, LocalDateTime thresholdTime) {
        // 1. 查询所有已通过报名的参与者
        LambdaQueryWrapper<Registration> regWrapper = new LambdaQueryWrapper<>();
        regWrapper.eq(Registration::getActivityId, activity.getId())
                .eq(Registration::getStatus, REGISTRATION_STATUS_APPROVED);
        List<Registration> registrations = registrationMapper.selectList(regWrapper);

        for (Registration registration : registrations) {
            // 2. 查询最后一条轨迹时间
            LambdaQueryWrapper<TrackRecord> trackWrapper = new LambdaQueryWrapper<>();
            trackWrapper.eq(TrackRecord::getUserId, registration.getUserId())
                    .eq(TrackRecord::getActivityId, activity.getId())
                    .orderByDesc(TrackRecord::getRecordTime)
                    .last("LIMIT 1");
            TrackRecord lastTrack = trackRecordMapper.selectOne(trackWrapper);

            // 3. 如果从未上报轨迹或最后上报时间超过阈值，创建失联预警
            if (lastTrack == null || lastTrack.getRecordTime().isBefore(thresholdTime)) {
                createAlertIfNotExist(registration.getUserId(), activity.getId(),
                        AlertConstants.ALERT_TYPE_LOST_CONTACT,
                        AlertConstants.ALERT_LEVEL_SEVERE,
                        "超过" + AlertConstants.DEFAULT_LOST_CONTACT_THRESHOLD_MINUTES + "分钟未上报轨迹，可能失联",
                        null, null);
            }
        }
    }

    /**
     * 创建预警（如果不存在相同的未处理预警）
     */
    private void createAlertIfNotExist(Long userId, Long activityId, int alertType, int alertLevel,
                                       String description, BigDecimal latitude, BigDecimal longitude) {
        // 检查是否已存在相同的未处理/处理中预警
        LambdaQueryWrapper<AlertEvent> existWrapper = new LambdaQueryWrapper<>();
        existWrapper.eq(AlertEvent::getUserId, userId)
                .eq(AlertEvent::getActivityId, activityId)
                .eq(AlertEvent::getAlertType, alertType)
                .in(AlertEvent::getHandleStatus, Arrays.asList(
                        AlertConstants.HANDLE_STATUS_PENDING,
                        AlertConstants.HANDLE_STATUS_PROCESSING));
        AlertEvent existingAlert = alertEventMapper.selectOne(existWrapper);

        if (existingAlert != null) {
            // 已存在预警，不重复创建
            return;
        }

        // 创建新预警
        AlertEvent alert = AlertEvent.builder()
                .activityId(activityId)
                .userId(userId)
                .alertType(alertType)
                .alertLevel(alertLevel)
                .latitude(latitude)
                .longitude(longitude)
                .description(description)
                .triggerTime(LocalDateTime.now())
                .handleStatus(AlertConstants.HANDLE_STATUS_PENDING)
                .build();

        alertEventMapper.insert(alert);
        log.info("创建预警成功，用户ID：{}，活动ID：{}，类型：{}", userId, activityId, alertType);

        // 发送预警通知给活动组织者
        sendAlertNotification(alert);
    }

    /**
     * 发送预警通知
     */
    private void sendAlertNotification(AlertEvent alert) {
        try {
            // 查询活动信息
            Activity activity = activityMapper.selectById(alert.getActivityId());
            if (activity == null) {
                return;
            }

            // 查询用户信息
            User user = userMapper.selectById(alert.getUserId());
            String userNickName = user != null ? user.getNickname() : "未知用户";

            // 构建消息内容
            String title = "[" + AlertConstants.getAlertLevelText(alert.getAlertLevel()) + "] " +
                    AlertConstants.getAlertTypeText(alert.getAlertType());
            String content = String.format("活动《%s》中，用户【%s】%s",
                    activity.getTitle(), userNickName, alert.getDescription());

            // 发送消息给组织者
            messageService.sendMessage(
                    activity.getOrganizerId(),
                    title,
                    content,
                    AlertConstants.MESSAGE_TYPE_ALERT,
                    alert.getActivityId(),
                    "activity"
            );

        } catch (Exception e) {
            log.error("发送预警通知失败", e);
        }
    }

    // ==================== 私有方法：辅助方法 ====================

    /**
     * 获取已通过报名的用户
     */
    private Registration getApprovedRegistration(Long userId, Long activityId) {
        LambdaQueryWrapper<Registration> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Registration::getUserId, userId)
                .eq(Registration::getActivityId, activityId)
                .eq(Registration::getStatus, REGISTRATION_STATUS_APPROVED);
        return registrationMapper.selectOne(wrapper);
    }

    /**
     * 获取预警配置
     */
    private Map<String, Double> getAlertConfig() {
        Map<String, Double> config = new HashMap<>();

        try {
            LambdaQueryWrapper<DictData> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(DictData::getDictCode, AlertConstants.DICT_CODE_ALERT_CONFIG);
            List<DictData> dictDataList = dictDataMapper.selectList(wrapper);

            for (DictData dictData : dictDataList) {
                try {
                    config.put(dictData.getLabel(), Double.parseDouble(dictData.getValue()));
                } catch (NumberFormatException e) {
                    log.warn("解析预警配置失败：{} = {}", dictData.getLabel(), dictData.getValue());
                }
            }
        } catch (Exception e) {
            log.warn("获取预警配置失败，使用默认值", e);
        }

        return config;
    }

    /**
     * 构建偏离描述
     */
    private String buildDeviationDescription(double distance, boolean isSevere) {
        String level = isSevere ? "严重" : "";
        return String.format("用户%s偏离路线约%d米", level, (int) Math.round(distance));
    }

    /**
     * 构建静止描述
     */
    private String buildStationaryDescription(int minutes) {
        return String.format("用户在同一位置静止超过%d分钟", minutes);
    }

    /**
     * 构建超时描述
     */
    private String buildTimeoutDescription(String checkpointName) {
        return String.format("用户超时未在【%s】签到", checkpointName);
    }

    /**
     * 应用预警查询条件
     */
    private void applyAlertQueryConditions(LambdaQueryWrapper<AlertEvent> wrapper, AlertQuery query) {
        if (query.getAlertType() != null) {
            wrapper.eq(AlertEvent::getAlertType, query.getAlertType());
        }
        if (query.getAlertLevel() != null) {
            wrapper.eq(AlertEvent::getAlertLevel, query.getAlertLevel());
        }
        if (query.getHandleStatus() != null) {
            wrapper.eq(AlertEvent::getHandleStatus, query.getHandleStatus());
        }
        if (query.getUserId() != null) {
            wrapper.eq(AlertEvent::getUserId, query.getUserId());
        }
    }

    /**
     * 转换为VO
     */
    private AlertVO convertToVO(AlertEvent alert, String activityTitle, String userNickname) {
        // 获取活动标题
        if (activityTitle == null) {
            Activity activity = activityMapper.selectById(alert.getActivityId());
            activityTitle = activity != null ? activity.getTitle() : null;
        }

        // 获取用户信息
        if (userNickname == null) {
            User user = userMapper.selectById(alert.getUserId());
            userNickname = user != null ? user.getNickname() : null;
        }

        // 获取用户头像
        String userAvatar = null;
        User user = userMapper.selectById(alert.getUserId());
        if (user != null) {
            userAvatar = user.getAvatar();
        }

        // 获取处理人信息
        String handleByNickname = null;
        if (alert.getHandleBy() != null) {
            User handler = userMapper.selectById(alert.getHandleBy());
            handleByNickname = handler != null ? handler.getNickname() : null;
        }

        return AlertVO.builder()
                .id(alert.getId())
                .activityId(alert.getActivityId())
                .activityTitle(activityTitle)
                .userId(alert.getUserId())
                .userNickname(userNickname)
                .userAvatar(userAvatar)
                .alertType(alert.getAlertType())
                .alertTypeText(AlertConstants.getAlertTypeText(alert.getAlertType()))
                .alertLevel(alert.getAlertLevel())
                .alertLevelText(AlertConstants.getAlertLevelText(alert.getAlertLevel()))
                .latitude(alert.getLatitude())
                .longitude(alert.getLongitude())
                .description(alert.getDescription())
                .triggerTime(alert.getTriggerTime())
                .handleStatus(alert.getHandleStatus())
                .handleStatusText(AlertConstants.getHandleStatusText(alert.getHandleStatus()))
                .handleBy(alert.getHandleBy())
                .handleByNickname(handleByNickname)
                .handleTime(alert.getHandleTime())
                .handleRemark(alert.getHandleRemark())
                .createTime(alert.getCreateTime())
                .isSevere(alert.getAlertLevel() == AlertConstants.ALERT_LEVEL_SEVERE)
                .build();
    }
}
