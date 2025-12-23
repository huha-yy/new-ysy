package com.hiking.hikingbackend.module.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}

