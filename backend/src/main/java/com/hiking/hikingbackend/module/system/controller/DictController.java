package com.hiking.hikingbackend.module.system.controller;

import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.module.system.service.DictService;
import com.hiking.hikingbackend.module.system.vo.DictDataVO;
import com.hiking.hikingbackend.module.system.vo.DictTypeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 字典控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Tag(name = "字典管理", description = "字典相关接口")
@Validated
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class DictController {

    private final DictService dictService;

    /**
     * 获取字典类型列表（需登录，管理员）
     *
     * @return 字典类型列表
     */
    @Operation(summary = "字典类型列表", description = "获取所有字典类型列表，需要管理员权限", security = {@SecurityRequirement(name = "Bearer Authentication")})
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/dict/types")
    public Result<List<DictTypeVO>> getDictTypeList() {
        List<DictTypeVO> list = dictService.getDictTypeList();
        return Result.success(list);
    }

    /**
     * 获取字典数据（根据字典编码）
     * 用于前端下拉选项获取
     *
     * @param dictCode 字典编码
     * @return 字典数据列表
     */
    @Operation(summary = "字典数据", description = "根据字典编码获取字典数据，用于前端下拉选项（公开接口）")
    @GetMapping("/dict/data/{dictCode}")
    public Result<List<DictDataVO>> getDictDataByCode(
            @Parameter(description = "字典编码", required = true, example = "activity_difficulty")
            @PathVariable("dictCode") String dictCode) {
        List<DictDataVO> list = dictService.getDictDataByCode(dictCode);
        return Result.success(list);
    }
}

