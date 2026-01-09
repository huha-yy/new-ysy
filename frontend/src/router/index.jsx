import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import MainLayout from '../components/layout/MainLayout'
import AuthRoute from '../components/AuthRoute'
import ErrorBoundary from '../components/ErrorBoundary'
import { Spin } from 'antd'

// 懒加载页面组件 - 公共页面
const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/user/Login'))
const Register = lazy(() => import('../pages/user/Register'))
const ActivityList = lazy(() => import('../pages/activity/List'))
const ActivityDetail = lazy(() => import('../pages/activity/Detail/detail'))
const NotFound = lazy(() => import('../pages/NotFound'))

// 懒加载页面组件 - 用户页面
const ActivityReview = lazy(() => import('../pages/activity/Review'))
const GatheringInfo = lazy(() => import('../pages/activity/Gathering'))

const CheckInPage = lazy(() => import('../pages/activity/CheckIn'))
const UserProfile = lazy(() => import('../pages/user/Profile'))
const HikingProfile = lazy(() => import('../pages/user/HikingProfile'))
const ProfileEdit = lazy(() => import('../pages/user/ProfileEdit'))
const MyRegistrations = lazy(() => import('../pages/user/Registrations'))
const MyMessages = lazy(() => import('../pages/user/Messages'))

// 懒加载页面组件 - 组织者页面
const OrganizerMyActivities = lazy(() => import('../pages/organizer/MyActivities'))
const OrganizerActivityForm = lazy(() => import('../pages/organizer/ActivityForm'))
const OrganizerRegistrationReview = lazy(() => import('../pages/organizer/RegistrationReview'))
const OrganizerCheckinMonitor = lazy(() => import('../pages/organizer/CheckinMonitor'))

const OrganizerRoutes = lazy(() => import('../pages/organizer/Routes'))
const OrganizerRouteCreate = lazy(() => import('../pages/organizer/RouteCreate'))
const OrganizerRouteEdit = lazy(() => import('../pages/organizer/RouteEdit'))
const OrganizerGatheringPlan = lazy(() => import('../pages/organizer/GatheringPlan'))
const OrganizerAlertMonitor = lazy(() => import('../pages/organizer/AlertMonitor'))

// 懒加载页面组件 - 管理员页面
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const AdminActivityAudit = lazy(() => import('../pages/admin/ActivityAudit'))
const AdminUserManage = lazy(() => import('../pages/admin/UserManage'))
const AdminStatistics = lazy(() => import('../pages/admin/Statistics'))
const AdminRegistrationManage = lazy(() => import('../pages/admin/RegistrationManage'))

// 加载组件
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <Spin size="large" />
  </div>
)

// 错误包装组件
const ErrorWrapper = ({ children }) => (
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
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
    element: (
      <ErrorBoundary>
        <MainLayout />
      </ErrorBoundary>
    ),
    children: [
      // ========== 公共路由 ==========
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
      
      // ========== 用户路由（需要登录）==========
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
        path: 'activities/:id/checkin',
        element: lazyWrapper(() => (
          <AuthRoute>
            <CheckInPage />
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
      },
      
      // ========== 组织者路由 ==========
      {
        path: 'organizer/activities',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerMyActivities />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/activities/create',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerActivityForm />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/activities/:id/edit',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerActivityForm />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/activities/:id/registrations',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerRegistrationReview />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/activities/:id/checkin',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerCheckinMonitor />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/routes',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerRoutes />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/route/create',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerRouteCreate />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/route/:id/edit',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerRouteEdit />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/activities/:id/gathering',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerGatheringPlan />
          </AuthRoute>
        ))
      },
      {
        path: 'organizer/activities/:id/alerts',
        element: lazyWrapper(() => (
          <AuthRoute>
            <OrganizerAlertMonitor />
          </AuthRoute>
        ))
      },
      
      // ========== 管理员路由 ==========
      {
        path: 'admin',
        element: lazyWrapper(() => (
          <AuthRoute>
            <AdminDashboard />
          </AuthRoute>
        ))
      },
      {
        path: 'admin/dashboard',
        element: lazyWrapper(() => (
          <AuthRoute>
            <AdminDashboard />
          </AuthRoute>
        ))
      },
      {
        path: 'admin/activities',
        element: lazyWrapper(() => (
          <AuthRoute>
            <AdminActivityAudit />
          </AuthRoute>
        ))
      },
      {
        path: 'admin/activities/audit',
        element: lazyWrapper(() => (
          <AuthRoute>
            <AdminActivityAudit />
          </AuthRoute>
        ))
      },
      {
        path: 'admin/users',
        element: lazyWrapper(() => (
          <AuthRoute>
            <AdminUserManage />
          </AuthRoute>
        ))
      },
      {
        path: 'admin/statistics',
        element: lazyWrapper(() => (
          <AuthRoute>
            <AdminStatistics />
          </AuthRoute>
        ))
      },
      {
        path: 'admin/registrations',
        element: lazyWrapper(() => (
          <AuthRoute>
            <AdminRegistrationManage />
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
  },
  // 404 路由（放在最后）
  {
    path: '*',
    element: lazyWrapper(() => (
      <ErrorBoundary>
        <NotFound />
      </ErrorBoundary>
    ))
  }
])

export default router
