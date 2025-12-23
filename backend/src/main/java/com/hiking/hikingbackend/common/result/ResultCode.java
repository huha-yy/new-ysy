package com.hiking.hikingbackend.common.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 响应状态码枚举
 * <p>
 * 定义所有API响应的状态码和对应的提示信息
 *
 * @author hiking-system
 * @since 2024-12-23
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    // ========== 通用状态码 (200, 400-500) ==========

    /**
     * 成功
     */
    SUCCESS(200, "操作成功"),

    /**
     * 请求参数错误
     */
    BAD_REQUEST(400, "请求参数错误"),

    /**
     * 未认证
     */
    UNAUTHORIZED(401, "未认证，请先登录"),

    /**
     * 无权限
     */
    FORBIDDEN(403, "无权限访问"),

    /**
     * 资源不存在
     */
    NOT_FOUND(404, "资源不存在"),

    /**
     * 服务器内部错误
     */
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),

    // ========== 用户相关错误 (1001-1999) ==========

    /**
     * 用户不存在
     */
    USER_NOT_FOUND(1001, "用户不存在"),

    /**
     * 用户名已存在
     */
    USERNAME_ALREADY_EXISTS(1002, "用户名已存在"),

    /**
     * 手机号已存在
     */
    PHONE_ALREADY_EXISTS(1003, "手机号已存在"),

    /**
     * 邮箱已存在
     */
    EMAIL_ALREADY_EXISTS(1004, "邮箱已存在"),

    /**
     * 密码错误
     */
    PASSWORD_ERROR(1005, "密码错误"),

    /**
     * 用户已被禁用
     */
    USER_DISABLED(1006, "用户已被禁用"),

    /**
     * 旧密码错误
     */
    OLD_PASSWORD_ERROR(1007, "旧密码错误"),

    /**
     * 验证码错误
     */
    VERIFICATION_CODE_ERROR(1008, "验证码错误"),

    /**
     * 验证码已过期
     */
    VERIFICATION_CODE_EXPIRED(1009, "验证码已过期"),

    // ========== 活动相关错误 (2001-2999) ==========

    /**
     * 活动不存在
     */
    ACTIVITY_NOT_FOUND(2001, "活动不存在"),

    /**
     * 活动已结束
     */
    ACTIVITY_ENDED(2002, "活动已结束"),

    /**
     * 活动已取消
     */
    ACTIVITY_CANCELLED(2003, "活动已取消"),

    /**
     * 活动报名已截止
     */
    ACTIVITY_REGISTRATION_CLOSED(2004, "活动报名已截止"),

    /**
     * 活动人数已满
     */
    ACTIVITY_FULL(2005, "活动人数已满"),

    /**
     * 活动已发布，无法修改
     */
    ACTIVITY_PUBLISHED(2006, "活动已发布，无法修改"),

    /**
     * 活动未发布，无法报名
     */
    ACTIVITY_NOT_PUBLISHED(2007, "活动未发布，无法报名"),

    /**
     * 不是活动组织者
     */
    NOT_ACTIVITY_ORGANIZER(2008, "不是活动组织者"),

    // ========== 报名相关错误 (3001-3999) ==========

    /**
     * 已报名该活动
     */
    ALREADY_REGISTERED(3001, "已报名该活动"),

    /**
     * 报名记录不存在
     */
    REGISTRATION_NOT_FOUND(3002, "报名记录不存在"),

    /**
     * 报名状态不允许取消
     */
    CANNOT_CANCEL_REGISTRATION(3003, "当前状态不允许取消报名"),

    /**
     * 报名记录已审核
     */
    REGISTRATION_ALREADY_AUDITED(3004, "报名记录已审核"),

    /**
     * 年龄不符合要求
     */
    AGE_REQUIREMENT_NOT_MET(3005, "年龄不符合活动要求"),

    /**
     * 经验不符合要求
     */
    EXPERIENCE_REQUIREMENT_NOT_MET(3006, "经验等级不符合活动要求"),

    // ========== 路线相关错误 (4001-4999) ==========

    /**
     * 路线不存在
     */
    ROUTE_NOT_FOUND(4001, "路线不存在"),

    /**
     * 路线已被使用，无法删除
     */
    ROUTE_IN_USE(4002, "路线已被使用，无法删除"),

    // ========== 签到相关错误 (5001-5999) ==========

    /**
     * 签到点不存在
     */
    CHECKPOINT_NOT_FOUND(5001, "签到点不存在"),

    /**
     * 不在签到范围内
     */
    NOT_IN_CHECKIN_RANGE(5002, "不在签到范围内"),

    /**
     * 未报名该活动，无法签到
     */
    NOT_REGISTERED_FOR_ACTIVITY(5003, "未报名该活动，无法签到"),

    /**
     * 活动未开始，无法签到
     */
    ACTIVITY_NOT_STARTED(5004, "活动未开始，无法签到"),

    // ========== 评价相关错误 (6001-6999) ==========

    /**
     * 已评价过该活动
     */
    ALREADY_REVIEWED(6001, "已评价过该活动"),

    /**
     * 评价不存在
     */
    REVIEW_NOT_FOUND(6002, "评价不存在"),

    /**
     * 活动未结束，无法评价
     */
    ACTIVITY_NOT_ENDED(6003, "活动未结束，无法评价"),

    // ========== 文件相关错误 (7001-7999) ==========

    /**
     * 文件上传失败
     */
    FILE_UPLOAD_FAILED(7001, "文件上传失败"),

    /**
     * 文件格式不支持
     */
    FILE_FORMAT_NOT_SUPPORTED(7002, "文件格式不支持"),

    /**
     * 文件大小超出限制
     */
    FILE_SIZE_EXCEEDED(7003, "文件大小超出限制"),

    /**
     * 文件不存在
     */
    FILE_NOT_FOUND(7004, "文件不存在"),

    // ========== 业务异常 (9001-9999) ==========

    /**
     * 业务处理失败
     */
    BUSINESS_ERROR(9001, "业务处理失败"),

    /**
     * 操作失败
     */
    OPERATION_FAILED(9002, "操作失败"),

    /**
     * 系统繁忙
     */
    SYSTEM_BUSY(9003, "系统繁忙，请稍后再试");

    /**
     * 状态码
     */
    private final int code;

    /**
     * 提示信息
     */
    private final String message;

    /**
     * 根据状态码获取枚举
     *
     * @param code 状态码
     * @return ResultCode
     */
    public static ResultCode getByCode(int code) {
        for (ResultCode resultCode : values()) {
            if (resultCode.getCode() == code) {
                return resultCode;
            }
        }
        return INTERNAL_SERVER_ERROR;
    }
}

