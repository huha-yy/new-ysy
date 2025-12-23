package com.hiking.hikingbackend.module.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 评价创建DTO
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@Schema(description = "评价创建请求")
public class ReviewCreateDTO {

    @Schema(description = "整体评分：1-5星", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "整体评分不能为空")
    @Min(value = 1, message = "评分不能低于1星")
    @Max(value = 5, message = "评分不能高于5星")
    private Integer overallRating;

    @Schema(description = "路线评分：1-5星", example = "4", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "路线评分不能为空")
    @Min(value = 1, message = "评分不能低于1星")
    @Max(value = 5, message = "评分不能高于5星")
    private Integer routeRating;

    @Schema(description = "组织评分：1-5星", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "组织评分不能为空")
    @Min(value = 1, message = "评分不能低于1星")
    @Max(value = 5, message = "评分不能高于5星")
    private Integer organizationRating;

    @Schema(description = "安全评分：1-5星", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "安全评分不能为空")
    @Min(value = 1, message = "评分不能低于1星")
    @Max(value = 5, message = "评分不能高于5星")
    private Integer safetyRating;

    @Schema(description = "评价内容", example = "活动组织得非常好，路线设计合理，安全措施到位！")
    @Size(max = 1000, message = "评价内容最多1000个字符")
    private String content;

    @Schema(description = "评价图片URL（多个逗号分隔）", example = "https://example.com/image1.jpg,https://example.com/image2.jpg")
    @Size(max = 500, message = "图片URL最多500个字符")
    private String images;

    @Schema(description = "是否匿名：0否 1是", example = "0")
    private Integer isAnonymous;
}

