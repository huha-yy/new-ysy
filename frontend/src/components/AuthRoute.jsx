import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../utils/storage'
import { Spin } from 'antd'

/**
 * 路由守卫组件
 * 需要登录的页面使用此组件包裹
 */
const AuthRoute = ({ children }) => {
  const location = useLocation()
  const token = getToken()

  if (!token) {
    // 未登录，跳转到登录页
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 已登录，渲染子组件
  return children
}

export default AuthRoute

