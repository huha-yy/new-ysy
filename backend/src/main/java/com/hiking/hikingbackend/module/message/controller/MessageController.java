package com.hiking.hikingbackend.module.message.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.utils.SecurityUtils;
import com.hiking.hikingbackend.module.message.dto.MessageQuery;
import com.hiking.hikingbackend.module.message.service.MessageService;
import com.hiking.hikingbackend.module.message.vo.MessageVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 消息控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "消息管理", description = "消息相关接口")
@Validated
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /**
     * 获取我的消息列表（需登录）
     * 需要校验：用户已登录
     *
     * @param query 查询条件
     * @return 消息列表
     */
    @Operation(summary = "我的消息列表", description = "查询当前用户的消息列表，支持按消息类型和已读状态筛选，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user/messages")
    public Result<IPage<MessageVO>> getMyMessages(MessageQuery query) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        IPage<MessageVO> page = messageService.getMyMessages(userId, query);
        return Result.success(page);
    }

    /**
     * 标记消息已读（需登录）
     * 需要校验：当前用户是消息接收者
     *
     * @param messageId 消息ID
     * @return 操作结果
     */
    @Operation(summary = "标记消息已读", description = "标记指定消息为已读状态，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/messages/{id}/read")
    public Result<Void> markAsRead(
            @Parameter(description = "消息ID", required = true, example = "1")
            @PathVariable("id") Long messageId) {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        messageService.markAsRead(userId, messageId);
        return Result.success("标记成功");
    }

    /**
     * 批量标记已读（需登录）
     * 需要校验：用户已登录
     *
     * @return 操作结果
     */
    @Operation(summary = "批量标记已读", description = "将当前用户的所有未读消息标记为已读，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/user/messages/read-all")
    public Result<Void> markAllAsRead() {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        messageService.markAllAsRead(userId);
        return Result.success("批量标记成功");
    }

    /**
     * 获取未读消息数量（需登录）
     * 需要校验：用户已登录
     *
     * @return 未读数量
     */
    @Operation(summary = "获取未读消息数量", description = "查询当前用户的未读消息数量，需要登录")
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/user/messages/unread-count")
    public Result<Long> getUnreadCount() {
        // 获取当前用户ID
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("无法获取当前用户ID");
        }

        Long count = messageService.getUnreadCount(userId);
        return Result.success(count);
    }
}

