package com.hiking.hikingbackend.common.result;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 统一响应封装类
 * <p>
 * 统一API响应格式：
 * <pre>
 * {
 *     "code": 200,
 *     "message": "操作成功",
 *     "data": {},
 *     "timestamp": 1703318400000
 * }
 * </pre>
 *
 * @param <T> 数据类型
 * @author hiking-system
 * @since 2024-12-23
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 响应状态码
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 时间戳
     */
    private Long timestamp;

    /**
     * 构造函数
     *
     * @param code    状态码
     * @param message 消息
     */
    public Result(Integer code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    /**
     * 构造函数
     *
     * @param code    状态码
     * @param message 消息
     * @param data    数据
     */
    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }

    // ========== 成功响应 ==========

    /**
     * 成功响应（无数据）
     *
     * @param <T> 数据类型
     * @return Result
     */
    public static <T> Result<T> success() {
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage());
    }

    /**
     * 成功响应（带数据）
     *
     * @param data 数据
     * @param <T>  数据类型
     * @return Result
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), data);
    }

    /**
     * 成功响应（自定义消息）
     *
     * @param message 消息
     * @param <T>     数据类型
     * @return Result
     */
    public static <T> Result<T> success(String message) {
        return new Result<>(ResultCode.SUCCESS.getCode(), message);
    }

    /**
     * 成功响应（自定义消息和数据）
     *
     * @param message 消息
     * @param data    数据
     * @param <T>     数据类型
     * @return Result
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), message, data);
    }

    // ========== 失败响应 ==========

    /**
     * 失败响应（默认错误）
     *
     * @param <T> 数据类型
     * @return Result
     */
    public static <T> Result<T> error() {
        return new Result<>(ResultCode.INTERNAL_SERVER_ERROR.getCode(), ResultCode.INTERNAL_SERVER_ERROR.getMessage());
    }

    /**
     * 失败响应（自定义状态码）
     *
     * @param code 状态码
     * @param <T>  数据类型
     * @return Result
     */
    public static <T> Result<T> error(int code) {
        ResultCode resultCode = ResultCode.getByCode(code);
        return new Result<>(code, resultCode.getMessage());
    }

    /**
     * 失败响应（自定义消息）
     *
     * @param message 消息
     * @param <T>     数据类型
     * @return Result
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(ResultCode.INTERNAL_SERVER_ERROR.getCode(), message);
    }

    /**
     * 失败响应（自定义状态码和消息）
     *
     * @param code    状态码
     * @param message 消息
     * @param <T>     数据类型
     * @return Result
     */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message);
    }

    /**
     * 失败响应（使用ResultCode枚举）
     *
     * @param resultCode 结果码枚举
     * @param <T>        数据类型
     * @return Result
     */
    public static <T> Result<T> error(ResultCode resultCode) {
        return new Result<>(resultCode.getCode(), resultCode.getMessage());
    }

    /**
     * 失败响应（使用ResultCode枚举，自定义消息）
     *
     * @param resultCode 结果码枚举
     * @param message    自定义消息
     * @param <T>        数据类型
     * @return Result
     */
    public static <T> Result<T> error(ResultCode resultCode, String message) {
        return new Result<>(resultCode.getCode(), message);
    }

    // ========== 判断方法 ==========

    /**
     * 判断是否成功
     *
     * @return true成功，false失败
     */
    public boolean isSuccess() {
        return ResultCode.SUCCESS.getCode() == this.code;
    }

    /**
     * 判断是否失败
     *
     * @return true失败，false成功
     */
    public boolean isError() {
        return !isSuccess();
    }
}

