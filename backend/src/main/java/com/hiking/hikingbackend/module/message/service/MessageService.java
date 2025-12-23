package com.hiking.hikingbackend.module.message.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hiking.hikingbackend.module.message.dto.MessageQuery;
import com.hiking.hikingbackend.module.message.vo.MessageVO;

/**
 * 消息服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface MessageService {

    /**
     * 获取我的消息列表（分页）
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    IPage<MessageVO> getMyMessages(Long userId, MessageQuery query);

    /**
     * 标记消息已读
     *
     * @param userId 用户ID
     * @param messageId 消息ID
     */
    void markAsRead(Long userId, Long messageId);

    /**
     * 批量标记已读
     *
     * @param userId 用户ID
     */
    void markAllAsRead(Long userId);

    /**
     * 获取未读消息数量
     *
     * @param userId 用户ID
     * @return 未读数量
     */
    Long getUnreadCount(Long userId);
}

