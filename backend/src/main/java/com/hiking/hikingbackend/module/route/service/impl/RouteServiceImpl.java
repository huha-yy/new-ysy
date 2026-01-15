package com.hiking.hikingbackend.module.route.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.module.route.dto.CheckpointCreateDTO;
import com.hiking.hikingbackend.module.route.dto.RouteCreateDTO;
import com.hiking.hikingbackend.module.route.dto.RouteQuery;
import com.hiking.hikingbackend.module.route.entity.Checkpoint;
import com.hiking.hikingbackend.module.route.entity.Route;
import com.hiking.hikingbackend.module.route.entity.RoutePoint;
import com.hiking.hikingbackend.module.route.mapper.CheckpointMapper;
import com.hiking.hikingbackend.module.route.mapper.RouteMapper;
import com.hiking.hikingbackend.module.route.mapper.RoutePointMapper;
import com.hiking.hikingbackend.module.route.service.RouteService;
import com.hiking.hikingbackend.module.route.vo.CheckpointVO;
import com.hiking.hikingbackend.module.route.vo.RouteVO;
import com.hiking.hikingbackend.module.user.entity.User;
import com.hiking.hikingbackend.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * 路线服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RouteServiceImpl implements RouteService {

    private final RouteMapper routeMapper;

    private final CheckpointMapper checkpointMapper;

    private final RoutePointMapper routePointMapper;

    private final UserMapper userMapper;

    private static final int ROUTE_STATUS_NORMAL = 1;    // 路线正常
    private static final int ROUTE_PUBLIC = 1;           // 路线公开
    private static final int CHECKPOINT_RADIUS_DEFAULT = 50; // 默认签到半径（米）
    private static final int CHECKPOINT_TYPE_WAY = 2;      // 途中点（默认）
    private static final int CHECKPOINT_REQUIRED = 1;       // 必签（默认）

    /**
     * 创建路线（组织者）
     *
     * @param userId 用户ID
     * @param createDTO 创建信息
     * @return 路线ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createRoute(Long userId, RouteCreateDTO createDTO) {
        // 1. 校验用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 从路线点中提取起点和终点信息
        if (createDTO.getRoutePoints() != null && !createDTO.getRoutePoints().isEmpty()) {
            List<RouteCreateDTO.RoutePointDTO> points = createDTO.getRoutePoints();
            RouteCreateDTO.RoutePointDTO startPoint = points.get(0);
            RouteCreateDTO.RoutePointDTO endPoint = points.get(points.size() - 1);

            // 自动设置起点和终点信息（如果没有手动设置）
            if (createDTO.getStartLatitude() == null) {
                createDTO.setStartLatitude(BigDecimal.valueOf(startPoint.getLat()));
                createDTO.setStartLongitude(BigDecimal.valueOf(startPoint.getLng()));
            }
            if (createDTO.getEndLatitude() == null) {
                createDTO.setEndLatitude(BigDecimal.valueOf(endPoint.getLat()));
                createDTO.setEndLongitude(BigDecimal.valueOf(endPoint.getLng()));
            }
        }

        // 3. 构建路线对象
        Route route = Route.builder()
                .name(createDTO.getName())
                .description(createDTO.getDescription())
                .creatorId(userId)
                .difficultyLevel(createDTO.getDifficultyLevel())
                .totalDistance(createDTO.getTotalDistance())
                .elevationGain(createDTO.getElevationGain())
                .elevationLoss(createDTO.getElevationLoss())
                .maxElevation(createDTO.getMaxElevation())
                .minElevation(createDTO.getMinElevation())
                .estimatedHours(createDTO.getEstimatedHours())
                .startPointName(createDTO.getStartPointName())
                .startLatitude(createDTO.getStartLatitude())
                .startLongitude(createDTO.getStartLongitude())
                .endPointName(createDTO.getEndPointName())
                .endLatitude(createDTO.getEndLatitude())
                .endLongitude(createDTO.getEndLongitude())
                .region(createDTO.getRegion())
                .isPublic(createDTO.getIsPublic() != null ? createDTO.getIsPublic() : ROUTE_PUBLIC)
                .useCount(0)
                .status(ROUTE_STATUS_NORMAL)
                .build();

        routeMapper.insert(route);
        Long routeId = route.getId();
        log.info("创建路线成功，路线ID：{}，创建者ID：{}", routeId, userId);

        // 4. 保存路线点（route_point表）
        if (createDTO.getRoutePoints() != null && !createDTO.getRoutePoints().isEmpty()) {
            List<RoutePoint> routePoints = createDTO.getRoutePoints().stream()
                    .map(point -> {
                        int sequence = createDTO.getRoutePoints().indexOf(point) + 1;
                        return RoutePoint.builder()
                                .routeId(routeId)
                                .name("路线点" + sequence) // 添加必需的name字段
                                .latitude(BigDecimal.valueOf(point.getLat()))
                                .longitude(BigDecimal.valueOf(point.getLng()))
                                .pointType(1) // 默认为途经点
                                .sequence(sequence)
                                .build();
                    })
                    .toList();

            routePoints.forEach(routePointMapper::insert);
            log.info("保存路线点成功，路线ID：{}，路线点数量：{}", routeId, routePoints.size());
        }

        // 5. 保存签到点（checkpoint表）
        if (createDTO.getCheckpoints() != null && !createDTO.getCheckpoints().isEmpty()) {
            List<Checkpoint> checkpoints = createDTO.getCheckpoints().stream()
                    .map(cp -> Checkpoint.builder()
                            .routeId(routeId)
                            .name(cp.getName())
                            .latitude(BigDecimal.valueOf(cp.getLatitude()))
                            .longitude(BigDecimal.valueOf(cp.getLongitude()))
                            .radius(cp.getRadius() != null ? cp.getRadius() : CHECKPOINT_RADIUS_DEFAULT)
                            .sequence(cp.getSequence() != null ? cp.getSequence() : createDTO.getCheckpoints().indexOf(cp) + 1)
                            .checkpointType(cp.getType() != null ? cp.getType() : CHECKPOINT_TYPE_WAY)
                            .isRequired(cp.getIsRequired() != null && cp.getIsRequired() ? CHECKPOINT_REQUIRED : 0)
                            .build())
                    .toList();

            checkpoints.forEach(checkpointMapper::insert);
            log.info("保存签到点成功，路线ID：{}，签到点数量：{}", routeId, checkpoints.size());
        }

        // 6. 保存途经点（也保存到route_point表，type=1）
        if (createDTO.getWaypoints() != null && !createDTO.getWaypoints().isEmpty()) {
            List<RoutePoint> waypoints = createDTO.getWaypoints().stream()
                    .map(wp -> RoutePoint.builder()
                            .routeId(routeId)
                            .name(wp.getName())
                            .latitude(BigDecimal.valueOf(wp.getLatitude()))
                            .longitude(BigDecimal.valueOf(wp.getLongitude()))
                            .pointType(wp.getPointType() != null ? wp.getPointType() : 1)
                            .sequence(wp.getSequence() != null ? wp.getSequence() : createDTO.getWaypoints().indexOf(wp) + 1)
                            .build())
                    .toList();

            waypoints.forEach(routePointMapper::insert);
            log.info("保存途经点成功，路线ID：{}，途经点数量：{}", routeId, waypoints.size());
        }

        return routeId;
    }

    /**
     * 路线列表（公开路线）
     *
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<RouteVO> getRouteList(RouteQuery query) {
        // 1. 构建查询条件（只查询公开且正常的路线）
        LambdaQueryWrapper<Route> queryWrapper = new LambdaQueryWrapper<>();
        
        // 只查询公开且正常的路线
        queryWrapper.eq(Route::getIsPublic, ROUTE_PUBLIC)
                  .eq(Route::getStatus, ROUTE_STATUS_NORMAL);
        
        // 按名称模糊查询
        if (StringUtils.hasText(query.getName())) {
            queryWrapper.like(Route::getName, query.getName());
        }
        
        // 按地区模糊查询
        if (StringUtils.hasText(query.getRegion())) {
            queryWrapper.like(Route::getRegion, query.getRegion());
        }
        
        // 按难度等级筛选
        if (query.getDifficultyLevel() != null) {
            queryWrapper.eq(Route::getDifficultyLevel, query.getDifficultyLevel());
        }
        
        // 按使用次数降序
        queryWrapper.orderByDesc(Route::getUseCount);
        
        // 2. 分页查询
        Page<Route> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<Route> routePage = routeMapper.selectPage(page, queryWrapper);
        
        // 3. 转换为VO（列表不包含签到点）
        return routePage.convert(this::convertToVOBasic);
    }

    /**
     * 我的路线列表（组织者专用）
     * 包含：当前用户创建的所有路线（含私有） + 其他用户的公开路线
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<RouteVO> getMyRoutes(Long userId, RouteQuery query) {
        // 1. 构建查询条件
        LambdaQueryWrapper<Route> queryWrapper = new LambdaQueryWrapper<>();

        // 查询条件：(自己创建的所有路线) OR (其他人的公开路线)
        queryWrapper.and(wrapper -> wrapper
                .eq(Route::getCreatorId, userId)  // 自己创建的路线（包括私有）
                .or(w -> w.eq(Route::getIsPublic, ROUTE_PUBLIC)  // 或者其他人的公开路线
                        .ne(Route::getCreatorId, userId)))
                .eq(Route::getStatus, ROUTE_STATUS_NORMAL);  // 只查询正常状态的路线

        // 按名称模糊查询
        if (StringUtils.hasText(query.getName())) {
            queryWrapper.like(Route::getName, query.getName());
        }

        // 按地区模糊查询
        if (StringUtils.hasText(query.getRegion())) {
            queryWrapper.like(Route::getRegion, query.getRegion());
        }

        // 按难度等级筛选
        if (query.getDifficultyLevel() != null) {
            queryWrapper.eq(Route::getDifficultyLevel, query.getDifficultyLevel());
        }

        // 排序：先按使用次数降序，再按创建时间降序
        queryWrapper.orderByDesc(Route::getUseCount)  // 使用次数高的优先
                .orderByDesc(Route::getCreateTime);  // 创建时间新的优先

        // 2. 分页查询
        Page<Route> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<Route> routePage = routeMapper.selectPage(page, queryWrapper);

        // 3. 转换为VO，添加权限标识
        return routePage.convert(route -> {
            RouteVO vo = convertToVOBasic(route);
            // 添加权限标识：只有创建者可以编辑/删除
            vo.setCanEdit(route.getCreatorId().equals(userId));
            return vo;
        });
    }

    /**
     * 路线详情（含点位信息）
     *
     * @param routeId 路线ID
     * @return 路线详情
     */
    @Override
    public RouteVO getRouteDetail(Long routeId) {
        // 1. 查询路线
        Route route = routeMapper.selectById(routeId);
        if (route == null) {
            throw new BusinessException(ResultCode.ROUTE_NOT_FOUND);
        }
        
        // 2. 查询该路线的所有签到点
        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, routeId)
                      .orderByAsc(Checkpoint::getSequence);
        List<Checkpoint> checkpoints = checkpointMapper.selectList(checkpointWrapper);
        
        // 3. 转换为VO
        return convertToVOWithCheckpoints(route, checkpoints);
    }

    /**
     * 为路线添加签到点
     *
     * @param userId 用户ID
     * @param routeId 路线ID
     * @param createDTO 签到点信息
     * @return 签到点ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addCheckpoint(Long userId, Long routeId, CheckpointCreateDTO createDTO) {
        // 1. 校验用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        
        // 2. 校验路线是否存在
        Route route = routeMapper.selectById(routeId);
        if (route == null) {
            throw new BusinessException(ResultCode.ROUTE_NOT_FOUND);
        }
        
        // 3. 校验权限（必须是路线创建者）
        if (!route.getCreatorId().equals(userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有路线创建者可以添加签到点");
        }
        
        // 4. 构建签到点对象
        Checkpoint checkpoint = Checkpoint.builder()
                .routeId(routeId)
                .name(createDTO.getName())
                .description(createDTO.getDescription())
                .latitude(createDTO.getLatitude())
                .longitude(createDTO.getLongitude())
                .radius(createDTO.getRadius() != null ? createDTO.getRadius() : CHECKPOINT_RADIUS_DEFAULT)
                .sequence(createDTO.getSequence())
                .checkpointType(createDTO.getCheckpointType() != null ? createDTO.getCheckpointType() : CHECKPOINT_TYPE_WAY)
                .isRequired(createDTO.getIsRequired() != null ? createDTO.getIsRequired() : CHECKPOINT_REQUIRED)
                .expectedArriveMinutes(createDTO.getExpectedArriveMinutes())
                .build();
        
        checkpointMapper.insert(checkpoint);
        log.info("添加签到点成功，签到点ID：{}，路线ID：{}，创建者ID：{}", checkpoint.getId(), routeId, userId);
        
        return checkpoint.getId();
    }

    /**
     * 转换为VO（基本信息，不包含签到点）
     */
    private RouteVO convertToVOBasic(Route route) {
        // 查询创建者信息
        User creator = userMapper.selectById(route.getCreatorId());
        String creatorNickname = creator != null ? creator.getNickname() : null;
        String creatorAvatar = creator != null ? creator.getAvatar() : null;
        
        return RouteVO.builder()
                .id(route.getId())
                .name(route.getName())
                .description(route.getDescription())
                .creatorId(route.getCreatorId())
                .creatorNickname(creatorNickname)
                .creatorAvatar(creatorAvatar)
                .difficultyLevel(route.getDifficultyLevel())
                .difficultyLevelText(getDifficultyLevelText(route.getDifficultyLevel()))
                .totalDistance(route.getTotalDistance())
                .elevationGain(route.getElevationGain())
                .elevationLoss(route.getElevationLoss())
                .maxElevation(route.getMaxElevation())
                .minElevation(route.getMinElevation())
                .estimatedHours(route.getEstimatedHours())
                .startPointName(route.getStartPointName())
                .startLatitude(route.getStartLatitude())
                .startLongitude(route.getStartLongitude())
                .endPointName(route.getEndPointName())
                .endLatitude(route.getEndLatitude())
                .endLongitude(route.getEndLongitude())
                .region(route.getRegion())
                .isPublic(route.getIsPublic())
                .useCount(route.getUseCount())
                .status(route.getStatus())
                .statusText(getStatusText(route.getStatus()))
                .checkpoints(null)
                .createTime(route.getCreateTime())
                .updateTime(route.getUpdateTime())
                .build();
    }

    /**
     * 转换为VO（含签到点）
     */
    private RouteVO convertToVOWithCheckpoints(Route route, List<Checkpoint> checkpoints) {
        // 先转换基本信息
        RouteVO routeVO = convertToVOBasic(route);
        
        // 转换签到点列表
        List<CheckpointVO> checkpointVOList = checkpoints.stream()
                .map(this::convertToVO)
                .toList();
        
        routeVO.setCheckpoints(checkpointVOList);
        
        return routeVO;
    }

    /**
     * 签到点转换为VO
     */
    private CheckpointVO convertToVO(Checkpoint checkpoint) {
        return CheckpointVO.builder()
                .id(checkpoint.getId())
                .routeId(checkpoint.getRouteId())
                .name(checkpoint.getName())
                .description(checkpoint.getDescription())
                .latitude(checkpoint.getLatitude())
                .longitude(checkpoint.getLongitude())
                .radius(checkpoint.getRadius())
                .sequence(checkpoint.getSequence())
                .checkpointType(checkpoint.getCheckpointType())
                .checkpointTypeText(getCheckpointTypeText(checkpoint.getCheckpointType()))
                .isRequired(checkpoint.getIsRequired())
                .isRequiredText(getIsRequiredText(checkpoint.getIsRequired()))
                .expectedArriveMinutes(checkpoint.getExpectedArriveMinutes())
                .createTime(checkpoint.getCreateTime())
                .updateTime(checkpoint.getUpdateTime())
                .build();
    }

    /**
     * 获取难度等级文本
     */
    private String getDifficultyLevelText(Integer difficultyLevel) {
        if (difficultyLevel == null) return null;
        return switch (difficultyLevel) {
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
            case 0 -> "禁用";
            case 1 -> "正常";
            default -> "未知";
        };
    }

    /**
     * 获取签到点类型文本
     */
    private String getCheckpointTypeText(Integer checkpointType) {
        if (checkpointType == null) return null;
        return switch (checkpointType) {
            case 1 -> "集合点";
            case 2 -> "途中点";
            case 3 -> "终点";
            default -> "未知";
        };
    }

    /**
     * 获取是否必签文本
     */
    private String getIsRequiredText(Integer isRequired) {
        if (isRequired == null) return null;
        return switch (isRequired) {
            case 0 -> "否";
            case 1 -> "是";
            default -> "未知";
        };
    }

    /**
     * 更新路线（组织者）
     *
     * @param userId 用户ID
     * @param routeId 路线ID
     * @param createDTO 更新信息
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRoute(Long userId, Long routeId, RouteCreateDTO createDTO) {
        // 1. 校验用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 校验路线是否存在
        Route route = routeMapper.selectById(routeId);
        if (route == null) {
            throw new BusinessException(ResultCode.ROUTE_NOT_FOUND);
        }

        // 3. 校验权限（必须是路线创建者）
        if (!route.getCreatorId().equals(userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有路线创建者可以修改路线");
        }

        // 4. 检查路线是否被使用中
        if (route.getUseCount() != null && route.getUseCount() > 0) {
            throw new BusinessException(ResultCode.ROUTE_IN_USE);
        }

        // 5. 从路线点中提取起点和终点信息
        if (createDTO.getRoutePoints() != null && !createDTO.getRoutePoints().isEmpty()) {
            List<RouteCreateDTO.RoutePointDTO> points = createDTO.getRoutePoints();
            RouteCreateDTO.RoutePointDTO startPoint = points.get(0);
            RouteCreateDTO.RoutePointDTO endPoint = points.get(points.size() - 1);

            route.setStartLatitude(BigDecimal.valueOf(startPoint.getLat()));
            route.setStartLongitude(BigDecimal.valueOf(startPoint.getLng()));
            route.setEndLatitude(BigDecimal.valueOf(endPoint.getLat()));
            route.setEndLongitude(BigDecimal.valueOf(endPoint.getLng()));
        }

        // 6. 更新路线信息
        route.setName(createDTO.getName());
        route.setDescription(createDTO.getDescription());
        route.setDifficultyLevel(createDTO.getDifficultyLevel());
        route.setTotalDistance(createDTO.getTotalDistance());
        route.setElevationGain(createDTO.getElevationGain());
        route.setElevationLoss(createDTO.getElevationLoss());
        route.setMaxElevation(createDTO.getMaxElevation());
        route.setMinElevation(createDTO.getMinElevation());
        route.setEstimatedHours(createDTO.getEstimatedHours());
        route.setStartPointName(createDTO.getStartPointName());
        route.setEndPointName(createDTO.getEndPointName());
        route.setRegion(createDTO.getRegion());
        route.setIsPublic(createDTO.getIsPublic() != null ? createDTO.getIsPublic() : ROUTE_PUBLIC);

        // 更新起点和终点信息（如果有手动设置）
        if (createDTO.getStartLatitude() != null) {
            route.setStartLatitude(createDTO.getStartLatitude());
        }
        if (createDTO.getStartLongitude() != null) {
            route.setStartLongitude(createDTO.getStartLongitude());
        }
        if (createDTO.getEndLatitude() != null) {
            route.setEndLatitude(createDTO.getEndLatitude());
        }
        if (createDTO.getEndLongitude() != null) {
            route.setEndLongitude(createDTO.getEndLongitude());
        }

        routeMapper.updateById(route);
        log.info("更新路线成功，路线ID：{}，操作者ID：{}", routeId, userId);

        // 7. 删除原有的路线点和签到点
        LambdaQueryWrapper<RoutePoint> pointWrapper = new LambdaQueryWrapper<>();
        pointWrapper.eq(RoutePoint::getRouteId, routeId);
        routePointMapper.delete(pointWrapper);

        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, routeId);
        checkpointMapper.delete(checkpointWrapper);

        // 8. 保存新的路线点
        if (createDTO.getRoutePoints() != null && !createDTO.getRoutePoints().isEmpty()) {
            List<RoutePoint> routePoints = createDTO.getRoutePoints().stream()
                    .map(point -> RoutePoint.builder()
                            .routeId(routeId)
                            .latitude(BigDecimal.valueOf(point.getLat()))
                            .longitude(BigDecimal.valueOf(point.getLng()))
                            .pointType(1)
                            .sequence(createDTO.getRoutePoints().indexOf(point) + 1)
                            .build())
                    .toList();
            routePoints.forEach(routePointMapper::insert);
        }

        // 9. 保存新的签到点
        if (createDTO.getCheckpoints() != null && !createDTO.getCheckpoints().isEmpty()) {
            List<Checkpoint> checkpoints = createDTO.getCheckpoints().stream()
                    .map(cp -> Checkpoint.builder()
                            .routeId(routeId)
                            .name(cp.getName())
                            .latitude(BigDecimal.valueOf(cp.getLatitude()))
                            .longitude(BigDecimal.valueOf(cp.getLongitude()))
                            .radius(cp.getRadius() != null ? cp.getRadius() : CHECKPOINT_RADIUS_DEFAULT)
                            .sequence(cp.getSequence() != null ? cp.getSequence() : createDTO.getCheckpoints().indexOf(cp) + 1)
                            .checkpointType(cp.getType() != null ? cp.getType() : CHECKPOINT_TYPE_WAY)
                            .isRequired(cp.getIsRequired() != null && cp.getIsRequired() ? CHECKPOINT_REQUIRED : 0)
                            .build())
                    .toList();
            checkpoints.forEach(checkpointMapper::insert);
        }
    }

    /**
     * 删除路线（组织者）
     *
     * @param userId 用户ID
     * @param routeId 路线ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRoute(Long userId, Long routeId) {
        // 1. 校验用户是否存在
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }

        // 2. 校验路线是否存在
        Route route = routeMapper.selectById(routeId);
        if (route == null) {
            throw new BusinessException(ResultCode.ROUTE_NOT_FOUND);
        }

        // 3. 校验权限（必须是路线创建者）
        if (!route.getCreatorId().equals(userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只有路线创建者可以删除路线");
        }

        // 4. 检查路线是否被使用中
        if (route.getUseCount() != null && route.getUseCount() > 0) {
            throw new BusinessException(ResultCode.ROUTE_IN_USE);
        }

        // 5. 删除路线点
        LambdaQueryWrapper<RoutePoint> pointWrapper = new LambdaQueryWrapper<>();
        pointWrapper.eq(RoutePoint::getRouteId, routeId);
        routePointMapper.delete(pointWrapper);

        // 6. 删除签到点
        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, routeId);
        checkpointMapper.delete(checkpointWrapper);

        // 7. 删除路线
        routeMapper.deleteById(routeId);
        log.info("删除路线成功，路线ID：{}，操作者ID：{}", routeId, userId);
    }

    /**
     * 获取路线的签到点列表
     *
     * @param routeId 路线ID
     * @return 签到点列表
     */
    @Override
    public List<Checkpoint> getRouteCheckpoints(Long routeId) {
        // 校验路线是否存在
        Route route = routeMapper.selectById(routeId);
        if (route == null) {
            throw new BusinessException(ResultCode.ROUTE_NOT_FOUND);
        }

        // 查询签到点列表
        LambdaQueryWrapper<Checkpoint> checkpointWrapper = new LambdaQueryWrapper<>();
        checkpointWrapper.eq(Checkpoint::getRouteId, routeId)
                .orderByAsc(Checkpoint::getSequence);
        return checkpointMapper.selectList(checkpointWrapper);
    }
}

