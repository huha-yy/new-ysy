package com.hiking.hikingbackend.module.route.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.route.dto.CheckpointCreateDTO;
import com.hiking.hikingbackend.module.route.dto.RouteCreateDTO;
import com.hiking.hikingbackend.module.route.dto.RouteQuery;
import com.hiking.hikingbackend.module.route.service.RouteService;
import com.hiking.hikingbackend.module.route.vo.RouteVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 路线控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "路线管理", description = "路线相关接口")
@Validated
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    /**
     * 创建路线（需登录，组织者）
     * 需要校验：用户已登录
     *
     * @param createDTO 创建信息
     * @return 路线ID
     */
    @Operation(summary = "创建路线", description = "创建新路线，需要登录", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/routes")
    public Result<Long> createRoute(@Valid @RequestBody RouteCreateDTO createDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        Long routeId = routeService.createRoute(userId, createDTO);
        return Result.success("路线创建成功", routeId);
    }

    /**
     * 路线列表（公开路线）
     *
     * @param query 查询条件
     * @return 路线列表
     */
    @Operation(summary = "路线列表", description = "查询公开的路线列表，支持按名称、地区、难度筛选")
    @GetMapping("/routes")
    public Result<IPage<RouteVO>> getRouteList(RouteQuery query) {
        IPage<RouteVO> page = routeService.getRouteList(query);
        return Result.success(page);
    }

    /**
     * 路线详情（含点位信息）
     *
     * @param routeId 路线ID
     * @return 路线详情
     */
    @Operation(summary = "路线详情", description = "查询路线详情，包含签到点信息")
    @GetMapping("/routes/{id}")
    public Result<RouteVO> getRouteDetail(
            @Parameter(description = "路线ID", required = true, example = "1")
            @PathVariable("id") Long routeId) {
        RouteVO routeVO = routeService.getRouteDetail(routeId);
        return Result.success(routeVO);
    }

    /**
     * 为路线添加签到点（需登录，路线创建者）
     * 需要校验：当前用户是路线创建者
     *
     * @param routeId 路线ID
     * @param createDTO 签到点信息
     * @return 签到点ID
     */
    @Operation(summary = "添加签到点", description = "为路线添加签到点，需要登录，仅限路线创建者", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/routes/{id}/checkpoints")
    public Result<Long> addCheckpoint(
            @Parameter(description = "路线ID", required = true, example = "1")
            @PathVariable("id") Long routeId,
            @Valid @RequestBody CheckpointCreateDTO createDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        Long checkpointId = routeService.addCheckpoint(userId, routeId, createDTO);
        return Result.success("签到点添加成功", checkpointId);
    }

    /**
     * 更新路线（需登录，路线创建者）
     * 需要校验：当前用户是路线创建者、路线未被使用
     *
     * @param routeId 路线ID
     * @param createDTO 更新信息
     * @return 操作结果
     */
    @Operation(summary = "更新路线", description = "更新路线信息，需要登录，仅限路线创建者且路线未被使用", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/routes/{id}")
    public Result<Void> updateRoute(
            @Parameter(description = "路线ID", required = true, example = "1")
            @PathVariable("id") Long routeId,
            @Valid @RequestBody RouteCreateDTO createDTO) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        routeService.updateRoute(userId, routeId, createDTO);
        return Result.success("路线更新成功");
    }

    /**
     * 删除路线（需登录，路线创建者）
     * 需要校验：当前用户是路线创建者、路线未被使用
     *
     * @param routeId 路线ID
     * @return 操作结果
     */
    @Operation(summary = "删除路线", description = "删除路线，需要登录，仅限路线创建者且路线未被使用", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/routes/{id}")
    public Result<Void> deleteRoute(
            @Parameter(description = "路线ID", required = true, example = "1")
            @PathVariable("id") Long routeId) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        routeService.deleteRoute(userId, routeId);
        return Result.success("路线删除成功");
    }

    /**
     * 获取路线的签到点列表
     *
     * @param routeId 路线ID
     * @return 签到点列表
     */
    @Operation(summary = "路线签到点列表", description = "查询路线的所有签到点")
    @GetMapping("/routes/{id}/checkpoints")
    public Result<java.util.List<com.hiking.hikingbackend.module.route.entity.Checkpoint>> getRouteCheckpoints(
            @Parameter(description = "路线ID", required = true, example = "1")
            @PathVariable("id") Long routeId) {
        java.util.List<com.hiking.hikingbackend.module.route.entity.Checkpoint> checkpoints =
                routeService.getRouteCheckpoints(routeId);
        return Result.success(checkpoints);
    }
}

