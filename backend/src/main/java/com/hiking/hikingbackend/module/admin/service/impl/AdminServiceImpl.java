package com.hiking.hikingbackend.module.admin.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.module.activity.mapper.ActivityMapper;
import com.hiking.hikingbackend.module.admin.dto.ActivityAuditQuery;
import com.hiking.hikingbackend.module.admin.dto.UserListQuery;
import com.hiking.hikingbackend.module.admin.mapper.AdminMapper;
import com.hiking.hikingbackend.module.admin.service.AdminService;
import com.hiking.hikingbackend.module.admin.vo.ActivityAuditVO;
import com.hiking.hikingbackend.module.admin.vo.DashboardVO;
import com.hiking.hikingbackend.module.admin.vo.UserListVO;
import com.hiking.hikingbackend.module.admin.vo.UserManageVO;
import com.hiking.hikingbackend.module.admin.vo.UserStatsVO;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 管理员服务实现
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    
    private final AdminMapper adminMapper;
    private final UserMapper userMapper;
    private final ActivityMapper activityMapper;
    
    @Override
    public DashboardVO getDashboard() {
        // 获取基础统计数据
        DashboardVO dashboardVO = adminMapper.getDashboard();
        
        // 查询待审核活动列表（前5条）
        ActivityAuditQuery auditQuery = new ActivityAuditQuery();
        auditQuery.setPageNum(1);
        auditQuery.setPageSize(5);
        Page<ActivityAuditVO> pendingPage = new Page<>(auditQuery.getPageNum(), auditQuery.getPageSize());
        IPage<ActivityAuditVO> pendingActivities = adminMapper.getPendingActivities(pendingPage, auditQuery);
        
        // 转换为Dashboard需要的格式（待审核活动）
        List<DashboardVO.ActivitySimpleVO> pendingVOs = pendingActivities.getRecords().stream()
            .map(activity -> DashboardVO.ActivitySimpleVO.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .organizerName(activity.getOrganizerName())
                .status(activity.getStatus())
                .maxParticipants(activity.getMaxParticipants())
                .currentParticipants(activity.getCurrentParticipants())
                .createTime(activity.getCreateTime())
                .startTime(activity.getStartTimeCombined())
                .build())
            .toList();
        dashboardVO.setPendingActivities(pendingVOs);
        
        // 查询最近活动列表（前5条，按create_time倒序）
        ActivityAuditQuery recentQuery = new ActivityAuditQuery();
        recentQuery.setPageNum(1);
        recentQuery.setPageSize(5);
        Page<ActivityAuditVO> recentPage = new Page<>(recentQuery.getPageNum(), recentQuery.getPageSize());
        IPage<ActivityAuditVO> recentActivities = adminMapper.getAllActivities(recentPage, recentQuery);
        
        // 转换为Dashboard需要的格式（最近活动）
        List<DashboardVO.ActivitySimpleVO> recentVOs = recentActivities.getRecords().stream()
            .map(activity -> DashboardVO.ActivitySimpleVO.builder()
                .id(activity.getId())
                .title(activity.getTitle())
                .organizerName(activity.getOrganizerName())
                .status(activity.getStatus())
                .maxParticipants(activity.getMaxParticipants())
                .currentParticipants(activity.getCurrentParticipants())
                .createTime(activity.getCreateTime())
                .startTime(activity.getStartTimeCombined())
                .build())
            .toList();
        dashboardVO.setRecentActivities(recentVOs);
        
        return dashboardVO;
    }
    
    @Override
    public IPage<UserListVO> getUserList(UserListQuery query) {
        Page<UserListVO> page = new Page<>(query.getPageNum(), query.getPageSize());
        return adminMapper.getUserList(page, query);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUserStatus(Long userId, Integer status, Long operatorId) {
        // 查询用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 管理员不能被禁用
        if (user.getRole() == 2 && status == 0) {
            throw new BusinessException("管理员账号不能被禁用");
        }
        
        // 不能禁用自己
        if (userId.equals(operatorId)) {
            throw new BusinessException("不能禁用自己");
        }
        
        // 状态值校验
        if (status != 0 && status != 1) {
            throw new BusinessException("状态值无效");
        }
        
        // 更新用户状态
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userId)
            .set(User::getStatus, status)
            .set(User::getUpdateBy, operatorId);
        
        int rows = userMapper.update(null, updateWrapper);
        if (rows == 0) {
            throw new BusinessException("状态更新失败");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUserRole(Long userId, Integer role, Long operatorId) {
        // 查询用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 不能修改自己的角色
        if (userId.equals(operatorId)) {
            throw new BusinessException("不能修改自己的角色");
        }

        // 角色值校验
        if (role < 0 || role > 2) {
            throw new BusinessException("角色值无效");
        }

        // 更新用户角色
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userId)
            .set(User::getRole, role)
            .set(User::getUpdateBy, operatorId);

        int rows = userMapper.update(null, updateWrapper);
        if (rows == 0) {
            throw new BusinessException("角色更新失败");
        }
    }

    @Override
    public IPage<ActivityAuditVO> getPendingActivities(ActivityAuditQuery query) {
        Page<ActivityAuditVO> page = new Page<>(query.getPageNum(), query.getPageSize());
        return adminMapper.getPendingActivities(page, query);
    }
    
    @Override
    public IPage<ActivityAuditVO> getAllActivities(ActivityAuditQuery query) {
        Page<ActivityAuditVO> page = new Page<>(query.getPageNum(), query.getPageSize());
        return adminMapper.getAllActivities(page, query);
    }
    
    @Override
    public UserManageVO getUserDetail(Long userId) {
        // 查询用户
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 查询用户列表（含统计数据）
        UserListQuery query = new UserListQuery();
        query.setPageNum(1);
        query.setPageSize(1);
        Page<UserListVO> page = new Page<>(1, 1);
        IPage<UserListVO> userVOPage = adminMapper.getUserList(page, query);
        
        UserListVO userListVO = userVOPage.getRecords().stream().findFirst().orElse(null);
        if (userListVO == null) {
            throw new BusinessException("用户数据异常");
        }
        
        // 转换为UserManageVO
        return UserManageVO.builder()
            .id(userListVO.getId())
            .username(userListVO.getUsername())
            .nickname(userListVO.getNickname())
            .avatar(userListVO.getAvatar())
            .phone(userListVO.getPhone())
            .email(userListVO.getEmail())
            .role(userListVO.getRole())
            .status(userListVO.getStatus())
            .activityCount(userListVO.getActivityCount())
            .registrationCount(userListVO.getRegistrationCount())
            .lastLoginTime(userListVO.getLastLoginTime())
            .createTime(userListVO.getCreateTime())
            .updateTime(user.getUpdateTime())
            .build();
    }
    
    @Override
    public UserStatsVO getUserStats() {
        return adminMapper.getUserStats();
    }
}

