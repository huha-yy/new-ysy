package com.hiking.hikingbackend.module.activity.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.activity.entity.Activity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 活动Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface ActivityMapper extends BaseMapper<Activity> {
}

