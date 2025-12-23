package com.hiking.hikingbackend.module.route.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.route.entity.RoutePoint;
import org.apache.ibatis.annotations.Mapper;

/**
 * 路线点位Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface RoutePointMapper extends BaseMapper<RoutePoint> {
}

