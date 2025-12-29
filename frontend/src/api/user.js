import request from './request'

/**
 * 用户相关 API
 */

/**
 * 用户注册
 * @param {Object} data - { username, password, confirmPassword, phone, email }
 * @returns {Promise} { token, userId, username, nickname, avatar, role, status }
 */
export const register = (data) => {
  return request.post('/auth/register', data)
}

/**
 * 用户登录
 * @param {Object} data - { username, password }
 * @returns {Promise} { token, tokenType, userId, username, nickname, avatar, role, status }
 */
export const login = (data) => {
  return request.post('/auth/login', data)
}

/**
 * 获取当前用户信息
 * @returns {Promise} 用户信息
 */
export const getUserInfo = () => {
  return request.get('/user/info')
}

/**
 * 更新用户档案
 * @param {Object} data - 用户档案信息
 * @returns {Promise}
 */
export const updateProfile = (data) => {
  return request.put('/user/profile', data)
}

/**
 * 获取用户档案
 * @returns {Promise} 用户档案信息
 */
export const getProfile = () => {
  return request.get('/user/profile')
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export const updateUserInfo = (data) => {
  return request.put('/user/info', data)
}

