package com.hiking.hikingbackend.module.activity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.module.activity.dto.ActivityAuditDTO;
import com.hiking.hikingbackend.module.activity.dto.ActivityCreateDTO;
import com.hiking.hikingbackend.module.activity.dto.ActivityQuery;
import com.hiking.hikingbackend.module.activity.dto.ActivityUpdateDTO;
import com.hiking.hikingbackend.module.activity.dto.RegistrationCreateDTO;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import com.hiking.hikingbackend.module.activity.mapper.ActivityMapper;
import com.hiking.hikingbackend.module.activity.service.ActivityService;
import com.hiking.hikingbackend.module.activity.vo.ActivityDetailVO;
import com.hiking.hikingbackend.module.activity.vo.ActivityListVO;
import com.hiking.hikingbackend.module.registration.entity.Registration;
import com.hiking.hikingbackend.module.registration.mapper.RegistrationMapper;
import com.hiking.hikingbackend.module.route.entity.Route;
import com.hiking.hikingbackend.module.route.mapper.RouteMapper;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 活动服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityMapper activityMapper;

    private final UserMapper userMapper;

    private final RouteMapper routeMapper;

    private final RegistrationMapper registrationMapper;

    private static final int STATUS_DRAFT = 0;      // 草稿
    private static final int STATUS_PENDING = 1;    // 待审核
    private static final int STATUS_PUBLISHED = 2;   // 已发布
    private static final int STATUS_IN_PROGRESS = 3;  // 进行中
    private static final int STATUS_ENDED = 4;     // 已结束
    private static final int STATUS_CANCELLED = 5;   // 已取消
    private static final int STATUS_REJECTED = 6;   // 已驳回

    /**
     * 活动列表（分页查询）
     *
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<ActivityListVO> getActivityList(ActivityQuery query) {
        // 1. 构建查询条件
        LambdaQueryWrapper<Activity> queryWrapper = new LambdaQueryWrapper<>();
        
        // 显示所有可见状态的活动（已发布、进行中、已结束）
        // 状态：0=草稿, 1=待审核, 2=已发布, 3=进行中, 4=已结束, 5=已取消, 6=已驳回
        queryWrapper.in(Activity::getStatus, STATUS_PUBLISHED, STATUS_IN_PROGRESS, STATUS_ENDED);
        
        // 关键词搜索（标题、描述）
        if (query.getKeyword() != null && !query.getKeyword().isEmpty()) {
            queryWrapper.and(wrapper -> wrapper
                .like(Activity::getTitle, query.getKeyword())
                .or()
                .like(Activity::getDescription, query.getKeyword()));
        }
        
        // 难度筛选
        if (query.getDifficultyLevel() != null) {
            queryWrapper.eq(Activity::getDifficultyLevel, query.getDifficultyLevel());
        }
        
        // 日期范围筛选
        if (query.getStartDate() != null) {
            queryWrapper.ge(Activity::getActivityDate, query.getStartDate());
        }
        if (query.getEndDate() != null) {
            queryWrapper.le(Activity::getActivityDate, query.getEndDate());
        }
        
        // 按活动日期升序排序
        queryWrapper.orderByAsc(Activity::getActivityDate)
                   .orderByDesc(Activity::getCreateTime);
        
        // 2. 分页查询
        Page<Activity> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<Activity> activityPage = activityMapper.selectPage(page, queryWrapper);
        
        // 3. 转换为VO
        return activityPage.convert(this::convertToListVO);
    }

    /**
     * 活动详情
     *
     * @param activityId 活动ID
     * @param userId 当前用户ID（可选）
     * @return 活动详情
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ActivityDetailVO getActivityDetail(Long activityId, Long userId) {
        // 1. 查询活动信息
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 增加浏览次数
        activity.setViewCount((activity.getViewCount() == null ? 0 : activity.getViewCount()) + 1);
        activityMapper.updateById(activity);

        // 3. 转换为详情VO
        return convertToDetailVO(activity, userId);
    }

    /**
     * 创建活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param createDTO 创建信息
     * @return 活动ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createActivity(Long organizerId, ActivityCreateDTO createDTO) {
        // 1. 校验用户角色
        User organizer = userMapper.selectById(organizerId);
        if (organizer == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        if (organizer.getRole() != 1 && organizer.getRole() != 2) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        
        // 2. 校验路线是否存在
        Route route = routeMapper.selectById(createDTO.getRouteId());
        if (route == null) {
            throw new BusinessException(ResultCode.ROUTE_NOT_FOUND);
        }
        
        // 3. 创建活动
        Activity activity = Activity.builder()
                .title(createDTO.getTitle())
                .coverImage(createDTO.getCoverImage())
                .description(createDTO.getDescription())
                .organizerId(organizerId)
                .routeId(createDTO.getRouteId())
                .activityDate(createDTO.getActivityDate())
                .startTime(createDTO.getStartTime())
                .endTime(createDTO.getEndTime())
                .durationHours(createDTO.getDurationHours())
                .maxParticipants(createDTO.getMaxParticipants())
                .currentParticipants(0)
                .registrationDeadline(createDTO.getRegistrationDeadline())
                .difficultyLevel(createDTO.getDifficultyLevel())
                .fee(createDTO.getFee())
                .feeDescription(createDTO.getFeeDescription())
                .equipmentRequirement(createDTO.getEquipmentRequirement())
                .fitnessRequirement(createDTO.getFitnessRequirement())
                .ageMin(createDTO.getAgeMin())
                .ageMax(createDTO.getAgeMax())
                .experienceRequirement(createDTO.getExperienceRequirement())
                .status(STATUS_DRAFT)  // 草稿状态
                .build();
        
        activityMapper.insert(activity);
        
        log.info("创建活动成功，活动ID：{}，组织者：{}", activity.getId(), organizer.getUsername());
        
        return activity.getId();
    }

    /**
     * 更新活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     * @param updateDTO 更新信息
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateActivity(Long organizerId, Long activityId, ActivityUpdateDTO updateDTO) {
        // 1. 查询活动
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        
        // 2. 校验权限
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }
        
        // 3. 校验状态（只有草稿和驳回状态可以修改）
        if (activity.getStatus() != STATUS_DRAFT && activity.getStatus() != STATUS_REJECTED) {
            throw new BusinessException(ResultCode.ACTIVITY_PUBLISHED);
        }
        
        // 4. 更新活动
        if (updateDTO.getTitle() != null) {
            activity.setTitle(updateDTO.getTitle());
        }
        if (updateDTO.getCoverImage() != null) {
            activity.setCoverImage(updateDTO.getCoverImage());
        }
        if (updateDTO.getDescription() != null) {
            activity.setDescription(updateDTO.getDescription());
        }
        if (updateDTO.getActivityDate() != null) {
            activity.setActivityDate(updateDTO.getActivityDate());
        }
        if (updateDTO.getStartTime() != null) {
            activity.setStartTime(updateDTO.getStartTime());
        }
        if (updateDTO.getEndTime() != null) {
            activity.setEndTime(updateDTO.getEndTime());
        }
        if (updateDTO.getDurationHours() != null) {
            activity.setDurationHours(updateDTO.getDurationHours());
        }
        if (updateDTO.getMaxParticipants() != null) {
            activity.setMaxParticipants(updateDTO.getMaxParticipants());
        }
        if (updateDTO.getRegistrationDeadline() != null) {
            activity.setRegistrationDeadline(updateDTO.getRegistrationDeadline());
        }
        if (updateDTO.getDifficultyLevel() != null) {
            activity.setDifficultyLevel(updateDTO.getDifficultyLevel());
        }
        if (updateDTO.getFee() != null) {
            activity.setFee(updateDTO.getFee());
        }
        if (updateDTO.getFeeDescription() != null) {
            activity.setFeeDescription(updateDTO.getFeeDescription());
        }
        if (updateDTO.getEquipmentRequirement() != null) {
            activity.setEquipmentRequirement(updateDTO.getEquipmentRequirement());
        }
        if (updateDTO.getFitnessRequirement() != null) {
            activity.setFitnessRequirement(updateDTO.getFitnessRequirement());
        }
        if (updateDTO.getAgeMin() != null) {
            activity.setAgeMin(updateDTO.getAgeMin());
        }
        if (updateDTO.getAgeMax() != null) {
            activity.setAgeMax(updateDTO.getAgeMax());
        }
        if (updateDTO.getExperienceRequirement() != null) {
            activity.setExperienceRequirement(updateDTO.getExperienceRequirement());
        }
        
        activityMapper.updateById(activity);
        
        log.info("更新活动成功，活动ID：{}", activityId);
    }

    /**
     * 提交审核（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitForAudit(Long organizerId, Long activityId) {
        // 1. 查询活动
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        
        // 2. 校验权限
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }
        
        // 3. 校验状态（只有草稿和驳回状态可以提交审核）
        if (activity.getStatus() != STATUS_DRAFT && activity.getStatus() != STATUS_REJECTED) {
            throw new BusinessException(ResultCode.ACTIVITY_PUBLISHED);
        }
        
        // 4. 更新状态为待审核
        activity.setStatus(STATUS_PENDING);
        activityMapper.updateById(activity);
        
        log.info("提交审核成功，活动ID：{}", activityId);
    }

    /**
     * 审核活动（管理员）
     *
     * @param auditorId 审核人用户ID
     * @param auditDTO 审核信息
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void auditActivity(Long auditorId, ActivityAuditDTO auditDTO) {
        // 1. 查询活动
        Activity activity = activityMapper.selectById(auditDTO.getActivityId());
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        
        // 2. 校验状态（只有待审核状态可以审核）
        if (activity.getStatus() != STATUS_PENDING) {
            throw new BusinessException(ResultCode.OPERATION_FAILED);
        }
        
        // 3. 校验审核人角色
        User auditor = userMapper.selectById(auditorId);
        if (auditor == null || auditor.getRole() != 2) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        
        // 4. 更新活动状态
        if (auditDTO.getApproved()) {
            // 通过：状态改为已发布
            activity.setStatus(STATUS_PUBLISHED);
            activity.setRejectReason(null);
            log.info("审核通过，活动ID：{}", auditDTO.getActivityId());
        } else {
            // 驳回：状态改为已驳回，记录驳回原因
            activity.setStatus(STATUS_REJECTED);
            activity.setRejectReason(auditDTO.getRejectReason());
            log.info("审核驳回，活动ID：{}，原因：{}", auditDTO.getActivityId(), auditDTO.getRejectReason());
        }
        
        // 5. 记录审核信息
        activity.setAuditBy(auditorId);
        activity.setAuditTime(java.time.LocalDateTime.now());
        
        activityMapper.updateById(activity);
    }

    /**
     * 删除活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteActivity(Long organizerId, Long activityId) {
        // 1. 查询活动
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        
        // 2. 校验权限
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }
        
        // 3. 校验状态（只有草稿和驳回状态可以删除）
        if (activity.getStatus() != STATUS_DRAFT && activity.getStatus() != STATUS_REJECTED) {
            throw new BusinessException(ResultCode.ACTIVITY_PUBLISHED);
        }
        
        // 4. 删除活动
        activityMapper.deleteById(activityId);
        
        log.info("删除活动成功，活动ID：{}", activityId);
    }

    /**
     * 取消活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelActivity(Long organizerId, Long activityId) {
        // 1. 查询活动
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        
        // 2. 校验权限
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }
        
        // 3. 校验状态（只有已发布状态可以取消）
        if (activity.getStatus() != STATUS_PUBLISHED) {
            throw new BusinessException(ResultCode.OPERATION_FAILED);
        }
        
        // 4. 更新状态为已取消
        activity.setStatus(STATUS_CANCELLED);
        activityMapper.updateById(activity);
        
        log.info("取消活动成功，活动ID：{}", activityId);
    }

    /**
     * 报名活动
     *
     * @param activityId 活动ID
     * @param userId 用户ID（从 Token 中获取）
     * @param createDTO 报名数据 { remark, emergencyContact, emergencyPhone, equipmentConfirm, healthConfirm }
     * @return 报名记录ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long registerActivity(Long activityId, Long userId, RegistrationCreateDTO createDTO) {
        // 1. 查询活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        
        // 2. 校验活动状态（只有已发布和进行中的活动可以报名）
        if (activity.getStatus() != STATUS_PUBLISHED && activity.getStatus() != STATUS_IN_PROGRESS) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_STARTED);
        }
        
        // 3. 检查活动是否已满员
        Integer maxParticipants = activity.getMaxParticipants() != null ? activity.getMaxParticipants() : 0;
        Integer currentParticipants = activity.getCurrentParticipants() != null ? activity.getCurrentParticipants() : 0;
        if (currentParticipants >= maxParticipants) {
            throw new BusinessException(ResultCode.ACTIVITY_FULL);
        }
        
        // 4. 检查用户是否重复报名
        LambdaQueryWrapper<Registration> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Registration::getUserId, userId)
               .eq(Registration::getActivityId, activityId);
        Registration existing = registrationMapper.selectOne(queryWrapper);
        if (existing != null) {
            throw new BusinessException(ResultCode.ALREADY_REGISTERED);
        }
        
        // 5. 检查报名截止时间
        if (activity.getRegistrationDeadline() != null 
            && activity.getRegistrationDeadline().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessException(ResultCode.REGISTRATION_DEADLINE_PASSED);
        }
        
        // 6. 校验难度等级要求（如果有装备要求）
        if (activity.getEquipmentRequirement() != null && !activity.getEquipmentRequirement().isBlank()) {
            if (createDTO.getEquipmentConfirm() == null || !createDTO.getEquipmentConfirm()) {
                throw new BusinessException(ResultCode.EQUIPMENT_REQUIRED);
            }
        }
        
        // 7. 校验健康状况要求（如果有）
        if (activity.getDifficultyLevel() >= 3) {
            if (createDTO.getHealthConfirm() == null || !createDTO.getHealthConfirm()) {
                throw new BusinessException(ResultCode.HEALTH_CONFIRM_REQUIRED);
            }
        }
        
        // 8. 创建报名记录
        Registration registration = new Registration();
        registration.setUserId(userId);
        registration.setActivityId(activityId);
        registration.setStatus(1); // 1=已通过（报名即生效，无需审核）
        registration.setQueueNumber(null);
        registration.setRemark(createDTO.getRemark());
        registration.setCreateTime(java.time.LocalDateTime.now());
        registration.setUpdateTime(java.time.LocalDateTime.now());

        // 9. 插入报名记录
        registrationMapper.insert(registration);
        
        // 10. 更新活动当前人数（需要在同一事务中）
        Activity updateActivity = new Activity();
        updateActivity.setId(activityId);
        updateActivity.setCurrentParticipants(currentParticipants + 1);
        activityMapper.updateById(updateActivity);
        
        log.info("用户 {} 报名参加活动 {} 成功", userId, activityId);
        
        return registration.getId();
    }

    /**
     * 转换为列表VO
     */
    private ActivityListVO convertToListVO(Activity activity) {
        // 查询组织者信息
        User organizer = userMapper.selectById(activity.getOrganizerId());
        String organizerNickname = organizer != null ? organizer.getNickname() : null;
        String organizerAvatar = organizer != null ? organizer.getAvatar() : null;
        
        // 查询路线信息
        Route route = routeMapper.selectById(activity.getRouteId());
        String routeName = route != null ? route.getName() : null;
        
        // 计算是否已报满
        Integer maxParticipants = activity.getMaxParticipants() != null ? activity.getMaxParticipants() : 0;
        Integer currentParticipants = activity.getCurrentParticipants() != null ? activity.getCurrentParticipants() : 0;
        Boolean isFull = currentParticipants >= maxParticipants;
        
        return ActivityListVO.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .coverImage(activity.getCoverImage())
                .description(activity.getDescription() != null && activity.getDescription().length() > 100 
                    ? activity.getDescription().substring(0, 100) + "..." 
                    : activity.getDescription())
                .organizerId(activity.getOrganizerId())
                .organizerNickname(organizerNickname)
                .organizerAvatar(organizerAvatar)
                .routeId(activity.getRouteId())
                .routeName(routeName)
                .activityDate(activity.getActivityDate())
                .startTime(activity.getStartTime() != null ? activity.getStartTime().toString() : null)
                .difficultyLevel(activity.getDifficultyLevel())
                .difficultyText(getDifficultyText(activity.getDifficultyLevel()))
                .fee(activity.getFee())
                .maxParticipants(maxParticipants)
                .currentParticipants(currentParticipants)
                .isFull(isFull)
                .registrationDeadline(activity.getRegistrationDeadline())
                .status(activity.getStatus())
                .statusText(getStatusText(activity.getStatus()))
                .viewCount(activity.getViewCount() != null ? activity.getViewCount() : 0)
                .createTime(activity.getCreateTime())
                .build();
    }

    /**
     * 转换为详情VO
     */
    private ActivityDetailVO convertToDetailVO(Activity activity, Long userId) {
        // 查询组织者信息
        User organizer = userMapper.selectById(activity.getOrganizerId());
        String organizerNickname = organizer != null ? organizer.getNickname() : null;
        String organizerAvatar = organizer != null ? organizer.getAvatar() : null;
        Integer organizerRole = organizer != null ? organizer.getRole() : null;
        
        // 查询路线信息
        Route route = routeMapper.selectById(activity.getRouteId());
        String routeName = route != null ? route.getName() : null;
        String routeDescription = route != null ? route.getDescription() : null;
        
        // 计算人数
        Integer maxParticipants = activity.getMaxParticipants() != null ? activity.getMaxParticipants() : 0;
        Integer currentParticipants = activity.getCurrentParticipants() != null ? activity.getCurrentParticipants() : 0;
        Integer remainingParticipants = maxParticipants - currentParticipants;
        Boolean isFull = currentParticipants >= maxParticipants;

        // 检查当前用户是否已报名
        Boolean isRegistered = false;
        if (userId != null) {
            LambdaQueryWrapper<Registration> registrationWrapper = new LambdaQueryWrapper<>();
            registrationWrapper.eq(Registration::getActivityId, activity.getId())
                               .eq(Registration::getUserId, userId)
                               .eq(Registration::getStatus, 1); // 1表示已通过
            Registration registration = registrationMapper.selectOne(registrationWrapper);
            isRegistered = registration != null;
        }
        
        // 查询审核人信息
        String auditorNickname = null;
        if (activity.getAuditBy() != null) {
            User auditor = userMapper.selectById(activity.getAuditBy());
            auditorNickname = auditor != null ? auditor.getNickname() : null;
        }
        
        return ActivityDetailVO.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .coverImage(activity.getCoverImage())
                .description(activity.getDescription())
                // 组织者信息
                .organizerId(activity.getOrganizerId())
                .organizerNickname(organizerNickname)
                .organizerAvatar(organizerAvatar)
                .organizerRole(organizerRole)
                // 路线信息
                .routeId(activity.getRouteId())
                .routeName(routeName)
                .routeDescription(routeDescription)
                .routeDifficultyLevel(route != null ? route.getDifficultyLevel() : null)
                .routeTotalDistance(route != null ? route.getTotalDistance() : null)
                .routeElevationGain(route != null ? route.getElevationGain() : null)
                .routeElevationLoss(route != null ? route.getElevationLoss() : null)
                .routeMaxElevation(route != null ? route.getMaxElevation() : null)
                .routeMinElevation(route != null ? route.getMinElevation() : null)
                .routeEstimatedHours(route != null ? route.getEstimatedHours() : null)
                .routeStartPointName(route != null ? route.getStartPointName() : null)
                .routeEndPointName(route != null ? route.getEndPointName() : null)
                .routeRegion(route != null ? route.getRegion() : null)
                // 活动时间
                .activityDate(activity.getActivityDate())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .durationHours(activity.getDurationHours())
                // 人数信息
                .maxParticipants(maxParticipants)
                .currentParticipants(currentParticipants)
                .remainingParticipants(remainingParticipants)
                .isFull(isFull)
                // 用户相关
                .isRegistered(isRegistered)
                // 报名
                .registrationDeadline(activity.getRegistrationDeadline())
                // 难度和费用
                .difficultyLevel(activity.getDifficultyLevel())
                .difficultyText(getDifficultyText(activity.getDifficultyLevel()))
                .fee(activity.getFee())
                .feeDescription(activity.getFeeDescription())
                // 参与要求
                .equipmentRequirement(activity.getEquipmentRequirement())
                .fitnessRequirement(activity.getFitnessRequirement())
                .ageMin(activity.getAgeMin())
                .ageMax(activity.getAgeMax())
                .experienceRequirement(activity.getExperienceRequirement())
                .experienceRequirementText(getExperienceRequirementText(activity.getExperienceRequirement()))
                // 状态
                .status(activity.getStatus())
                .statusText(getStatusText(activity.getStatus()))
                .rejectReason(activity.getRejectReason())
                .auditBy(activity.getAuditBy())
                .auditorNickname(auditorNickname)
                .auditTime(activity.getAuditTime())
                // 统计
                .viewCount(activity.getViewCount() != null ? activity.getViewCount() : 0)
                // 时间
                .createTime(activity.getCreateTime())
                .updateTime(activity.getUpdateTime())
                .build();
    }

    /**
     * 获取难度文本
     */
    private String getDifficultyText(Integer level) {
        if (level == null) return null;
        return switch (level) {
            case 1 -> "休闲";
            case 2 -> "简单";
            case 3 -> "中等";
            case 4 -> "困难";
            case 5 -> "极限";
            default -> "未知";
        };
    }

    /**
     * 获取状态文本
     */
    private String getStatusText(Integer status) {
        if (status == null) return null;
        return switch (status) {
            case 0 -> "草稿";
            case 1 -> "待审核";
            case 2 -> "已发布";
            case 3 -> "进行中";
            case 4 -> "已结束";
            case 5 -> "已取消";
            case 6 -> "已驳回";
            default -> "未知";
        };
    }

    /**
     * 获取经验要求文本
     */
    private String getExperienceRequirementText(Integer level) {
        if (level == null) return null;
        return switch (level) {
            case 0 -> "不限";
            case 1 -> "初级以上";
            case 2 -> "中级以上";
            case 3 -> "高级以上";
            default -> "未知";
        };
    }

    /**
     * 获取我发布的活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<ActivityListVO> getMyActivities(Long organizerId, ActivityQuery query) {
        // 1. 构建查询条件
        LambdaQueryWrapper<Activity> queryWrapper = new LambdaQueryWrapper<>();
        
        // 只查询当前用户发布的活动
        queryWrapper.eq(Activity::getOrganizerId, organizerId);
        
        // 关键词搜索（标题）
        if (query.getKeyword() != null && !query.getKeyword().isEmpty()) {
            queryWrapper.like(Activity::getTitle, query.getKeyword());
        }
        
        // 状态筛选
        if (query.getStatus() != null) {
            queryWrapper.eq(Activity::getStatus, query.getStatus());
        }
        
        // 按创建时间倒序
        queryWrapper.orderByDesc(Activity::getCreateTime);
        
        // 2. 分页查询
        int pageNum = query.getPageNum() != null ? query.getPageNum() : 1;
        int pageSize = query.getPageSize() != null ? query.getPageSize() : 10;
        Page<Activity> page = new Page<>(pageNum, pageSize);
        
        IPage<Activity> activityPage = activityMapper.selectPage(page, queryWrapper);
        
        // 3. 转换为VO
        return activityPage.convert(activity -> {
            ActivityListVO vo = new ActivityListVO();
            vo.setId(activity.getId());
            vo.setTitle(activity.getTitle());
            vo.setCoverImage(activity.getCoverImage());
            vo.setDescription(activity.getDescription());
            vo.setDifficultyLevel(activity.getDifficultyLevel());
            vo.setDifficultyText(getDifficultyText(activity.getDifficultyLevel()));
            vo.setActivityDate(activity.getActivityDate());
            vo.setStartTime(activity.getStartTime() != null ? activity.getStartTime().toString() : null);
            vo.setMaxParticipants(activity.getMaxParticipants());
            vo.setCurrentParticipants(activity.getCurrentParticipants());
            vo.setIsFull(activity.getCurrentParticipants() != null && 
                        activity.getMaxParticipants() != null &&
                        activity.getCurrentParticipants() >= activity.getMaxParticipants());
            vo.setRegistrationDeadline(activity.getRegistrationDeadline());
            vo.setFee(activity.getFee());
            vo.setStatus(activity.getStatus());
            vo.setStatusText(getStatusText(activity.getStatus()));
            vo.setViewCount(activity.getViewCount());
            vo.setCreateTime(activity.getCreateTime());
            vo.setRouteId(activity.getRouteId());
            
            // 获取组织者信息
            User organizer = userMapper.selectById(activity.getOrganizerId());
            if (organizer != null) {
                vo.setOrganizerId(organizer.getId());
                vo.setOrganizerNickname(organizer.getNickname() != null ? organizer.getNickname() : organizer.getUsername());
                vo.setOrganizerAvatar(organizer.getAvatar());
            }
            
            // 获取路线名称
            if (activity.getRouteId() != null) {
                Route route = routeMapper.selectById(activity.getRouteId());
                if (route != null) {
                    vo.setRouteName(route.getName());
                }
            }

            return vo;
        });
    }

    /**
     * 获取用户参与的活动列表
     * 查询用户报名且审核通过的活动
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<ActivityListVO> getJoinedActivities(Long userId, ActivityQuery query) {
        // 1. 查询用户报名且审核通过的活动ID（状态为1-已通过）
        LambdaQueryWrapper<Registration> regQueryWrapper = new LambdaQueryWrapper<>();
        regQueryWrapper.eq(Registration::getUserId, userId)
                .eq(Registration::getStatus, 1); // 只查询已通过报名的

        List<Registration> registrations = registrationMapper.selectList(regQueryWrapper);
        if (registrations.isEmpty()) {
            // 没有参与任何活动，返回空结果
            return new Page<>(query.getPageNum() != null ? query.getPageNum() : 1,
                              query.getPageSize() != null ? query.getPageSize() : 10);
        }

        List<Long> activityIds = registrations.stream()
                .map(Registration::getActivityId)
                .collect(Collectors.toList());

        // 2. 构建活动查询条件
        LambdaQueryWrapper<Activity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.in(Activity::getId, activityIds);

        // 关键词搜索（标题）
        if (query.getKeyword() != null && !query.getKeyword().isEmpty()) {
            queryWrapper.like(Activity::getTitle, query.getKeyword());
        }

        // 状态筛选
        if (query.getStatus() != null) {
            queryWrapper.eq(Activity::getStatus, query.getStatus());
        }

        // 按创建时间倒序
        queryWrapper.orderByDesc(Activity::getCreateTime);

        // 3. 分页查询
        int pageNum = query.getPageNum() != null ? query.getPageNum() : 1;
        int pageSize = query.getPageSize() != null ? query.getPageSize() : 10;
        Page<Activity> page = new Page<>(pageNum, pageSize);

        IPage<Activity> activityPage = activityMapper.selectPage(page, queryWrapper);

        // 4. 转换为VO
        return activityPage.convert(activity -> {
            ActivityListVO vo = new ActivityListVO();
            vo.setId(activity.getId());
            vo.setTitle(activity.getTitle());
            vo.setCoverImage(activity.getCoverImage());
            vo.setDescription(activity.getDescription());
            vo.setDifficultyLevel(activity.getDifficultyLevel());
            vo.setDifficultyText(getDifficultyText(activity.getDifficultyLevel()));
            vo.setActivityDate(activity.getActivityDate());
            vo.setStartTime(activity.getStartTime() != null ? activity.getStartTime().toString() : null);
            vo.setMaxParticipants(activity.getMaxParticipants());
            vo.setCurrentParticipants(activity.getCurrentParticipants());
            vo.setIsFull(activity.getCurrentParticipants() != null &&
                        activity.getMaxParticipants() != null &&
                        activity.getCurrentParticipants() >= activity.getMaxParticipants());
            vo.setRegistrationDeadline(activity.getRegistrationDeadline());
            vo.setFee(activity.getFee());
            vo.setStatus(activity.getStatus());
            vo.setStatusText(getStatusText(activity.getStatus()));
            vo.setViewCount(activity.getViewCount());
            vo.setCreateTime(activity.getCreateTime());
            vo.setRouteId(activity.getRouteId());

            // 获取组织者信息
            User organizer = userMapper.selectById(activity.getOrganizerId());
            if (organizer != null) {
                vo.setOrganizerId(organizer.getId());
                vo.setOrganizerNickname(organizer.getNickname() != null ? organizer.getNickname() : organizer.getUsername());
                vo.setOrganizerAvatar(organizer.getAvatar());
            }

            // 获取路线名称
            if (activity.getRouteId() != null) {
                Route route = routeMapper.selectById(activity.getRouteId());
                if (route != null) {
                    vo.setRouteName(route.getName());
                }
            }

            return vo;
        });
    }

    /**
     * 启动活动
     * 将活动状态从已发布变更为进行中
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startActivity(Long activityId, Long operatorId) {
        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 校验操作权限（组织者或管理员）
        validateActivityOperatePermission(activity, operatorId);

        // 3. 校验活动状态（只有已发布的活动才能启动）
        if (activity.getStatus() != STATUS_PUBLISHED) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(),
                "只有已发布的活动才能启动，当前状态：" + getStatusText(activity.getStatus()));
        }

        // 4. 可选：校验活动时间（确保在合理的时间范围内启动）
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime activityStart = LocalDateTime.of(activity.getActivityDate(), activity.getStartTime());
        LocalDateTime activityEnd = LocalDateTime.of(activity.getActivityDate(), activity.getEndTime());

        if (now.isAfter(activityEnd)) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "活动已过期，无法启动");
        }

        // 5. 更新活动状态为进行中
        activity.setStatus(STATUS_IN_PROGRESS);
        activityMapper.updateById(activity);

        log.info("活动启动成功，活动ID：{}，操作人ID：{}", activityId, operatorId);
    }

    /**
     * 结束活动
     * 将活动状态从进行中变更为已结束
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void endActivity(Long activityId, Long operatorId) {
        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 校验操作权限（组织者或管理员）
        validateActivityOperatePermission(activity, operatorId);

        // 3. 校验活动状态（只有进行中的活动才能结束）
        if (activity.getStatus() != STATUS_IN_PROGRESS) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(),
                "只有进行中的活动才能结束，当前状态：" + getStatusText(activity.getStatus()));
        }

        // 4. 更新活动状态为已结束
        activity.setStatus(STATUS_ENDED);
        activityMapper.updateById(activity);

        log.info("活动结束成功，活动ID：{}，操作人ID：{}", activityId, operatorId);
    }

    /**
     * 验证活动操作权限（组织者或管理员）
     */
    private void validateActivityOperatePermission(Activity activity, Long operatorId) {
        User operator = userMapper.selectById(operatorId);
        if (operator == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 检查是否为活动组织者
        boolean isOrganizer = activity.getOrganizerId().equals(operatorId);

        // 检查是否为管理员
        boolean isAdmin = operator.getRole() != null && operator.getRole() == 2;

        if (!isOrganizer && !isAdmin) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有活动组织者或管理员可以操作活动状态");
        }
    }
}

