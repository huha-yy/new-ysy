package com.hiking.hikingbackend.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * MyBatis-Plus 自动填充处理器
 * <p>
 * 自动填充公共字段：
 * <ul>
 *   <li>create_time: 插入时自动填充当前时间</li>
 *   <li>update_time: 插入和更新时自动填充当前时间</li>
 *   <li>create_by: 插入时自动填充当前用户ID</li>
 *   <li>update_by: 更新时自动填充当前用户ID</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    /**
     * 插入数据时自动填充
     *
     * @param metaObject 元对象
     */
    @Override
    public void insertFill(MetaObject metaObject) {
        log.debug("开始插入填充...");

        // 自动填充创建时间
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());

        // 自动填充更新时间
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());

        // 自动填充创建人ID（暂时使用0，后续集成Security后可从SecurityContext获取）
        this.strictInsertFill(metaObject, "createBy", Long.class, getCurrentUserId());

        // 自动填充更新人ID（暂时使用0，后续集成Security后可从SecurityContext获取）
        this.strictInsertFill(metaObject, "updateBy", Long.class, getCurrentUserId());
    }

    /**
     * 更新数据时自动填充
     *
     * @param metaObject 元对象
     */
    @Override
    public void updateFill(MetaObject metaObject) {
        log.debug("开始更新填充...");

        // 自动填充更新时间
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());

        // 自动填充更新人ID（暂时使用0，后续集成Security后可从SecurityContext获取）
        this.strictUpdateFill(metaObject, "updateBy", Long.class, getCurrentUserId());
    }

    /**
     * 获取当前用户ID
     * <p>
     * 暂时返回0，后续集成Spring Security后可以从SecurityContext获取
     *
     * @return 用户ID
     */
    private Long getCurrentUserId() {
        // TODO: 集成Spring Security后，从SecurityContext获取当前登录用户ID
        // 示例代码：
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // if (authentication != null && authentication.isAuthenticated()) {
        //     CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        //     return userDetails.getUserId();
        // }
        return 0L;
    }
}

