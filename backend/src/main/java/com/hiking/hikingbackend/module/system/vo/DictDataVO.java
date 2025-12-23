package com.hiking.hikingbackend.module.system.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 字典数据VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "字典数据")
public class DictDataVO {

    @Schema(description = "字典数据ID", example = "1")
    private Long id;

    @Schema(description = "字典类型ID", example = "1")
    private Long dictTypeId;

    @Schema(description = "所属字典编码", example = "activity_difficulty")
    private String dictCode;

    @Schema(description = "显示标签", example = "休闲")
    private String label;

    @Schema(description = "数据值", example = "1")
    private String value;

    @Schema(description = "排序号", example = "1")
    private Integer sequence;

    @Schema(description = "是否默认：0否 1是", example = "0")
    private Integer isDefault;

    @Schema(description = "是否默认文本", example = "否")
    private String isDefaultText;

    @Schema(description = "状态：0禁用 1正常", example = "1")
    private Integer status;

    @Schema(description = "状态文本", example = "正常")
    private String statusText;

    @Schema(description = "备注", example = "适合初学者")
    private String remark;

    @Schema(description = "创建时间", example = "2024-12-24 20:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

