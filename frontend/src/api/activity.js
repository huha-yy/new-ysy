import request from './request'

/**
 * 活动相关 API
 */

/**
 * 获取活动列表（分页）
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 关键词搜索
 * @param {number} params.difficultyLevel - 难度等级
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.pageNum - 页码（从1开始）
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} { records, total, size, current, pages }
 */
export const getActivityList = (params) => {
  return request.get('/activities', params)
}

/**
 * 获取活动详情
 * @param {number} id - 活动ID
 * @returns {Promise} 活动详情
 */
export const getActivityDetail = (id) => {
  return request.get(`/activities/${id}`)
}

/**
 * 发布活动（组织者）
 * @param {Object} data - 活动信息
 * @returns {Promise} 活动ID
 */
export const createActivity = (data) => {
  return request.post('/activities', data)
}

/**
 * 更新活动（组织者本人）
 * @param {number} id - 活动ID
 * @param {Object} data - 活动信息
 * @returns {Promise}
 */
export const updateActivity = (id, data) => {
  return request.put(`/activities/${id}`, data)
}

/**
 * 提交审核（组织者本人）
 * @param {number} id - 活动ID
 * @returns {Promise}
 */
export const submitActivity = (id) => {
  return request.put(`/activities/${id}/submit`)
}

/**
 * 审核活动（管理员）
 * @param {number} id - 活动ID
 * @param {Object} data - 审核信息 { approved, rejectReason }
 * @returns {Promise}
 */
export const auditActivity = (id, data) => {
  return request.put(`/activities/${id}/audit`, data)
}

/**
 * 删除活动（组织者本人）
 * @param {number} id - 活动ID
 * @returns {Promise}
 */
export const deleteActivity = (id) => {
  return request.delete(`/activities/${id}`)
}

/**
 * 取消活动（组织者本人）
 * @param {number} id - 活动ID
 * @returns {Promise}
 */
export const cancelActivity = (id) => {
  return request.put(`/activities/${id}/cancel`)
}

/**
 * 我发布的活动（需登录）
 * @param {Object} params - 查询参数
 * @returns {Promise} 活动列表
 */
export const getMyActivities = (params) => {
  return request.get('/user/activities', params)
}

/**
 * 我参与的活动（需登录）
 * @param {Object} params - 查询参数
 * @returns {Promise} 活动列表
 */
export const getJoinedActivities = (params) => {
  return request.get('/user/joined-activities', params)
}

/**
 * 提交活动评价
 * @param {number} activityId - 活动ID
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
export const submitReview = (activityId, data) => {
  return request.post(`/activities/${activityId}/reviews`, data)
}

/**
 * 提交活动报名
 * @param {number} activityId - 活动ID
 * @param {Object} data - 报名数据 { remark, emergencyContact, emergencyPhone, equipmentConfirm, healthConfirm }
 * @returns {Promise}
 */
export const registerActivity = (activityId, data) => {
  return request.post(`/activities/${activityId}/register`, data)
}

/**
 * 获取我的评价列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 评价列表
 */
export const getMyReviews = (params) => {
  return request.get('/user/reviews', params)
}

/**
 * 获取我的评价统计
 * @returns {Promise} 评价统计
 */
export const getReviewStats = () => {
  return request.get('/user/reviews/stats')
}

/**
 * 获取集合方案
 * @param {number} id - 活动ID
 * @returns {Promise} 集合方案
 */
export const getGatheringPlan = (id) => {
  return request.get(`/activities/${id}/gathering`)
}

/**
 * 创建集合方案（组织者）
 * @param {number} activityId - 活动ID
 * @param {Object} data - 集合方案数据
 * @returns {Promise}
 */
export const createGatheringPlan = (activityId, data) => {
  return request.post(`/activities/${activityId}/gathering`, data)
}

/**
 * 更新集合方案（组织者）
 * @param {number} activityId - 活动ID
 * @param {Object} data - 集合方案数据
 * @returns {Promise}
 */
export const updateGatheringPlan = (activityId, data) => {
  return request.put(`/activities/${activityId}/gathering`, data)
}

/**
 * 发布集合方案（组织者）
 * @param {number} id - 活动ID
 * @returns {Promise}
 */
export const publishGatheringPlan = (id) => {
  return request.put(`/activities/${id}/gathering/publish`)
}

/**
 * 启动活动（组织者）
 * @param {number} id - 活动ID
 * @returns {Promise}
 */
export const startActivity = (id) => {
  return request.post(`/activities/${id}/start`)
}

/**
 * 结束活动（组织者）
 * @param {number} id - 活动ID
 * @returns {Promise}
 */
export const endActivity = (id) => {
  return request.post(`/activities/${id}/end`)
}
