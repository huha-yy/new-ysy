package com.hiking.hikingbackend.module.route.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.module.route.dto.CheckpointCreateDTO;
import com.hiking.hikingbackend.module.route.dto.RouteCreateDTO;
import com.hiking.hikingbackend.module.route.dto.RouteQuery;
import com.hiking.hikingbackend.module.route.vo.RouteVO;

/**
 * 路线服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface RouteService {

    /**
     * 创建路线（组织者）
     *
     * @param userId 用户ID
     * @param createDTO 创建信息
     * @return 路线ID
     */
    Long createRoute(Long userId, RouteCreateDTO createDTO);

    /**
     * 路线列表（公开路线）
     *
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<RouteVO> getRouteList(RouteQuery query);

    /**
     * 我的路线列表（组织者专用）
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<RouteVO> getMyRoutes(Long userId, RouteQuery query);

    /**
     * 路线详情（含点位信息）
     *
     * @param routeId 路线ID
     * @return 路线详情
     */
    RouteVO getRouteDetail(Long routeId);

    /**
     * 为路线添加签到点
     *
     * @param userId 用户ID
     * @param routeId 路线ID
     * @param createDTO 签到点信息
     * @return 签到点ID
     */
    Long addCheckpoint(Long userId, Long routeId, CheckpointCreateDTO createDTO);

    /**
     * 更新路线（组织者）
     *
     * @param userId 用户ID
     * @param routeId 路线ID
     * @param createDTO 更新信息
     */
    void updateRoute(Long userId, Long routeId, RouteCreateDTO createDTO);

    /**
     * 删除路线（组织者）
     *
     * @param userId 用户ID
     * @param routeId 路线ID
     */
    void deleteRoute(Long userId, Long routeId);

    /**
     * 获取路线的签到点列表
     *
     * @param routeId 路线ID
     * @return 签到点列表
     */
    java.util.List<com.hiking.hikingbackend.module.route.entity.Checkpoint> getRouteCheckpoints(Long routeId);
}

