package com.hiking.hikingbackend.module.message.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.message.entity.Message;
import org.apache.ibatis.annotations.Mapper;

/**
 * 消息Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface MessageMapper extends BaseMapper<Message> {
}

