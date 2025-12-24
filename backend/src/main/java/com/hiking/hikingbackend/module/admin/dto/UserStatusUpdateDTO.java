package com.hiking.hikingbackend.module.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户状态更新DTO
 * 
 * @author hiking-system
 * @since 2024-12-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "用户状态更新请求")
public class UserStatusUpdateDTO {
    
    /**
     * 状态：0禁用 1正常
     */
    @NotNull(message = "状态不能为空")
    @Schema(description = "状态：0禁用 1正常", required = true, example = "1")
    private Integer status;
}

