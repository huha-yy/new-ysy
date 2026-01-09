package com.hiking.hikingbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 户外徒步活动管理系统 - 启动类
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@SpringBootApplication
@EnableScheduling
public class HikingApplication {

    public static void main(String[] args) {
        SpringApplication.run(HikingApplication.class, args);
        System.out.println("========================================");
        System.out.println("户外徒步活动管理系统启动成功！");
        System.out.println("API文档地址: http://localhost:8080/api/doc.html");
        System.out.println("Swagger地址: http://localhost:8080/api/swagger-ui.html");
        System.out.println("========================================");
    }
}

