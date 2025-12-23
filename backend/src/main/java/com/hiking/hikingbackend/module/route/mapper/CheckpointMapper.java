package com.hiking.hikingbackend.module.route.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.route.entity.Checkpoint;
import org.apache.ibatis.annotations.Mapper;

/**
 * 签到点Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface CheckpointMapper extends BaseMapper<Checkpoint> {
}

