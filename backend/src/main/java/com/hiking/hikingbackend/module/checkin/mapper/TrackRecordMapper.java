package com.hiking.hikingbackend.module.checkin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.checkin.entity.TrackRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 轨迹记录Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface TrackRecordMapper extends BaseMapper<TrackRecord> {
}

