package com.hiking.hikingbackend.module.review.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.review.entity.Review;
import org.apache.ibatis.annotations.Mapper;

/**
 * 评价Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface ReviewMapper extends BaseMapper<Review> {
}

