/**
 * 常量定义
 */

// 用户角色
export const ROLE = {
  USER: 0,      // 普通用户
  ORGANIZER: 1, // 组织者
  ADMIN: 2      // 管理员
}

// 活动状态
export const ACTIVITY_STATUS = {
  DRAFT: 0,      // 草稿
  PENDING: 1,    // 待审核
  APPROVED: 2,   // 已通过
  REJECTED: 3,   // 已驳回
  PUBLISHED: 4,  // 已发布
  CANCELLED: 5,  // 已取消
  COMPLETED: 6,   // 已结束
  IN_PROGRESS: 7 // 进行中
}

// 报名状态
export const REGISTRATION_STATUS = {
  PENDING: 0,    // 待审核
  APPROVED: 1,   // 已通过
  REJECTED: 2,   // 已拒绝
  CANCELLED: 3   // 已取消
}

// 难度等级
export const DIFFICULTY = {
  EASY: 1,    // 休闲
  SIMPLE: 2,  // 简单
  MEDIUM: 3,  // 中等
  HARD: 4,    // 困难
  EXTREME: 5  // 极限
}

export const DIFFICULTY_MAP = {
  1: '休闲',
  2: '简单',
  3: '中等',
  4: '困难',
  5: '极限'
}

// 签到状态
export const CHECKIN_STATUS = {
  PENDING: 0,  // 待签到
  COMPLETED: 1 // 已签到
}

