/**
 * LocalStorage 存储工具
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const REMEMBER_ME_KEY = 'rememberMe'

// Token 操作
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)?.trim()
}

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token.trim())
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

// 用户信息操作
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const removeUser = () => {
  localStorage.removeItem(USER_KEY)
}

// 记住我功能
export const getRememberMe = () => {
  const rememberMeStr = localStorage.getItem(REMEMBER_ME_KEY)
  return rememberMeStr ? JSON.parse(rememberMeStr) : null
}

export const setRememberMe = (data) => {
  localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(data))
}

export const removeRememberMe = () => {
  localStorage.removeItem(REMEMBER_ME_KEY)
}

// 通用操作
export const get = (key) => {
  const value = localStorage.getItem(key)
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export const set = (key, value) => {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
}

export const remove = (key) => {
  localStorage.removeItem(key)
}

export const clear = () => {
  localStorage.clear()
}

