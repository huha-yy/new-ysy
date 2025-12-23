package com.hiking.hikingbackend.module.registration.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.module.registration.dto.RegistrationAuditDTO;
import com.hiking.hikingbackend.module.registration.dto.RegistrationCreateDTO;
import com.hiking.hikingbackend.module.registration.dto.RegistrationQuery;
import com.hiking.hikingbackend.module.registration.vo.RegistrationVO;

/**
 * 报名服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface RegistrationService {

    /**
     * 提交报名
     *
     * @param userId 用户ID
     * @param createDTO 报名信息
     * @return 报名ID
     */
    Long submitRegistration(Long userId, RegistrationCreateDTO createDTO);

    /**
     * 审核报名（组织者）
     *
     * @param organizerId 组织者用户ID
     * @param auditDTO 审核信息
     */
    void auditRegistration(Long organizerId, RegistrationAuditDTO auditDTO);

    /**
     * 取消报名（参与者）
     *
     * @param userId 用户ID
     * @param registrationId 报名ID
     */
    void cancelRegistration(Long userId, Long registrationId);

    /**
     * 报名列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<RegistrationVO> getRegistrationList(RegistrationQuery query);

    /**
     * 获取我的报名记录
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<RegistrationVO> getMyRegistrations(Long userId, RegistrationQuery query);
}

