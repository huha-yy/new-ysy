import request from './request'

/**
 * 签到相关 API
 */

/**
 * GPS签到
 * @param {number} activityId - 活动ID
 * @param {Object} data - 签到信息 { checkpointId, latitude, longitude }
 * @returns {Promise}
 */
export const checkin = (activityId, data) => {
  return request.post(`/checkin?activityId=${activityId}`, data)
}

/**
 * 获取签到状态
 * @param {number} activityId - 活动ID
 * @returns {Promise} 签到状态
 */
export const getCheckinStatus = (activityId) => {
  return request.get(`/activities/${activityId}/checkin-status`)
}

/**
 * 获取签到点列表
 * @param {number} activityId - 活动ID
 * @returns {Promise} 签到点列表
 */
export const getCheckpoints = (activityId) => {
  return request.get(`/activities/${activityId}/checkpoints`)
}

/**
 * 轨迹上报
 * @param {Object} data - 轨迹信息 { activityId, latitude, longitude, timestamp }
 * @returns {Promise}
 */
export const reportTrack = (data) => {
  return request.post('/track/report', data)
}

