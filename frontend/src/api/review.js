import request from './request'

/**
 * 评价相关 API
 */

/**
 * 获取活动的评价列表
 * @param {number} activityId - 活动ID
 * @param {Object} params - 查询参数
 * @param {string} params.pageNum - 页码（从1开始）
 * @param {string} params.pageSize - 每页数量
 * @returns {Promise} { records, total, size, current, pages }
 */
export const getActivityReviews = (activityId, params) => {
  return request.get(`/activities/${activityId}/reviews`, params)
}

/**
 * 提交活动评价
 * @param {number} activityId - 活动ID
 * @param {Object} data - 评价数据
 * @param {number} data.overallRating - 整体评分（1-5星）
 * @param {number} data.routeRating - 路线评分（1-5星）
 * @param {number} data.organizationRating - 组织评分（1-5星）
 * @param {number} data.safetyRating - 安全评分（1-5星）
 * @param {string} data.content - 评价内容
 * @param {boolean} data.isAnonymous - 是否匿名
 * @param {Array} data.images - 评价图片（Base64）
 * @returns {Promise}
 */
export const submitReview = (activityId, data) => {
  return request.post(`/activities/${activityId}/reviews`, data)
}

/**
 * 获取我的评价列表（需登录）
 * @param {Object} params - 查询参数
 * @param {string} params.pageNum - 页码（从1开始）
 * @param {string} params.pageSize - 每页数量
 * @returns {Promise} 评价列表
 */
export const getMyReviews = (params) => {
  return request.get('/user/reviews', params)
}

/**
 * 获取我的评价统计（需登录）
 * @returns {Promise} 评价统计
 */
export const getReviewStats = () => {
  return request.get('/user/reviews/stats')
}

/**
 * 删除评价
 * @param {number} reviewId - 评价ID
 * @returns {Promise}
 */
export const deleteReview = (reviewId) => {
  return request.delete(`/user/reviews/${reviewId}`)
}

/**
 * 编辑评价
 * @param {number} reviewId - 评价ID
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
export const updateReview = (reviewId, data) => {
  return request.put(`/user/reviews/${reviewId}`, data)
}

/**
 * 获取活动评分统计
 * @param {number} activityId - 活动ID
 * @returns {Promise} 评分统计
 */
export const getActivityRatingStats = (activityId) => {
  return request.get(`/activities/${activityId}/rating-stats`)
}

