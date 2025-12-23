package com.hiking.hikingbackend.module.system.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 字典类型信息VO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "字典类型信息")
public class DictTypeVO {

    @Schema(description = "字典类型ID", example = "1")
    private Long id;

    @Schema(description = "字典名称", example = "活动难度")
    private String dictName;

    @Schema(description = "字典编码", example = "activity_difficulty")
    private String dictCode;

    @Schema(description = "描述", example = "活动难度等级")
    private String description;

    @Schema(description = "状态：0禁用 1正常", example = "1")
    private Integer status;

    @Schema(description = "状态文本", example = "正常")
    private String statusText;

    @Schema(description = "创建时间", example = "2024-12-24 20:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;

    @Schema(description = "更新时间", example = "2024-12-25 10:00:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

