package com.hiking.hikingbackend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 生成 BCrypt 加密密码
 * 用于测试和初始化数据
 */
public class GeneratePassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "123";
        String encodedPassword = encoder.encode(password);

        System.out.println("原始密码: " + password);
        System.out.println("加密后密码: " + encodedPassword);
    }
}

