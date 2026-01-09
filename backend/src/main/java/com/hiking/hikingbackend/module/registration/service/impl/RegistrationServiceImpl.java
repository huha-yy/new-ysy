package com.hiking.hikingbackend.module.registration.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import com.hiking.hikingbackend.module.activity.mapper.ActivityMapper;
import com.hiking.hikingbackend.module.registration.dto.RegistrationAuditDTO;
import com.hiking.hikingbackend.module.registration.dto.RegistrationCreateDTO;
import com.hiking.hikingbackend.module.registration.dto.RegistrationQuery;
import com.hiking.hikingbackend.module.registration.entity.Registration;
import com.hiking.hikingbackend.module.registration.mapper.RegistrationMapper;
import com.hiking.hikingbackend.module.registration.service.RegistrationService;
import com.hiking.hikingbackend.module.registration.vo.RegistrationVO;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 报名服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationMapper registrationMapper;

    private final ActivityMapper activityMapper;

    private final UserMapper userMapper;

    private static final int STATUS_PENDING = 0;   // 待审核
    private static final int STATUS_APPROVED = 1;  // 已通过
    private static final int STATUS_REJECTED = 2;  // 已拒绝
    private static final int STATUS_WAITING = 3;  // 候补中
    private static final int STATUS_CANCELLED = 4; // 已取消
    private static final int STATUS_ABSENT = 5;    // 已缺席

    private static final int ACTIVITY_STATUS_PUBLISHED = 2; // 活动已发布
    private static final int ACTIVITY_STATUS_IN_PROGRESS = 3; // 活动进行中

    /**
     * 提交报名
     *
     * @param userId 用户ID
     * @param createDTO 报名信息
     * @return 报名ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long submitRegistration(Long userId, RegistrationCreateDTO createDTO) {
        // 1. 校验用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 校验活动是否存在且状态为已发布或进行中
        Activity activity = activityMapper.selectById(createDTO.getActivityId());
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        if (activity.getStatus() != ACTIVITY_STATUS_PUBLISHED && activity.getStatus() != ACTIVITY_STATUS_IN_PROGRESS) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_STARTED);
        }

        // 3. 校验报名截止时间
        if (activity.getRegistrationDeadline() != null && 
            activity.getRegistrationDeadline().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ResultCode.ACTIVITY_REGISTRATION_CLOSED);
        }

        // 4. 校验是否已报名过（不可重复报名）
        LambdaQueryWrapper<Registration> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Registration::getUserId, userId)
                   .eq(Registration::getActivityId, createDTO.getActivityId())
                   .in(Registration::getStatus, STATUS_PENDING, STATUS_APPROVED, STATUS_WAITING);
        Registration existingRegistration = registrationMapper.selectOne(queryWrapper);
        if (existingRegistration != null) {
            throw new BusinessException(ResultCode.ALREADY_REGISTERED);
        }

        // 5. 删除旧的报名记录（已拒绝、已取消、已缺席状态的记录可以重新报名）
        LambdaQueryWrapper<Registration> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(Registration::getUserId, userId)
                   .eq(Registration::getActivityId, createDTO.getActivityId())
                   .in(Registration::getStatus, STATUS_REJECTED, STATUS_CANCELLED, STATUS_ABSENT);
        registrationMapper.delete(deleteWrapper);

        // 6. 校验活动容量
        Integer currentParticipants = activity.getCurrentParticipants() != null ? activity.getCurrentParticipants() : 0;
        Integer maxParticipants = activity.getMaxParticipants() != null ? activity.getMaxParticipants() : 0;

        Registration registration;
        
        if (currentParticipants >= maxParticipants) {
            // 已满，设置为候补
            LambdaQueryWrapper<Registration> maxQueryWrapper = new LambdaQueryWrapper<>();
            maxQueryWrapper.eq(Registration::getActivityId, createDTO.getActivityId())
                       .eq(Registration::getStatus, STATUS_WAITING)
                       .orderByAsc(Registration::getQueueNumber);
            Registration lastWaiting = registrationMapper.selectOne(maxQueryWrapper);
            Integer queueNumber = lastWaiting != null ? lastWaiting.getQueueNumber() + 1 : 1;

            registration = Registration.builder()
                    .userId(userId)
                    .activityId(createDTO.getActivityId())
                    .status(STATUS_WAITING)
                    .queueNumber(queueNumber)
                    .remark(createDTO.getRemark())
                    .build();

            registrationMapper.insert(registration);
            log.info("报名成功（候补），用户ID：{}，活动ID：{}，排队序号：{}", userId, createDTO.getActivityId(), queueNumber);
        } else {
            // 未满，设置为待审核
            registration = Registration.builder()
                    .userId(userId)
                    .activityId(createDTO.getActivityId())
                    .status(STATUS_PENDING)
                    .queueNumber(0)
                    .remark(createDTO.getRemark())
                    .build();

            registrationMapper.insert(registration);
            log.info("报名成功（待审核），用户ID：{}，活动ID：{}", userId, createDTO.getActivityId());
        }

        return registration.getId();
    }

    /**
     * 审核报名（组织者或管理员）
     *
     * @param operatorId 操作者用户ID（组织者或管理员）
     * @param auditDTO 审核信息
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void auditRegistration(Long operatorId, RegistrationAuditDTO auditDTO) {
        // 1. 查询报名记录
        Registration registration = registrationMapper.selectById(auditDTO.getRegistrationId());
        if (registration == null) {
            throw new BusinessException(ResultCode.REGISTRATION_NOT_FOUND);
        }

        // 2. 查询活动信息
        Activity activity = activityMapper.selectById(registration.getActivityId());
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 3. 校验权限（必须是活动组织者或管理员）
        User operator = userMapper.selectById(operatorId);
        boolean isOrganizer = activity.getOrganizerId().equals(operatorId);
        boolean isAdmin = operator != null && operator.getRole() == 2;
        if (!isOrganizer && !isAdmin) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }

        // 4. 校验状态（只有待审核和候补中可审核）
        if (registration.getStatus() != STATUS_PENDING && registration.getStatus() != STATUS_WAITING) {
            throw new BusinessException(ResultCode.REGISTRATION_ALREADY_AUDITED);
        }

        // 5. 更新报名状态
        if (auditDTO.getApproved()) {
            // 通过：状态改为已通过
            if (registration.getStatus() == STATUS_PENDING) {
                // 待审核通过，增加活动当前人数
                Integer currentParticipants = activity.getCurrentParticipants() != null ? activity.getCurrentParticipants() : 0;
                activity.setCurrentParticipants(currentParticipants + 1);
                activityMapper.updateById(activity);
                log.info("审核通过，活动当前人数：{}", currentParticipants + 1);
            }

            registration.setStatus(STATUS_APPROVED);
            registration.setRejectReason(null);
            log.info("审核通过，报名ID：{}", auditDTO.getRegistrationId());
        } else {
            // 拒绝：状态改为已拒绝，记录拒绝原因
            registration.setStatus(STATUS_REJECTED);
            registration.setRejectReason(auditDTO.getRejectReason());
            log.info("审核拒绝，报名ID：{}，原因：{}", auditDTO.getRegistrationId(), auditDTO.getRejectReason());
        }

        // 6. 记录审核信息
        registration.setAuditBy(operatorId);
        registration.setAuditTime(LocalDateTime.now());

        registrationMapper.updateById(registration);
    }

    /**
     * 取消报名（参与者）
     *
     * @param userId 用户ID
     * @param registrationId 报名ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelRegistration(Long userId, Long registrationId) {
        // 1. 查询报名记录
        Registration registration = registrationMapper.selectById(registrationId);
        if (registration == null) {
            throw new BusinessException(ResultCode.REGISTRATION_NOT_FOUND);
        }

        // 2. 校验权限（必须是报名者本人）
        if (!registration.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }

        // 3. 校验状态（只有待审核、已通过和候补中可取消）
        int originalStatus = registration.getStatus();
        if (originalStatus != STATUS_PENDING && originalStatus != STATUS_APPROVED && originalStatus != STATUS_WAITING) {
            throw new BusinessException(ResultCode.CANNOT_CANCEL_REGISTRATION);
        }

        // 4. 查询活动信息
        Activity activity = activityMapper.selectById(registration.getActivityId());
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 5. 如果原状态为已通过，减少活动当前人数
        if (originalStatus == STATUS_APPROVED) {
            Integer currentParticipants = activity.getCurrentParticipants() != null ? activity.getCurrentParticipants() : 0;
            activity.setCurrentParticipants(Math.max(0, currentParticipants - 1));
            activityMapper.updateById(activity);
            log.info("取消报名（已通过），活动当前人数：{}", currentParticipants - 1);
        }

        // 6. 更新报名状态
        registration.setStatus(STATUS_CANCELLED);
        registration.setCancelTime(LocalDateTime.now());
        registration.setCancelReason(null);

        registrationMapper.updateById(registration);
        log.info("取消报名成功，报名ID：{}，用户ID：{}", registrationId, userId);
    }

    /**
     * 报名列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<RegistrationVO> getRegistrationList(RegistrationQuery query) {
        // 1. 构建查询条件
        LambdaQueryWrapper<Registration> queryWrapper = new LambdaQueryWrapper<>();
        
        // 按活动ID查询
        if (query.getActivityId() != null) {
            queryWrapper.eq(Registration::getActivityId, query.getActivityId());
        }
        
        // 按用户ID查询
        if (query.getUserId() != null) {
            queryWrapper.eq(Registration::getUserId, query.getUserId());
        }
        
        // 按状态筛选
        if (query.getStatus() != null) {
            queryWrapper.eq(Registration::getStatus, query.getStatus());
        }
        
        // 按报名时间倒序
        queryWrapper.orderByDesc(Registration::getCreateTime);
        
        // 2. 分页查询
        Page<Registration> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<Registration> registrationPage = registrationMapper.selectPage(page, queryWrapper);
        
        // 3. 转换为VO
        return registrationPage.convert(this::convertToVO);
    }

    /**
     * 获取我的报名记录
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<RegistrationVO> getMyRegistrations(Long userId, RegistrationQuery query) {
        // 1. 构建查询条件（强制查询当前用户的报名）
        LambdaQueryWrapper<Registration> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Registration::getUserId, userId);
        
        // 按状态筛选
        if (query.getStatus() != null) {
            queryWrapper.eq(Registration::getStatus, query.getStatus());
        }
        
        // 按报名时间倒序
        queryWrapper.orderByDesc(Registration::getCreateTime);
        
        // 2. 分页查询
        Page<Registration> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<Registration> registrationPage = registrationMapper.selectPage(page, queryWrapper);
        
        // 3. 转换为VO
        return registrationPage.convert(this::convertToVO);
    }

    /**
     * 转换为VO
     */
    private RegistrationVO convertToVO(Registration registration) {
        // 查询用户信息
        User user = userMapper.selectById(registration.getUserId());
        String userNickname = user != null ? user.getNickname() : null;
        String userAvatar = user != null ? user.getAvatar() : null;
        String phone = user != null ? user.getPhone() : null;
        String email = user != null ? user.getEmail() : null;

        // 查询活动信息
        Activity activityInfo = activityMapper.selectById(registration.getActivityId());
        String activityTitle = activityInfo != null ? activityInfo.getTitle() : null;
        String activityCoverImage = activityInfo != null ? activityInfo.getCoverImage() : null;

        // 查询审核人信息
        String auditorNickname = null;
        if (registration.getAuditBy() != null) {
            User auditor = userMapper.selectById(registration.getAuditBy());
            auditorNickname = auditor != null ? auditor.getNickname() : null;
        }

        return RegistrationVO.builder()
                .id(registration.getId())
                .userId(registration.getUserId())
                .userNickname(userNickname)
                .userAvatar(userAvatar)
                .phone(phone)
                .email(email)
                .activityId(registration.getActivityId())
                .activityTitle(activityTitle)
                .activityCoverImage(activityCoverImage)
                .activityDate(activityInfo != null ? activityInfo.getActivityDate().toString() : null)
                .status(registration.getStatus())
                .statusText(getStatusText(registration.getStatus()))
                .queueNumber(registration.getQueueNumber())
                .remark(registration.getRemark())
                .rejectReason(registration.getRejectReason())
                .auditorNickname(auditorNickname)
                .auditTime(registration.getAuditTime())
                .cancelTime(registration.getCancelTime())
                .cancelReason(registration.getCancelReason())
                .createTime(registration.getCreateTime())
                .updateTime(registration.getUpdateTime())
                .build();
    }

    /**
     * 获取状态文本
     */
    private String getStatusText(Integer status) {
        if (status == null) return null;
        return switch (status) {
            case 0 -> "待审核";
            case 1 -> "已通过";
            case 2 -> "已拒绝";
            case 3 -> "候补中";
            case 4 -> "已取消";
            default -> "未知";
        };
    }
}
