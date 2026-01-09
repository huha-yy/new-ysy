package com.hiking.hikingbackend.module.checkin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.common.utils.GeoUtils;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import com.hiking.hikingbackend.module.activity.mapper.ActivityMapper;
import com.hiking.hikingbackend.module.checkin.dto.CheckInDTO;
import com.hiking.hikingbackend.module.checkin.dto.TrackRecordDTO;
import com.hiking.hikingbackend.module.checkin.entity.CheckInRecord;
import com.hiking.hikingbackend.module.checkin.entity.TrackRecord;
import com.hiking.hikingbackend.module.checkin.mapper.CheckInRecordMapper;
import com.hiking.hikingbackend.module.checkin.mapper.TrackRecordMapper;
import com.hiking.hikingbackend.module.checkin.service.AlertService;
import com.hiking.hikingbackend.module.checkin.service.CheckInService;
import com.hiking.hikingbackend.module.checkin.vo.CheckInVO;
import com.hiking.hikingbackend.module.checkin.vo.CheckInProgressVO;
import com.hiking.hikingbackend.module.checkin.vo.CheckInStatusVO;
import com.hiking.hikingbackend.module.checkin.vo.CheckpointStatsVO;
import com.hiking.hikingbackend.module.checkin.vo.ParticipantCheckInVO;
import com.hiking.hikingbackend.module.registration.entity.Registration;
import com.hiking.hikingbackend.module.registration.mapper.RegistrationMapper;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import com.hiking.hikingbackend.module.route.entity.Checkpoint;
import com.hiking.hikingbackend.module.route.mapper.CheckpointMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 签到服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CheckInServiceImpl implements CheckInService {

    private final CheckInRecordMapper checkInRecordMapper;

    private final TrackRecordMapper trackRecordMapper;

    private final CheckpointMapper checkpointMapper;

    private final ActivityMapper activityMapper;

    private final RegistrationMapper registrationMapper;

    private final UserMapper userMapper;

    private final AlertService alertService;

    // 报名状态常量
    private static final int REGISTRATION_STATUS_APPROVED = 1;  // 已通过

    // 活动状态常量
    private static final int ACTIVITY_STATUS_ONGOING = 3;  // 进行中
    private static final int ACTIVITY_STATUS_ENDED = 4;    // 已结束

    // 签到记录状态常量
    private static final int CHECKIN_STATUS_NORMAL = 1;   // 正常
    private static final int CHECKIN_STATUS_LATE = 2;     // 迟到
    private static final int CHECKIN_STATUS_MAKEUP = 3;   // 补签

    /**
     * GPS签到
     *
     * @param userId 用户ID
     * @param activityId 活动ID
     * @param checkInDTO 签到信息
     * @return 签到记录
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public CheckInVO performCheckIn(Long userId, Long activityId, CheckInDTO checkInDTO) {
        log.info("开始处理签到请求，用户ID：{}，活动ID：{}，签到点ID：{}", userId, activityId, checkInDTO.getCheckpointId());

        // 1. 校验用户是否已报名且审核通过
        validateUserRegistration(userId, activityId);

        // 2. 校验活动是否在进行中
        Activity activity = validateActivityStatus(activityId);

        // 3. 获取签到点信息
        Checkpoint checkpoint = checkpointMapper.selectById(checkInDTO.getCheckpointId());
        if (checkpoint == null) {
            throw new BusinessException(ResultCode.CHECKPOINT_NOT_FOUND);
        }
        log.info("签到点信息：{}，坐标：{}, {}，有效半径：{}米", checkpoint.getName(), checkpoint.getLatitude(), checkpoint.getLongitude(), checkpoint.getRadius());

        // 4. 计算用户位置与签到点的距离
        double userLat = checkInDTO.getLatitude().doubleValue();
        double userLng = checkInDTO.getLongitude().doubleValue();
        double checkpointLat = checkpoint.getLatitude().doubleValue();
        double checkpointLng = checkpoint.getLongitude().doubleValue();

        double distance = GeoUtils.calculateDistance(userLat, userLng, checkpointLat, checkpointLng);
        log.info("用户位置与签到点距离：{}米", distance);

        // 5. 判断距离是否在有效半径内
        int effectiveRadius = checkpoint.getRadius() != null ? checkpoint.getRadius() : 100; // 默认100米
        if (distance > effectiveRadius) {
            throw new BusinessException(ResultCode.NOT_IN_CHECKIN_RANGE);
        }

        // 6. 防止重复签到
        LambdaQueryWrapper<CheckInRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CheckInRecord::getUserId, userId)
                   .eq(CheckInRecord::getActivityId, activityId)
                   .eq(CheckInRecord::getCheckpointId, checkInDTO.getCheckpointId());
        CheckInRecord existingRecord = checkInRecordMapper.selectOne(queryWrapper);
        if (existingRecord != null) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "已在当前签到点签到，请勿重复签到");
        }

        // 7. 判断签到状态（正常/迟到）
        Integer checkInStatus = determineCheckInStatus(activity, checkpoint);

        // 8. 记录签到
        CheckInRecord checkInRecord = CheckInRecord.builder()
                .userId(userId)
                .activityId(activityId)
                .checkpointId(checkInDTO.getCheckpointId())
                .checkInTime(LocalDateTime.now())
                .latitude(checkInDTO.getLatitude())
                .longitude(checkInDTO.getLongitude())
                .distanceToCheckpoint((int) Math.round(distance))
                .status(checkInStatus)
                .remark(checkInDTO.getRemark())
                .build();

        checkInRecordMapper.insert(checkInRecord);
        log.info("签到成功，签到记录ID：{}，状态：{}", checkInRecord.getId(), checkInStatus);

        // 9. 转换为VO返回
        return convertToCheckInVO(checkInRecord, checkpoint);
    }

    /**
     * 批量上报轨迹
     *
     * @param userId 用户ID
     * @param trackRecords 轨迹记录列表
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void batchUploadTracks(Long userId, List<TrackRecordDTO> trackRecords) {
        if (trackRecords == null || trackRecords.isEmpty()) {
            log.info("轨迹记录为空，跳过处理");
            return;
        }

        log.info("开始批量插入轨迹记录，用户ID：{}，记录数：{}", userId, trackRecords.size());

        // 校验活动是否存在
        Long activityId = trackRecords.get(0).getActivityId();
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 转换并插入轨迹记录
        for (TrackRecordDTO dto : trackRecords) {
            TrackRecord trackRecord = TrackRecord.builder()
                    .userId(userId)
                    .activityId(dto.getActivityId())
                    .latitude(dto.getLatitude())
                    .longitude(dto.getLongitude())
                    .elevation(dto.getElevation())
                    .accuracy(dto.getAccuracy())
                    .speed(dto.getSpeed())
                    .recordTime(dto.getRecordTime())
                    .build();
            trackRecordMapper.insert(trackRecord);
        }

        log.info("批量插入轨迹记录完成，插入数：{}", trackRecords.size());

        // 触发轨迹预警检测（使用最后一条轨迹数据）
        TrackRecordDTO lastTrack = trackRecords.get(trackRecords.size() - 1);
        try {
            alertService.checkTrackAlerts(userId, activityId, lastTrack);
        } catch (Exception e) {
            // 预警检测失败不影响轨迹上报
            log.error("轨迹预警检测失败，用户ID：{}，活动ID：{}", userId, activityId, e);
        }
    }

    /**
     * 获取签到状态/进度
     *
     * @param userId 用户ID
     * @param activityId 活动ID
     * @return 签到进度
     */
    @Override
    public CheckInProgressVO getCheckInStatus(Long userId, Long activityId) {
        log.info("获取签到进度，用户ID：{}，活动ID：{}", userId, activityId);

        // 1. 查询活动的所有签到点
        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, 
                           activityMapper.selectById(activityId).getRouteId())
                        .orderByAsc(Checkpoint::getSequence);
        List<Checkpoint> checkpoints = checkpointMapper.selectList(checkpointWrapper);

        if (checkpoints.isEmpty()) {
            return CheckInProgressVO.builder()
                    .activityId(activityId)
                    .totalCheckpoints(0)
                    .checkedInCount(0)
                    .progress(0)
                    .checkpointStatusList(List.of())
                    .build();
        }

        // 2. 查询用户在各签到点的签到记录
        LambdaQueryWrapper<CheckInRecord> recordWrapper = new LambdaQueryWrapper<>();
        recordWrapper.eq(CheckInRecord::getUserId, userId)
                    .eq(CheckInRecord::getActivityId, activityId);
        List<CheckInRecord> checkInRecords = checkInRecordMapper.selectList(recordWrapper);

        // 3. 构建签到点状态列表
        List<CheckInStatusVO> statusList = checkpoints.stream().map(checkpoint -> {
            // 查找该签到点的签到记录
            CheckInRecord record = checkInRecords.stream()
                    .filter(r -> r.getCheckpointId().equals(checkpoint.getId()))
                    .findFirst()
                    .orElse(null);

            CheckInVO checkInVO = record != null ? convertToCheckInVO(record, checkpoint) : null;

            return CheckInStatusVO.builder()
                    .checkpointId(checkpoint.getId())
                    .checkpointName(checkpoint.getName())
                    .sequence(checkpoint.getSequence())
                    .checkpointType(checkpoint.getCheckpointType())
                    .checkpointTypeText(getCheckpointTypeText(checkpoint.getCheckpointType()))
                    .isRequired(checkpoint.getIsRequired())
                    .isCheckedIn(record != null ? 1 : 0)
                    .checkInRecord(checkInVO)
                    .build();
        }).collect(Collectors.toList());

        // 4. 计算签到进度
        int totalCount = checkpoints.size();
        int checkedInCount = (int) statusList.stream().filter(s -> s.getIsCheckedIn() == 1).count();
        int progress = totalCount > 0 ? (checkedInCount * 100 / totalCount) : 0;

        return CheckInProgressVO.builder()
                .activityId(activityId)
                .totalCheckpoints(totalCount)
                .checkedInCount(checkedInCount)
                .progress(progress)
                .checkpointStatusList(statusList)
                .build();
    }

    /**
     * 校验用户是否已报名且审核通过
     */
    private Registration validateUserRegistration(Long userId, Long activityId) {
        LambdaQueryWrapper<Registration> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Registration::getUserId, userId)
                   .eq(Registration::getActivityId, activityId);
        Registration registration = registrationMapper.selectOne(queryWrapper);

        if (registration == null) {
            throw new BusinessException(ResultCode.NOT_REGISTERED_FOR_ACTIVITY);
        }

        if (registration.getStatus() != REGISTRATION_STATUS_APPROVED) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "报名状态不允许签到");
        }

        return registration;
    }

    /**
     * 校验活动是否在进行中
     */
    private Activity validateActivityStatus(Long activityId) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        if (activity.getStatus() == ACTIVITY_STATUS_ENDED) {
            throw new BusinessException(ResultCode.ACTIVITY_ENDED);
        }

        // 如果活动状态不是进行中，则判断当前时间是否在活动时间范围内
        if (activity.getStatus() != ACTIVITY_STATUS_ONGOING) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime activityStart = LocalDateTime.of(activity.getActivityDate(), activity.getStartTime());
            LocalDateTime activityEnd = LocalDateTime.of(activity.getActivityDate(), activity.getEndTime());

            if (now.isBefore(activityStart)) {
                throw new BusinessException(ResultCode.ACTIVITY_NOT_STARTED);
            }
            if (now.isAfter(activityEnd)) {
                throw new BusinessException(ResultCode.ACTIVITY_ENDED);
            }
        }

        return activity;
    }

    /**
     * 判断签到状态（正常/迟到）
     */
    private Integer determineCheckInStatus(Activity activity, Checkpoint checkpoint) {
        // 如果签到点没有设置预计到达时间，则默认为正常
        if (checkpoint.getExpectedArriveMinutes() == null) {
            return CHECKIN_STATUS_NORMAL;
        }

        // 计算预期到达时间
        LocalDateTime activityStart = LocalDateTime.of(activity.getActivityDate(), activity.getStartTime());
        LocalDateTime expectedArrivalTime = activityStart.plusMinutes(checkpoint.getExpectedArriveMinutes());

        // 判断是否迟到（允许10分钟误差）
        LocalDateTime toleranceTime = expectedArrivalTime.plusMinutes(10);
        if (LocalDateTime.now().isAfter(toleranceTime)) {
            return CHECKIN_STATUS_LATE;
        }

        return CHECKIN_STATUS_NORMAL;
    }

    /**
     * 转换为CheckInVO
     */
    private CheckInVO convertToCheckInVO(CheckInRecord record, Checkpoint checkpoint) {
        return CheckInVO.builder()
                .id(record.getId())
                .checkpointId(record.getCheckpointId())
                .checkpointName(checkpoint != null ? checkpoint.getName() : null)
                .checkInTime(record.getCheckInTime())
                .latitude(record.getLatitude())
                .longitude(record.getLongitude())
                .distanceToCheckpoint(record.getDistanceToCheckpoint())
                .status(record.getStatus())
                .statusText(getCheckInStatusText(record.getStatus()))
                .remark(record.getRemark())
                .build();
    }

    /**
     * 获取签到状态文本
     */
    private String getCheckInStatusText(Integer status) {
        if (status == null) return null;
        return switch (status) {
            case CHECKIN_STATUS_NORMAL -> "正常";
            case CHECKIN_STATUS_LATE -> "迟到";
            case CHECKIN_STATUS_MAKEUP -> "补签";
            default -> "未知";
        };
    }

    /**
     * 获取签到点类型文本
     */
    private String getCheckpointTypeText(Integer type) {
        if (type == null) return null;
        return switch (type) {
            case 1 -> "集合点";
            case 2 -> "途中点";
            case 3 -> "终点";
            default -> "未知";
        };
    }

    /**
     * 获取活动的签到点列表
     *
     * @param activityId 活动ID
     * @return 签到点列表
     */
    @Override
    public List<Checkpoint> getCheckpointsByActivity(Long activityId) {
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        LambdaQueryWrapper<Checkpoint> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Checkpoint::getRouteId, activity.getRouteId())
                    .orderByAsc(Checkpoint::getSequence);
        return checkpointMapper.selectList(queryWrapper);
    }

    /**
     * 获取活动所有参与者的签到状态（组织者）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @return 参与者签到状态列表
     */
    @Override
    public List<CheckInProgressVO> getParticipantsCheckInStatus(Long organizerId, Long activityId) {
        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 校验权限（必须是活动组织者）
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }

        // 3. 查询所有已审核通过的参与者
        LambdaQueryWrapper<Registration> registrationWrapper = new LambdaQueryWrapper<>();
        registrationWrapper.eq(Registration::getActivityId, activityId)
                          .eq(Registration::getStatus, REGISTRATION_STATUS_APPROVED);
        List<Registration> registrations = registrationMapper.selectList(registrationWrapper);

        // 4. 获取每个参与者的签到状态
        return registrations.stream()
                .map(registration -> getCheckInStatus(registration.getUserId(), activityId))
                .collect(Collectors.toList());
    }

    /**
     * 获取活动所有参与者的签到状态（含用户信息，用于签到监控）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @return 参与者签到状态列表（含用户信息）
     */
    @Override
    public List<ParticipantCheckInVO> getParticipantsCheckInWithUser(Long organizerId, Long activityId) {
        log.info("获取参与者签到状态（含用户信息），组织者ID：{}，活动ID：{}", organizerId, activityId);

        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 校验权限（必须是活动组织者）
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }

        // 3. 查询所有已审核通过的参与者
        LambdaQueryWrapper<Registration> registrationWrapper = new LambdaQueryWrapper<>();
        registrationWrapper.eq(Registration::getActivityId, activityId)
                .eq(Registration::getStatus, REGISTRATION_STATUS_APPROVED);
        List<Registration> registrations = registrationMapper.selectList(registrationWrapper);

        // 4. 获取活动的所有签到点
        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, activity.getRouteId())
                .orderByAsc(Checkpoint::getSequence);
        List<Checkpoint> checkpoints = checkpointMapper.selectList(checkpointWrapper);

        int totalCheckpoints = checkpoints.size();

        // 5. 构建参与者签到状态列表
        return registrations.stream().map(registration -> {
            // 获取用户信息
            User user = userMapper.selectById(registration.getUserId());
            if (user == null) {
                log.warn("用户不存在，用户ID：{}", registration.getUserId());
                return null;
            }

            // 查询该用户的所有签到记录
            LambdaQueryWrapper<CheckInRecord> recordWrapper = new LambdaQueryWrapper<>();
            recordWrapper.eq(CheckInRecord::getUserId, registration.getUserId())
                    .eq(CheckInRecord::getActivityId, activityId)
                    .orderByDesc(CheckInRecord::getCheckInTime);
            List<CheckInRecord> checkInRecords = checkInRecordMapper.selectList(recordWrapper);

            // 构建签到点状态列表
            List<CheckInStatusVO> checkpointStatusList = checkpoints.stream().map(checkpoint -> {
                CheckInRecord record = checkInRecords.stream()
                        .filter(r -> r.getCheckpointId().equals(checkpoint.getId()))
                        .findFirst()
                        .orElse(null);

                CheckInVO checkInVO = record != null ? convertToCheckInVO(record, checkpoint) : null;

                return CheckInStatusVO.builder()
                        .checkpointId(checkpoint.getId())
                        .checkpointName(checkpoint.getName())
                        .sequence(checkpoint.getSequence())
                        .checkpointType(checkpoint.getCheckpointType())
                        .checkpointTypeText(getCheckpointTypeText(checkpoint.getCheckpointType()))
                        .isRequired(checkpoint.getIsRequired())
                        .isCheckedIn(record != null ? 1 : 0)
                        .checkInRecord(checkInVO)
                        .build();
            }).collect(Collectors.toList());

            // 计算签到进度
            int checkedInCount = (int) checkpointStatusList.stream().filter(s -> s.getIsCheckedIn() == 1).count();
            int progress = totalCheckpoints > 0 ? (checkedInCount * 100 / totalCheckpoints) : 0;

            // 获取最后签到信息
            LocalDateTime lastCheckInTime = null;
            String lastCheckInLocation = null;
            if (!checkInRecords.isEmpty()) {
                CheckInRecord lastRecord = checkInRecords.get(0);
                lastCheckInTime = lastRecord.getCheckInTime();
                Checkpoint lastCheckpoint = checkpoints.stream()
                        .filter(cp -> cp.getId().equals(lastRecord.getCheckpointId()))
                        .findFirst()
                        .orElse(null);
                if (lastCheckpoint != null) {
                    lastCheckInLocation = lastCheckpoint.getName();
                }
            }

            // 判断是否需要预警（超过30分钟未完成签到且活动进行中）
            int warning = 0;
            String warningReason = null;
            if (activity.getStatus() == ACTIVITY_STATUS_ONGOING && checkedInCount < totalCheckpoints) {
                if (lastCheckInTime != null) {
                    long minutesSinceLastCheckIn = java.time.Duration.between(lastCheckInTime, LocalDateTime.now()).toMinutes();
                    if (minutesSinceLastCheckIn > 30) {
                        warning = 1;
                        warningReason = "已超过30分钟未签到";
                    }
                } else if (activity.getActivityDate() != null && activity.getStartTime() != null) {
                    // 从活动开始时间计算（增加null判断）
                    try {
                        LocalDateTime activityStart = LocalDateTime.of(activity.getActivityDate(), activity.getStartTime());
                        long minutesSinceStart = java.time.Duration.between(activityStart, LocalDateTime.now()).toMinutes();
                        if (minutesSinceStart > 60) {
                            warning = 1;
                            warningReason = "活动开始超过60分钟仍未签到";
                        }
                    } catch (Exception e) {
                        log.warn("计算活动开始时间异常，活动ID：{}", activityId, e);
                    }
                }
            }

            // 脱敏手机号
            String maskedPhone = maskPhoneNumber(user.getPhone());

            return ParticipantCheckInVO.builder()
                    .registrationId(registration.getId())
                    .userId(user.getId())
                    .nickname(user.getNickname() != null ? user.getNickname() : user.getUsername())
                    .avatar(user.getAvatar())
                    .phone(maskedPhone)
                    .totalCheckpoints(totalCheckpoints)
                    .checkedInCount(checkedInCount)
                    .progress(progress)
                    .checkpointStatusList(checkpointStatusList)
                    .lastCheckInTime(lastCheckInTime)
                    .lastCheckInLocation(lastCheckInLocation)
                    .warning(warning)
                    .warningReason(warningReason)
                    .build();
        }).filter(obj -> obj != null).collect(Collectors.toList());
    }

    /**
     * 获取活动各签到点的统计信息
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @return 签到点统计列表
     */
    @Override
    public List<CheckpointStatsVO> getCheckpointStats(Long organizerId, Long activityId) {
        log.info("获取签到点统计，组织者ID：{}，活动ID：{}", organizerId, activityId);

        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 校验权限（必须是活动组织者）
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }

        // 3. 获取活动的所有签到点
        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, activity.getRouteId())
                .orderByAsc(Checkpoint::getSequence);
        List<Checkpoint> checkpoints = checkpointMapper.selectList(checkpointWrapper);

        // 4. 获取已审核通过的总人数
        LambdaQueryWrapper<Registration> registrationWrapper = new LambdaQueryWrapper<>();
        registrationWrapper.eq(Registration::getActivityId, activityId)
                .eq(Registration::getStatus, REGISTRATION_STATUS_APPROVED);
        List<Registration> registrations = registrationMapper.selectList(registrationWrapper);
        int totalParticipants = registrations.size();

        if (totalParticipants == 0) {
            // 没有参与者，返回空统计
            return checkpoints.stream().map(cp -> CheckpointStatsVO.builder()
                    .checkpointId(cp.getId())
                    .name(cp.getName())
                    .sequence(cp.getSequence())
                    .checkpointType(cp.getCheckpointType())
                    .checkpointTypeText(getCheckpointTypeText(cp.getCheckpointType()))
                    .isRequired(cp.getIsRequired())
                    .longitude(cp.getLongitude())
                    .latitude(cp.getLatitude())
                    .radius(cp.getRadius())
                    .checkedCount(0)
                    .totalCount(0)
                    .completionRate(0)
                    .build()).collect(Collectors.toList());
        }

        // 5. 统计每个签到点的签到人数
        return checkpoints.stream().map(checkpoint -> {
            // 查询该签到点的签到记录数
            LambdaQueryWrapper<CheckInRecord> recordWrapper = new LambdaQueryWrapper<>();
            recordWrapper.eq(CheckInRecord::getActivityId, activityId)
                    .eq(CheckInRecord::getCheckpointId, checkpoint.getId());
            Long checkedCount = checkInRecordMapper.selectCount(recordWrapper);

            int completionRate = totalParticipants > 0
                    ? (checkedCount.intValue() * 100 / totalParticipants)
                    : 0;

            return CheckpointStatsVO.builder()
                    .checkpointId(checkpoint.getId())
                    .name(checkpoint.getName())
                    .sequence(checkpoint.getSequence())
                    .checkpointType(checkpoint.getCheckpointType())
                    .checkpointTypeText(getCheckpointTypeText(checkpoint.getCheckpointType()))
                    .isRequired(checkpoint.getIsRequired())
                    .longitude(checkpoint.getLongitude())
                    .latitude(checkpoint.getLatitude())
                    .radius(checkpoint.getRadius())
                    .checkedCount(checkedCount.intValue())
                    .totalCount(totalParticipants)
                    .completionRate(completionRate)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * 脱敏手机号
     */
    private String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}

