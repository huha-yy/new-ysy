package com.hiking.hikingbackend.module.admin.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import com.hiking.hikingbackend.module.admin.dto.ActivityAuditQuery;
import com.hiking.hikingbackend.module.admin.dto.UserListQuery;
import com.hiking.hikingbackend.module.admin.vo.ActivityAuditVO;
import com.hiking.hikingbackend.module.admin.vo.DashboardVO;
import com.hiking.hikingbackend.module.admin.vo.UserListVO;
import com.hiking.hikingbackend.module.admin.vo.UserManageVO;
import com.hiking.hikingbackend.module.admin.vo.UserStatsVO;
import com.hiking.hikingbackend.module.user.entity.User;

/**
 * 管理员服务接口
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
public interface AdminService {
    
    /**
     * 获取Dashboard统计数据
     * 
     * @return Dashboard统计数据
     */
    DashboardVO getDashboard();
    
    /**
     * 分页查询用户列表
     * 
     * @param query 查询条件
     * @return 用户列表分页结果
     */
    IPage<UserListVO> getUserList(UserListQuery query);
    
    /**
     * 更新用户状态（启用/禁用）
     *
     * @param userId 用户ID
     * @param status 状态：0禁用 1正常
     * @param operatorId 操作人ID
     */
    void updateUserStatus(Long userId, Integer status, Long operatorId);

    /**
     * 更新用户角色
     *
     * @param userId 用户ID
     * @param role 角色：0普通用户 1组织者 2管理员
     * @param operatorId 操作人ID
     */
    void updateUserRole(Long userId, Integer role, Long operatorId);

    /**
     * 分页查询待审核活动列表
     * 
     * @param query 查询条件
     * @return 待审核活动列表分页结果
     */
    IPage<ActivityAuditVO> getPendingActivities(ActivityAuditQuery query);
    
    /**
     * 分页查询所有活动列表（管理员视角）
     * 
     * @param query 查询条件
     * @return 活动列表分页结果
     */
    IPage<ActivityAuditVO> getAllActivities(ActivityAuditQuery query);
    
    /**
     * 获取用户详情（管理员视角）
     * 
     * @param userId 用户ID
     * @return 用户详情
     */
    UserManageVO getUserDetail(Long userId);
    
    /**
     * 获取用户统计信息
     * 
     * @return 用户统计信息
     */
    UserStatsVO getUserStats();
}

