package com.hiking.hikingbackend.module.activity.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.module.activity.dto.ActivityAuditDTO;
import com.hiking.hikingbackend.module.activity.dto.ActivityCreateDTO;
import com.hiking.hikingbackend.module.activity.dto.ActivityQuery;
import com.hiking.hikingbackend.module.activity.dto.ActivityUpdateDTO;
import com.hiking.hikingbackend.module.activity.dto.RegistrationCreateDTO;
import com.hiking.hikingbackend.module.activity.vo.ActivityDetailVO;
import com.hiking.hikingbackend.module.activity.vo.ActivityListVO;

/**
 * 活动服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface ActivityService {

    /**
     * 活动列表（分页查询）
     *
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<ActivityListVO> getActivityList(ActivityQuery query);

    /**
     * 活动详情
     *
     * @param activityId 活动ID
     * @param userId 当前用户ID（可选，用于判断是否可报名）
     * @return 活动详情
     */
    ActivityDetailVO getActivityDetail(Long activityId, Long userId);

    /**
     * 创建活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param createDTO 创建信息
     * @return 活动ID
     */
    Long createActivity(Long organizerId, ActivityCreateDTO createDTO);

    /**
     * 更新活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     * @param updateDTO 更新信息
     */
    void updateActivity(Long organizerId, Long activityId, ActivityUpdateDTO updateDTO);

    /**
     * 提交审核（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     */
    void submitForAudit(Long organizerId, Long activityId);

    /**
     * 审核活动（管理员）
     *
     * @param auditorId 审核人用户ID
     * @param auditDTO 审核信息
     */
    void auditActivity(Long auditorId, ActivityAuditDTO auditDTO);

    /**
     * 删除活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     */
    void deleteActivity(Long organizerId, Long activityId);

    /**
     * 取消活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param activityId 活动ID
     */
    void cancelActivity(Long organizerId, Long activityId);

    /**
     * 报名活动
     *
     * @param activityId 活动ID
     * @param userId 用户ID
     * @param createDTO 报名数据
     * @return 报名记录ID
     */
    Long registerActivity(Long activityId, Long userId, RegistrationCreateDTO createDTO);

    /**
     * 获取我发布的活动（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<ActivityListVO> getMyActivities(Long organizerId, ActivityQuery query);

    /**
     * 获取我参与的活动（用户）
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<ActivityListVO> getJoinedActivities(Long userId, ActivityQuery query);
}

