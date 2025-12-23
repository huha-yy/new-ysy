package com.hiking.hikingbackend.common.exception;

import com.hiking.hikingbackend.common.result.Result;
import com.hiking.hikingbackend.common.result.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * <p>
 * 统一处理系统中的各类异常，统一返回Result格式
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     *
     * @param e 业务异常
     * @return Result
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.error("业务异常：{}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常（@Valid）
     *
     * @param e 方法参数校验异常
     * @return Result
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        // 获取所有字段错误信息
        String errorMessage = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        log.error("参数校验异常：{}", errorMessage);
        return Result.error(ResultCode.BAD_REQUEST.getCode(), errorMessage);
    }

    /**
     * 处理绑定异常（@Validated）
     *
     * @param e 绑定异常
     * @return Result
     */
    @ExceptionHandler(BindException.class)
    public Result<?> handleBindException(BindException e) {
        // 获取所有字段错误信息
        String errorMessage = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        log.error("参数绑定异常：{}", errorMessage);
        return Result.error(ResultCode.BAD_REQUEST.getCode(), errorMessage);
    }

    /**
     * 处理非法参数异常
     *
     * @param e 非法参数异常
     * @return Result
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public Result<?> handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("非法参数异常：{}", e.getMessage());
        return Result.error(ResultCode.BAD_REQUEST.getCode(), e.getMessage());
    }

    /**
     * 处理静态资源未找到异常（如favicon.ico）
     * 这个异常不影响业务，静默处理，不输出错误日志
     *
     * @param e 静态资源未找到异常
     * @return void
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public void handleNoResourceFoundException(NoResourceFoundException e) {
        // 浏览器访问Swagger UI时会自动请求favicon.ico，项目中没有该文件属于正常现象
        // 这个异常不影响业务功能，不输出错误日志
        log.debug("静态资源未找到：{}", e.getResourcePath());
    }

    /**
     * 处理空指针异常
     *
     * @param e 空指针异常
     * @return Result
     */
    @ExceptionHandler(NullPointerException.class)
    public Result<?> handleNullPointerException(NullPointerException e) {
        log.error("空指针异常", e);
        return Result.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "服务器内部错误");
    }

    /**
     * 处理其他未捕获的异常
     *
     * @param e 异常
     * @return Result
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error(ResultCode.INTERNAL_SERVER_ERROR.getCode(), "服务器内部错误");
    }
}

