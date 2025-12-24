import request from './request'

/**
 * 管理员相关 API
 */

/**
 * 获取后台首页数据（Dashboard）
 * @returns {Promise} 统计数据
 */
export const getDashboard = () => {
  return request.get('/admin/dashboard')
}

/**
 * 获取用户列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise} 用户列表
 */
export const getUserList = (params) => {
  return request.get('/admin/users', params)
}

/**
 * 禁用/启用用户
 * @param {number} id - 用户ID
 * @param {Object} data - { status: 0-禁用, 1-启用 }
 * @returns {Promise}
 */
export const updateUserStatus = (id, data) => {
  return request.put(`/admin/users/${id}/status`, data)
}

/**
 * 获取待审核活动列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 活动列表
 */
export const getPendingActivities = (params) => {
  return request.get('/admin/activities/audit', params)
}

/**
 * 获取所有活动列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 活动列表
 */
export const getAllActivities = (params) => {
  return request.get('/admin/activities', params)
}

/**
 * 获取用户统计信息
 * @returns {Promise} 用户统计信息
 */
export const getUserStats = () => {
  return request.get('/admin/users/stats')
}

