import request from './request'

/**
 * 消息相关 API
 */

/**
 * 获取我的消息列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 消息列表
 */
export const getMyMessages = (params) => {
  return request.get('/user/messages', params)
}

/**
 * 标记消息已读
 * @param {number} id - 消息ID
 * @returns {Promise}
 */
export const markMessageAsRead = (id) => {
  return request.put(`/messages/${id}/read`)
}

/**
 * 获取未读消息数量
 * @returns {Promise} 未读数量
 */
export const getUnreadCount = () => {
  return request.get('/user/messages/unread-count')
}

/**
 * 批量标记已读
 * @returns {Promise}
 */
export const markAllAsRead = () => {
  return request.put('/user/messages/read-all')
}

