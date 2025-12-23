package com.hiking.hikingbackend.module.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hiking.hikingbackend.module.system.entity.DictType;
import org.apache.ibatis.annotations.Mapper;

/**
 * 字典类型Mapper接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Mapper
public interface DictTypeMapper extends BaseMapper<DictType> {
}

