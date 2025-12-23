package com.hiking.hikingbackend.common.exception;

import com.hiking.hikingbackend.common.result.ResultCode;
import lombok.Getter;

/**
 * 自定义业务异常类
 * <p>
 * 用于封装业务逻辑中的异常情况，可以指定错误码和错误消息
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Getter
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 错误码
     */
    private final int code;

    /**
     * 错误消息
     */
    private final String message;

    /**
     * 构造函数（使用默认错误码）
     *
     * @param message 错误消息
     */
    public BusinessException(String message) {
        this(ResultCode.BUSINESS_ERROR.getCode(), message);
    }

    /**
     * 构造函数（指定错误码）
     *
     * @param code    错误码
     * @param message 错误消息
     */
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    /**
     * 构造函数（使用ResultCode枚举）
     *
     * @param resultCode 结果码枚举
     */
    public BusinessException(ResultCode resultCode) {
        this(resultCode.getCode(), resultCode.getMessage());
    }

    /**
     * 构造函数（使用ResultCode枚举，自定义消息）
     *
     * @param resultCode 结果码枚举
     * @param message    自定义错误消息
     */
    public BusinessException(ResultCode resultCode, String message) {
        this(resultCode.getCode(), message);
    }

    /**
     * 构造函数（包含原始异常）
     *
     * @param message   错误消息
     * @param cause     原始异常
     */
    public BusinessException(String message, Throwable cause) {
        this(ResultCode.BUSINESS_ERROR.getCode(), message, cause);
    }

    /**
     * 构造函数（指定错误码，包含原始异常）
     *
     * @param code      错误码
     * @param message   错误消息
     * @param cause     原始异常
     */
    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
    }

    /**
     * 构造函数（使用ResultCode枚举，包含原始异常）
     *
     * @param resultCode 结果码枚举
     * @param cause      原始异常
     */
    public BusinessException(ResultCode resultCode, Throwable cause) {
        this(resultCode.getCode(), resultCode.getMessage(), cause);
    }

    /**
     * 构造函数（使用ResultCode枚举，自定义消息，包含原始异常）
     *
     * @param resultCode 结果码枚举
     * @param message    自定义错误消息
     * @param cause      原始异常
     */
    public BusinessException(ResultCode resultCode, String message, Throwable cause) {
        this(resultCode.getCode(), message, cause);
    }
}

