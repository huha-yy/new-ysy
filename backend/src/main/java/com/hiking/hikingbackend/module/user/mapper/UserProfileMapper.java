package com.hiking.hikingbackend.module.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.user.entity.UserProfile;
import org.apache.ibatis.annotations.Mapper;

/**
 * 用户档案Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface UserProfileMapper extends BaseMapper<UserProfile> {
}

