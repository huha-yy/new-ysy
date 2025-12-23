package com.hiking.hikingbackend.module.checkin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.checkin.entity.CheckInRecord;
import org.apache.ibatis.annotations.Mapper;

/**
 * 签到记录Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface CheckInRecordMapper extends BaseMapper<CheckInRecord> {
}

