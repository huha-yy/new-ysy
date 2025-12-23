package com.hiking.hikingbackend.module.system.service;

import com.hiking.hikingbackend.module.system.vo.DictDataVO;
import com.hiking.hikingbackend.module.system.vo.DictTypeVO;

import java.util.List;

/**
 * 字典服务接口
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public interface DictService {

    /**
     * 获取字典类型列表（管理员）
     *
     * @return 字典类型列表
     */
    List<DictTypeVO> getDictTypeList();

    /**
     * 获取字典数据（根据字典编码）
     *
     * @param dictCode 字典编码
     * @return 字典数据列表
     */
    List<DictDataVO> getDictDataByCode(String dictCode);
}

