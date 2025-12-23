package com.hiking.hikingbackend.module.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hiking.hikingbackend.module.system.entity.DictData;
import com.hiking.hikingbackend.module.system.entity.DictType;
import com.hiking.hikingbackend.module.system.mapper.DictDataMapper;
import com.hiking.hikingbackend.module.system.mapper.DictTypeMapper;
import com.hiking.hikingbackend.module.system.service.DictService;
import com.hiking.hikingbackend.module.system.vo.DictDataVO;
import com.hiking.hikingbackend.module.system.vo.DictTypeVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 字典服务实现类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DictServiceImpl implements DictService {

    private final DictTypeMapper dictTypeMapper;

    private final DictDataMapper dictDataMapper;

    private static final int DICT_STATUS_NORMAL = 1; // 字典正常状态

    /**
     * 获取字典类型列表（管理员）
     *
     * @return 字典类型列表
     */
    @Override
    public List<DictTypeVO> getDictTypeList() {
        // 1. 查询所有正常的字典类型
        LambdaQueryWrapper<DictType> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DictType::getStatus, DICT_STATUS_NORMAL)
                .orderByDesc(DictType::getCreateTime);
        List<DictType> dictTypes = dictTypeMapper.selectList(queryWrapper);

        // 2. 转换为VO
        return dictTypes.stream()
                .map(this::convertToVO)
                .toList();
    }

    /**
     * 获取字典数据（根据字典编码）
     *
     * @param dictCode 字典编码
     * @return 字典数据列表
     */
    @Override
    public List<DictDataVO> getDictDataByCode(String dictCode) {
        // 1. 查询指定字典编码的所有正常数据
        LambdaQueryWrapper<DictData> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DictData::getDictCode, dictCode)
                .eq(DictData::getStatus, DICT_STATUS_NORMAL)
                .orderByAsc(DictData::getSequence);
        List<DictData> dictDataList = dictDataMapper.selectList(queryWrapper);

        // 2. 转换为VO
        return dictDataList.stream()
                .map(this::convertToVO)
                .toList();
    }

    /**
     * 字典类型转换为VO
     */
    private DictTypeVO convertToVO(DictType dictType) {
        return DictTypeVO.builder()
                .id(dictType.getId())
                .dictName(dictType.getDictName())
                .dictCode(dictType.getDictCode())
                .description(dictType.getDescription())
                .status(dictType.getStatus())
                .statusText(getStatusText(dictType.getStatus()))
                .createTime(dictType.getCreateTime())
                .updateTime(dictType.getUpdateTime())
                .build();
    }

    /**
     * 字典数据转换为VO
     */
    private DictDataVO convertToVO(DictData dictData) {
        return DictDataVO.builder()
                .id(dictData.getId())
                .dictTypeId(dictData.getDictTypeId())
                .dictCode(dictData.getDictCode())
                .label(dictData.getLabel())
                .value(dictData.getValue())
                .sequence(dictData.getSequence())
                .isDefault(dictData.getIsDefault())
                .isDefaultText(getIsDefaultText(dictData.getIsDefault()))
                .status(dictData.getStatus())
                .statusText(getStatusText(dictData.getStatus()))
                .remark(dictData.getRemark())
                .createTime(dictData.getCreateTime())
                .updateTime(dictData.getUpdateTime())
                .build();
    }

    /**
     * 获取状态文本
     */
    private String getStatusText(Integer status) {
        if (status == null) return null;
        return switch (status) {
            case 0 -> "禁用";
            case 1 -> "正常";
            default -> "未知";
        };
    }

    /**
     * 获取是否默认文本
     */
    private String getIsDefaultText(Integer isDefault) {
        if (isDefault == null) return null;
        return switch (isDefault) {
            case 0 -> "否";
            case 1 -> "是";
            default -> "未知";
        };
    }
}

