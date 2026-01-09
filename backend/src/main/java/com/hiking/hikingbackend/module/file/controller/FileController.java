package com.hiking.hikingbackend.module.file.controller;

import com.hiking.hikingbackend.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 文件上传控制器
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@RestController
@RequestMapping("/file")
@Tag(name = "文件管理", description = "文件上传下载相关接口")
public class FileController {

    @Value("${file.upload-path:uploads}")
    private String uploadPath;

    @Value("${file.access-path:/uploads}")
    private String accessPath;

    /**
     * 上传图片
     *
     * @param file 图片文件
     * @return 图片访问URL
     */
    @PostMapping("/upload/image")
    @Operation(summary = "上传图片", description = "上传图片文件，返回访问URL")
    public Result<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        // 验证文件
        if (file.isEmpty()) {
            return Result.error("请选择要上传的文件");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return Result.error("只能上传图片文件");
        }

        // 验证文件大小（最大5MB）
        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            return Result.error("图片大小不能超过5MB");
        }

        try {
            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;

            // 按日期创建子目录
            String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String relativePath = dateDir + "/" + newFilename;

            // 创建目录
            Path uploadDir = Paths.get(uploadPath, dateDir);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // 保存文件
            Path filePath = uploadDir.resolve(newFilename);
            file.transferTo(filePath.toFile());

            // 返回访问URL
            String url = accessPath + "/" + relativePath;

            Map<String, String> result = new HashMap<>();
            result.put("url", url);
            result.put("filename", newFilename);

            log.info("文件上传成功: {}", url);
            return Result.success("上传成功", result);

        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 删除文件
     *
     * @param filePath 文件相对路径
     * @return 删除结果
     */
    @DeleteMapping("/delete")
    @Operation(summary = "删除文件", description = "根据文件路径删除文件")
    public Result<Void> deleteFile(@RequestParam("path") String filePath) {
        try {
            // 安全检查：防止路径遍历攻击
            if (filePath.contains("..")) {
                return Result.error("非法的文件路径");
            }

            // 移除前缀
            String relativePath = filePath.replace(accessPath + "/", "");
            Path path = Paths.get(uploadPath, relativePath);

            if (Files.exists(path)) {
                Files.delete(path);
                log.info("文件删除成功: {}", filePath);
                return Result.success("删除成功");
            } else {
                return Result.error("文件不存在");
            }
        } catch (IOException e) {
            log.error("文件删除失败", e);
            return Result.error("文件删除失败: " + e.getMessage());
        }
    }
}
