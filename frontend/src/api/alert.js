import request from './request'

/**
 * 预警相关 API
 */

/**
 * 获取活动的预警列表
 * @param {number} activityId - 活动ID
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.alertType - 预警类型
 * @param {number} params.alertLevel - 预警级别
 * @param {number} params.handleStatus - 处理状态
 * @returns {Promise} 预警列表
 */
export const getActivityAlerts = (activityId, params) => {
  return request.get(`/activities/${activityId}/alerts`, params)
}

/**
 * 获取预警统计
 * @param {number} activityId - 活动ID
 * @returns {Promise} 预警统计
 */
export const getAlertStats = (activityId) => {
  return request.get(`/activities/${activityId}/alerts/stats`)
}

/**
 * 获取未处理预警数量
 * @param {number} activityId - 活动ID
 * @returns {Promise} 未处理数量
 */
export const getPendingAlertCount = (activityId) => {
  return request.get(`/activities/${activityId}/alerts/pending-count`)
}

/**
 * 处理预警
 * @param {number} alertId - 预警ID
 * @param {Object} data - 处理信息
 * @param {number} data.handleStatus - 处理状态：1处理中 2已处理 3已忽略
 * @param {string} data.handleRemark - 处理备注
 * @returns {Promise}
 */
export const handleAlert = (alertId, data) => {
  return request.put(`/alerts/${alertId}/handle`, data)
}

/**
 * 获取所有预警列表（管理员）
 * @param {Object} params - 查询参数
 * @returns {Promise} 预警列表
 */
export const getAlertList = (params) => {
  return request.get('/admin/alerts', params)
}
