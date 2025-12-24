import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from '../components/layout/MainLayout'
import AuthRoute from '../components/AuthRoute'
import { Spin } from 'antd'

// 懒加载页面组件
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/user/Login'))
const Register = lazy(() => import('../pages/user/Register'))
const ActivityList = lazy(() => import('../pages/activity/List'))
const ActivityDetail = lazy(() => import('../pages/activity/Detail'))
const ActivityReview = lazy(() => import('../pages/activity/Review'))
const GatheringInfo = lazy(() => import('../pages/activity/Gathering'))
const UserProfile = lazy(() => import('../pages/user/Profile'))
const HikingProfile = lazy(() => import('../pages/user/HikingProfile'))
const ProfileEdit = lazy(() => import('../pages/user/ProfileEdit'))
const MyRegistrations = lazy(() => import('../pages/user/Registrations'))
const MyMessages = lazy(() => import('../pages/user/Messages'))

// 加载组件
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <Spin size="large" />
  </div>
)

// 包装懒加载组件的辅助函数
const lazyWrapper = (Component) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
)

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: lazyWrapper(Home)
      },
      {
        path: 'activities',
        element: lazyWrapper(ActivityList)
      },
      {
        path: 'activities/:id',
        element: lazyWrapper(ActivityDetail)
      },
      // 需要登录的路由
      {
        path: 'user/profile',
        element: lazyWrapper(() => (
          <AuthRoute>
            <UserProfile />
          </AuthRoute>
        ))
      },
      {
        path: 'user/profile/edit',
        element: lazyWrapper(() => (
          <AuthRoute>
            <ProfileEdit />
          </AuthRoute>
        ))
      },
      {
        path: 'user/hiking-profile',
        element: lazyWrapper(() => (
          <AuthRoute>
            <HikingProfile />
          </AuthRoute>
        ))
      },
      {
        path: 'activities/:id/review',
        element: lazyWrapper(() => (
          <AuthRoute>
            <ActivityReview />
          </AuthRoute>
        ))
      },
      {
        path: 'activities/:id/gathering',
        element: lazyWrapper(() => (
          <AuthRoute>
            <GatheringInfo />
          </AuthRoute>
        ))
      },
      {
        path: 'user/registrations',
        element: lazyWrapper(() => (
          <AuthRoute>
            <MyRegistrations />
          </AuthRoute>
        ))
      },
      {
        path: 'user/messages',
        element: lazyWrapper(() => (
          <AuthRoute>
            <MyMessages />
          </AuthRoute>
        ))
      }
    ]
  },
  // 公共路由（不需要主布局）
  {
    path: '/login',
    element: lazyWrapper(Login)
  },
  {
    path: '/register',
    element: lazyWrapper(Register)
  }
])

export default router

