package com.hiking.hikingbackend.module.registration.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.registration.entity.Registration;
import org.apache.ibatis.annotations.Mapper;

/**
 * 报名Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface RegistrationMapper extends BaseMapper<Registration> {
}

