import request from './request'

/**
 * 获取路线列表
 */
export const getRouteList = (params) => {
  return request.get('/routes', { params })
}

/**
 * 获取我的路线列表（组织者专用）
 */
export const getMyRoutes = (params) => {
  return request.get('/organizer/routes', { params })
}

/**
 * 获取路线详情
 */
export const getRouteDetail = (id) => {
  return request.get(`/routes/${id}`)
}

/**
 * 创建路线
 */
export const createRoute = (data) => {
  return request.post('/routes', data)
}

/**
 * 更新路线
 */
export const updateRoute = (id, data) => {
  return request.put(`/routes/${id}`, data)
}

/**
 * 删除路线
 */
export const deleteRoute = (id) => {
  return request.delete(`/routes/${id}`)
}

/**
 * 添加签到点
 */
export const addCheckpoint = (routeId, data) => {
  return request.post(`/routes/${routeId}/checkpoints`, data)
}

/**
 * 获取路线签到点列表
 */
export const getRouteCheckpoints = (routeId) => {
  return request.get(`/routes/${routeId}/checkpoints`)
}

