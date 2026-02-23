import axios from 'axios'
import { message } from 'antd'
import { getToken, removeToken, removeUser } from '../utils/storage'

/**
 * Axios 实例配置
 */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token.trim()}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res.code === 200) {
      return res.data
    } else if (res.code === 401) {
      message.error('登录已过期，请重新登录')
      removeToken()
      removeUser()
      return Promise.reject(new Error(res.message || '未授权'))
    } else {
      if (!response.config.silentError) {
        message.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    if (error.config?.silentError) {
      return Promise.reject(error)
    }

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message.error('请求参数错误')
          break
        case 401:
          message.error('未授权，请重新登录')
          removeToken()
          removeUser()
          break
        case 403:
          message.error('拒绝访问：登录已过期或权限不足')
          removeToken()
          removeUser()
          break
        case 404:
          message.error('请求资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(`网络错误: ${error.response.status}`)
      }
    } else if (error.request) {
      message.error('网络连接失败，请检查网络')
    } else {
      message.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

/**
 * 导出常用的请求方法
 */
export default {
  get: (url, params, config) => {
    return request.get(url, { params, ...config })
  },

  post: (url, data, config) => {
    return request.post(url, data, config)
  },

  put: (url, data, config) => {
    return request.put(url, data, config)
  },

  delete: (url, config) => {
    return request.delete(url, config)
  },

  patch: (url, data, config) => {
    return request.patch(url, data, config)
  }
}
