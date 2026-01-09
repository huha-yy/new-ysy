package com.hiking.hikingbackend.module.message.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hiking.hikingbackend.common.exception.BusinessException;
import com.hiking.hikingbackend.common.result.ResultCode;
import com.hiking.hikingbackend.module.message.dto.MessageQuery;
import com.hiking.hikingbackend.module.message.entity.Message;
import com.hiking.hikingbackend.module.message.mapper.MessageMapper;
import com.hiking.hikingbackend.module.message.service.MessageService;
import com.hiking.hikingbackend.module.message.vo.MessageVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 消息服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageMapper messageMapper;

    private static final int MESSAGE_READ = 1;        // 已读
    private static final int MESSAGE_UNREAD = 0;      // 未读

    /**
     * 获取我的消息列表（分页）
     *
     * @param userId 用户ID
     * @param query 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<MessageVO> getMyMessages(Long userId, MessageQuery query) {
        // 1. 构建查询条件
        LambdaQueryWrapper<Message> queryWrapper = new LambdaQueryWrapper<>();
        
        // 强制查询当前用户的消息
        queryWrapper.eq(Message::getUserId, userId);
        
        // 按消息类型筛选
        if (query.getMessageType() != null) {
            queryWrapper.eq(Message::getMessageType, query.getMessageType());
        }
        
        // 按已读状态筛选
        if (query.getIsRead() != null) {
            queryWrapper.eq(Message::getIsRead, query.getIsRead());
        }
        
        // 按创建时间倒序
        queryWrapper.orderByDesc(Message::getCreateTime);
        
        // 2. 分页查询
        Page<Message> page = new Page<>(query.getPageNum(), query.getPageSize());
        IPage<Message> messagePage = messageMapper.selectPage(page, queryWrapper);
        
        // 3. 转换为VO
        return messagePage.convert(this::convertToVO);
    }

    /**
     * 标记消息已读
     *
     * @param userId 用户ID
     * @param messageId 消息ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAsRead(Long userId, Long messageId) {
        // 1. 查询消息
        Message message = messageMapper.selectById(messageId);
        if (message == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "消息不存在");
        }
        
        // 2. 校验权限（必须是消息接收者）
        if (!message.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        
        // 3. 如果已经是已读状态，则直接返回
        if (message.getIsRead() != null && message.getIsRead() == MESSAGE_READ) {
            return;
        }
        
        // 4. 更新为已读状态
        LambdaUpdateWrapper<Message> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Message::getId, messageId)
                    .eq(Message::getUserId, userId)
                    .set(Message::getIsRead, MESSAGE_READ)
                    .set(Message::getReadTime, LocalDateTime.now());
        
        int updated = messageMapper.update(null, updateWrapper);
        log.info("标记消息已读，消息ID：{}，用户ID：{}，更新行数：{}", messageId, userId, updated);
    }

    /**
     * 批量标记已读
     *
     * @param userId 用户ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAllAsRead(Long userId) {
        // 1. 查询用户未读消息数量
        LambdaQueryWrapper<Message> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Message::getUserId, userId)
                    .eq(Message::getIsRead, MESSAGE_UNREAD);
        Long unreadCount = messageMapper.selectCount(queryWrapper);
        
        if (unreadCount == 0) {
            log.info("用户没有未读消息，用户ID：{}", userId);
            return;
        }
        
        // 2. 批量更新为已读状态
        LambdaUpdateWrapper<Message> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Message::getUserId, userId)
                    .eq(Message::getIsRead, MESSAGE_UNREAD)
                    .set(Message::getIsRead, MESSAGE_READ)
                    .set(Message::getReadTime, LocalDateTime.now());
        
        int updated = messageMapper.update(null, updateWrapper);
        log.info("批量标记已读，用户ID：{}，更新行数：{}", userId, updated);
    }

    /**
     * 获取未读消息数量
     *
     * @param userId 用户ID
     * @return 未读数量
     */
    @Override
    public Long getUnreadCount(Long userId) {
        LambdaQueryWrapper<Message> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Message::getUserId, userId)
                    .eq(Message::getIsRead, MESSAGE_UNREAD);

        return messageMapper.selectCount(queryWrapper);
    }

    /**
     * 发送消息给指定用户
     *
     * @param userId 接收用户ID
     * @param title 消息标题
     * @param content 消息内容
     * @param messageType 消息类型
     * @param relatedId 关联业务ID
     * @param relatedType 关联业务类型
     * @return 消息ID
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long sendMessage(Long userId, String title, String content, Integer messageType, Long relatedId, String relatedType) {
        Message message = Message.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .messageType(messageType)
                .relatedId(relatedId)
                .relatedType(relatedType)
                .isRead(MESSAGE_UNREAD)
                .build();

        messageMapper.insert(message);
        log.info("发送消息成功，接收者ID：{}，消息类型：{}，标题：{}", userId, messageType, title);

        return message.getId();
    }

    /**
     * 转换为VO
     */
    private MessageVO convertToVO(Message message) {
        return MessageVO.builder()
                .id(message.getId())
                .userId(message.getUserId())
                .title(message.getTitle())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .messageTypeName(getMessageTypeName(message.getMessageType()))
                .relatedId(message.getRelatedId())
                .relatedType(message.getRelatedType())
                .isRead(message.getIsRead())
                .readTime(message.getReadTime())
                .createTime(message.getCreateTime())
                .updateTime(message.getUpdateTime())
                .build();
    }

    /**
     * 获取消息类型文本
     */
    private String getMessageTypeName(Integer messageType) {
        if (messageType == null) return null;
        return switch (messageType) {
            case 1 -> "系统通知";
            case 2 -> "报名通知";
            case 3 -> "活动通知";
            case 4 -> "预警通知";
            default -> "未知";
        };
    }
}

