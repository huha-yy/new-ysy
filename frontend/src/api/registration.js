import request from './request'

/**
 * 报名相关 API
 */

/**
 * 提交报名
 * @param {Object} data - 报名信息 { activityId, remark }
 * @returns {Promise}
 */
export const createRegistration = (data) => {
  return request.post('/registrations', data)
}

/**
 * 审核报名（组织者本人）
 * @param {number} id - 报名ID
 * @param {Object} data - 审核信息 { approved, rejectReason }
 * @returns {Promise}
 */
export const auditRegistration = (id, data) => {
  return request.put(`/registrations/${id}/audit`, data)
}

/**
 * 取消报名
 * @param {number} id - 报名ID
 * @returns {Promise}
 */
export const cancelRegistration = (id) => {
  return request.put(`/registrations/${id}/cancel`)
}

/**
 * 获取活动的报名列表（组织者本人）
 * @param {number} activityId - 活动ID
 * @param {Object} params - 查询参数
 * @returns {Promise} 报名列表
 */
export const getActivityRegistrations = (activityId, params) => {
  return request.get(`/activities/${activityId}/registrations`, params)
}

/**
 * 获取我的报名列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 报名列表
 */
export const getMyRegistrations = (params) => {
  return request.get('/user/registrations', params)
}

