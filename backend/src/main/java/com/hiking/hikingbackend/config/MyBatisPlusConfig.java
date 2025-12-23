package com.hiking.hikingbackend.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.BlockAttackInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus 配置类
 * <p>
 * 配置内容：
 * <ul>
 *   <li>分页插件</li>
 *   <li>乐观锁插件</li>
 *   <li>防止全表更新删除插件</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Configuration
@MapperScan("com.hiking.hikingbackend.module.*.mapper")
public class MyBatisPlusConfig {

    /**
     * MyBatis-Plus 拦截器配置
     *
     * @return MybatisPlusInterceptor
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 1. 分页插件
        // 使用MySQL数据库，设置数据库类型
        PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        // 设置最大单页限制数量，默认 500 条，-1 不受限制
        paginationInnerInterceptor.setMaxLimit(500L);
        // 溢出总页数后是否进行处理（默认不处理）
        paginationInnerInterceptor.setOverflow(false);
        interceptor.addInnerInterceptor(paginationInnerInterceptor);

        // 2. 乐观锁插件
        // 当要更新一条记录的时候，希望这条记录没有被别人更新
        // 需要在实体类的字段上添加 @Version 注解
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());

        // 3. 防止全表更新和删除插件
        // 拦击并解析全表update和delete语句，防止误操作
        interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());

        return interceptor;
    }
}

