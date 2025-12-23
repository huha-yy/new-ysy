package com.hiking.hikingbackend.module.activity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.module.activity.dto.GatheringPlanDTO;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import com.hiking.hikingbackend.module.activity.entity.GatheringPlan;
import com.hiking.hikingbackend.module.activity.mapper.ActivityMapper;
import com.hiking.hikingbackend.module.activity.mapper.GatheringPlanMapper;
import com.hiking.hikingbackend.module.activity.service.GatheringPlanService;
import com.hiking.hikingbackend.module.activity.vo.GatheringPlanVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 集合方案服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GatheringPlanServiceImpl implements GatheringPlanService {

    private final GatheringPlanMapper gatheringPlanMapper;

    private final ActivityMapper activityMapper;

    private static final int PUBLISHED = 1; // 已发布
    private static final int NOT_PUBLISHED = 0; // 未发布

    /**
     * 创建集合方案（组织者）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @param planDTO 集合方案信息
     * @return 集合方案ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createGatheringPlan(Long organizerId, Long activityId, GatheringPlanDTO planDTO) {
        log.info("创建集合方案，组织者ID：{}，活动ID：{}", organizerId, activityId);

        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 校验权限（必须是活动组织者）
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }

        // 3. 校验是否已存在集合方案（一个活动只能有一个集合方案）
        LambdaQueryWrapper<GatheringPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(GatheringPlan::getActivityId, activityId);
        GatheringPlan existingPlan = gatheringPlanMapper.selectOne(queryWrapper);
        if (existingPlan != null) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "该活动已存在集合方案，请使用更新接口");
        }

        // 4. 创建集合方案
        GatheringPlan gatheringPlan = GatheringPlan.builder()
                .activityId(activityId)
                .gatheringTime(planDTO.getGatheringTime())
                .gatheringAddress(planDTO.getGatheringAddress())
                .gatheringLatitude(planDTO.getGatheringLatitude())
                .gatheringLongitude(planDTO.getGatheringLongitude())
                .transportGuide(planDTO.getTransportGuide())
                .itemsToBring(planDTO.getItemsToBring())
                .notice(planDTO.getNotice())
                .organizerPhone(planDTO.getOrganizerPhone())
                .isPublished(NOT_PUBLISHED)
                .publishTime(null)
                .build();

        gatheringPlanMapper.insert(gatheringPlan);
        log.info("集合方案创建成功，方案ID：{}", gatheringPlan.getId());

        return gatheringPlan.getId();
    }

    /**
     * 更新集合方案（组织者）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     * @param planDTO 集合方案信息
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateGatheringPlan(Long organizerId, Long activityId, GatheringPlanDTO planDTO) {
        log.info("更新集合方案，组织者ID：{}，活动ID：{}", organizerId, activityId);

        // 1. 查询现有集合方案
        LambdaQueryWrapper<GatheringPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(GatheringPlan::getActivityId, activityId);
        GatheringPlan gatheringPlan = gatheringPlanMapper.selectOne(queryWrapper);
        if (gatheringPlan == null) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "集合方案不存在，请先创建");
        }

        // 2. 校验活动组织者权限
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }

        // 3. 校验：已发布的集合方案不能修改
        if (gatheringPlan.getIsPublished() == PUBLISHED) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "已发布的集合方案不能修改");
        }

        // 4. 更新集合方案
        gatheringPlan.setGatheringTime(planDTO.getGatheringTime());
        gatheringPlan.setGatheringAddress(planDTO.getGatheringAddress());
        gatheringPlan.setGatheringLatitude(planDTO.getGatheringLatitude());
        gatheringPlan.setGatheringLongitude(planDTO.getGatheringLongitude());
        gatheringPlan.setTransportGuide(planDTO.getTransportGuide());
        gatheringPlan.setItemsToBring(planDTO.getItemsToBring());
        gatheringPlan.setNotice(planDTO.getNotice());
        gatheringPlan.setOrganizerPhone(planDTO.getOrganizerPhone());

        gatheringPlanMapper.updateById(gatheringPlan);
        log.info("集合方案更新成功，方案ID：{}", gatheringPlan.getId());
    }

    /**
     * 发布集合方案（组织者，向参与者发送通知）
     *
     * @param organizerId 组织者ID
     * @param activityId 活动ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void publishGatheringPlan(Long organizerId, Long activityId) {
        log.info("发布集合方案，组织者ID：{}，活动ID：{}", organizerId, activityId);

        // 1. 查询集合方案
        LambdaQueryWrapper<GatheringPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(GatheringPlan::getActivityId, activityId);
        GatheringPlan gatheringPlan = gatheringPlanMapper.selectOne(queryWrapper);
        if (gatheringPlan == null) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "集合方案不存在");
        }

        // 2. 校验活动组织者权限
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new BusinessException(ResultCode.NOT_ACTIVITY_ORGANIZER);
        }

        // 3. 校验：已发布的方案不能重复发布
        if (gatheringPlan.getIsPublished() == PUBLISHED) {
            throw new BusinessException(ResultCode.OPERATION_FAILED.getCode(), "集合方案已发布，请勿重复发布");
        }

        // 4. 更新为已发布状态
        gatheringPlan.setIsPublished(PUBLISHED);
        gatheringPlan.setPublishTime(LocalDateTime.now());
        gatheringPlanMapper.updateById(gatheringPlan);

        log.info("集合方案发布成功，方案ID：{}，发布时间：{}", gatheringPlan.getId(), gatheringPlan.getPublishTime());

        // 5. TODO: 向参与者发送通知（此处需要实现消息通知功能）
        // 可以调用消息服务，向所有已报名的参与者发送集合方案发布通知
        log.info("TODO: 向参与者发送集合方案发布通知");
    }

    /**
     * 获取集合方案（参与者查看）
     *
     * @param activityId 活动ID
     * @return 集合方案
     */
    @Override
    public GatheringPlanVO getGatheringPlan(Long activityId) {
        log.info("获取集合方案，活动ID：{}", activityId);

        // 1. 校验活动是否存在
        Activity activity = activityMapper.selectById(activityId);
        if (activity == null) {
            throw new BusinessException(ResultCode.ACTIVITY_NOT_FOUND);
        }

        // 2. 查询集合方案
        LambdaQueryWrapper<GatheringPlan> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(GatheringPlan::getActivityId, activityId);
        GatheringPlan gatheringPlan = gatheringPlanMapper.selectOne(queryWrapper);

        if (gatheringPlan == null) {
            // 如果集合方案不存在，返回null或空VO
            return null;
        }

        // 3. 转换为VO
        return convertToVO(gatheringPlan);
    }

    /**
     * 转换为VO
     */
    private GatheringPlanVO convertToVO(GatheringPlan gatheringPlan) {
        return GatheringPlanVO.builder()
                .id(gatheringPlan.getId())
                .activityId(gatheringPlan.getActivityId())
                .gatheringTime(gatheringPlan.getGatheringTime())
                .gatheringAddress(gatheringPlan.getGatheringAddress())
                .gatheringLatitude(gatheringPlan.getGatheringLatitude())
                .gatheringLongitude(gatheringPlan.getGatheringLongitude())
                .transportGuide(gatheringPlan.getTransportGuide())
                .itemsToBring(gatheringPlan.getItemsToBring())
                .notice(gatheringPlan.getNotice())
                .organizerPhone(gatheringPlan.getOrganizerPhone())
                .isPublished(gatheringPlan.getIsPublished())
                .isPublishedText(gatheringPlan.getIsPublished() == PUBLISHED ? "已发布" : "未发布")
                .publishTime(gatheringPlan.getPublishTime())
                .createTime(gatheringPlan.getCreateTime())
                .updateTime(gatheringPlan.getUpdateTime())
                .build();
    }
}

