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

    /**
     * 发送消息给指定用户
     *
     * @param userId 接收用户ID
     * @param title 消息标题
     * @param content 消息内容
     * @param messageType 消息类型：1系统通知 2报名通知 3活动通知 4预警通知
     * @param relatedId 关联业务ID（如活动ID）
     * @param relatedType 关联业务类型（如activity）
     * @return 消息ID
     */
    Long sendMessage(Long userId, String title, String content, Integer messageType, Long relatedId, String relatedType);
}

