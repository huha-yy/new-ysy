import { useState, useEffect } from 'react'
import { getUser, getToken, removeToken, removeUser } from '../utils/storage'

/**
 * 认证相关的自定义 Hook
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLogin, setIsLogin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkLogin()
  }, [])

  const checkLogin = () => {
    const token = getToken()
    const userInfo = getUser()

    if (token && userInfo) {
      setUser(userInfo)
      setIsLogin(true)
    } else {
      setUser(null)
      setIsLogin(false)
    }
    setLoading(false)
  }

  const login = (token, userInfo) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userInfo))
    setUser(userInfo)
    setIsLogin(true)
  }

  const logout = () => {
    removeToken()
    removeUser()
    setUser(null)
    setIsLogin(false)
  }

  return {
    user,
    isLogin,
    loading,
    isOrganizer: user?.role === 1,
    isAdmin: user?.role === 2,
    login,
    logout
  }
}

