package com.hiking.hikingbackend.module.admin.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.module.admin.dto.ActivityAuditQuery;
import com.hiking.hikingbackend.module.admin.dto.UserListQuery;
import com.hiking.hikingbackend.module.admin.vo.ActivityAuditVO;
import com.hiking.hikingbackend.module.admin.vo.DashboardVO;
import com.hiking.hikingbackend.module.admin.vo.UserListVO;
import com.hiking.hikingbackend.module.admin.vo.UserStatsVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 管理员Mapper
 * 使用自定义SQL处理复杂查询
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Mapper
public interface AdminMapper {
    
    /**
     * 获取Dashboard统计数据
     * 
     * @return Dashboard统计数据
     */
    DashboardVO getDashboard();
    
    /**
     * 分页查询用户列表（含统计数据）
     * 
     * @param page 分页对象
     * @param query 查询条件
     * @return 用户列表分页结果
     */
    IPage<UserListVO> getUserList(Page<UserListVO> page, @Param("query") UserListQuery query);
    
    /**
     * 分页查询待审核活动列表
     * 
     * @param page 分页对象
     * @param query 查询条件
     * @return 待审核活动列表分页结果
     */
    IPage<ActivityAuditVO> getPendingActivities(Page<ActivityAuditVO> page, @Param("query") ActivityAuditQuery query);
    
    /**
     * 分页查询所有活动列表（管理员视角）
     * 
     * @param page 分页对象
     * @param query 查询条件
     * @return 活动列表分页结果
     */
    IPage<ActivityAuditVO> getAllActivities(Page<ActivityAuditVO> page, @Param("query") ActivityAuditQuery query);
    
    /**
     * 获取用户统计信息
     * 
     * @return 用户统计信息
     */
    UserStatsVO getUserStats();
}

