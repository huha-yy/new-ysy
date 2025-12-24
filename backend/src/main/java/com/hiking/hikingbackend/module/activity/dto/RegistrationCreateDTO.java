package com.hiking.hikingbackend.module.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 报名创建请求 DTO
 * 
 * @author hiking-system
 * @since 2024-12-24
 */
@Data
@Schema(description = "报名创建请求")
public class RegistrationCreateDTO {
    
    @Schema(description = "报名备注", example = "希望早点出发")
    @Size(max = 256, message = "备注不能超过256个字")
    private String remark;
    
    @Schema(description = "紧急联系人", example = "张三")
    @NotBlank(message = "请填写紧急联系人")
    @Size(max = 50, message = "联系人姓名不能超过50个字")
    private String emergencyContact;
    
    @Schema(description = "紧急联系电话", example = "13800138001")
    @NotBlank(message = "请填写紧急联系电话")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请输入正确的手机号")
    @Size(max = 11, message = "手机号不能超过11位")
    private String emergencyPhone;
    
    @Schema(description = "装备确认", example = "false")
    private Boolean equipmentConfirm;
    
    @Schema(description = "健康状况确认", example = "false")
    private Boolean healthConfirm;
}

