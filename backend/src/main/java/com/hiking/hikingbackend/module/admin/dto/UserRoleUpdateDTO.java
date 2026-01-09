package com.hiking.hikingbackend.module.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户角色更新DTO
 *
 * @author hiking-system
 * @since 2025-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "用户角色更新请求")
public class UserRoleUpdateDTO {

    /**
     * 角色：0普通用户 1组织者 2管理员
     */
    @NotNull(message = "角色不能为空")
    @Min(value = 0, message = "角色值必须在0-2之间")
    @Max(value = 2, message = "角色值必须在0-2之间")
    @Schema(description = "角色：0普通用户 1组织者 2管理员", required = true, example = "1")
    private Integer role;
}
