package com.hiking.hikingbackend.module.checkin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.checkin.entity.AlertEvent;
import org.apache.ibatis.annotations.Mapper;

/**
 * 预警事件Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface AlertEventMapper extends BaseMapper<AlertEvent> {
}

