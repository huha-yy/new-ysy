import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button, Badge } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  LogoutOutlined,
  LoginOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  SettingOutlined,
  DashboardOutlined,
  BarChartOutlined,
  CrownOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { ROLE } from '../../utils/constants'
import './MainLayout.css'

const { Header, Content, Footer } = Layout

function MainLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
      setCurrentUser(JSON.parse(user))
    }
  }, [location]) // 路由变化时重新检查登录状态

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setCurrentUser(null)
    navigate('/login')
  }

  // 判断用户角色
  const isOrganizer = currentUser?.role === ROLE.ORGANIZER || currentUser?.role === ROLE.ADMIN
  const isAdmin = currentUser?.role === ROLE.ADMIN

  // 主导航菜单
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>
    },
    {
      key: '/activities',
      icon: <CalendarOutlined />,
      label: <Link to="/activities">活动列表</Link>
    }
  ]

  // 如果是组织者，添加组织者菜单
  if (isOrganizer) {
    menuItems.push({
      key: '/organizer/activities',
      icon: <PlusOutlined />,
      label: <Link to="/organizer/activities">我的活动</Link>
    })
  }

  // 如果是管理员，添加管理菜单
  if (isAdmin) {
    menuItems.push({
      key: '/admin',
      icon: <CrownOutlined />,
      label: <Link to="/admin">管理后台</Link>
    })
  }

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/user/profile">个人中心</Link>
    },
    {
      key: 'hiking-profile',
      icon: <EnvironmentOutlined />,
      label: <Link to="/user/hiking-profile">徒步档案</Link>
    },
    {
      key: 'registrations',
      icon: <TeamOutlined />,
      label: <Link to="/user/registrations">我的报名</Link>
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: <Link to="/user/messages">消息通知</Link>
    }
  ]

  // 如果是组织者，添加组织者相关菜单
  if (isOrganizer) {
    userMenuItems.push(
      { type: 'divider' },
      {
        key: 'organizer-header',
        type: 'group',
        label: '组织者功能'
      },
      {
        key: 'my-activities',
        icon: <CalendarOutlined />,
        label: <Link to="/organizer/activities">我发布的活动</Link>
      },
      {
        key: 'create-activity',
        icon: <PlusOutlined />,
        label: <Link to="/organizer/activities/create">发布新活动</Link>
      }
    )
  }

  // 如果是管理员，添加管理员相关菜单
  if (isAdmin) {
    userMenuItems.push(
      { type: 'divider' },
      {
        key: 'admin-header',
        type: 'group',
        label: '管理员功能'
      },
      {
        key: 'admin-dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/admin">管理后台</Link>
      },
      {
        key: 'admin-activities',
        icon: <FileTextOutlined />,
        label: <Link to="/admin/activities/audit">活动审核</Link>
      },
      {
        key: 'admin-users',
        icon: <TeamOutlined />,
        label: <Link to="/admin/users">用户管理</Link>
      },
      {
        key: 'admin-stats',
        icon: <BarChartOutlined />,
        label: <Link to="/admin/statistics">数据统计</Link>
      }
    )
  }

  // 添加退出登录
  userMenuItems.push(
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true
    }
  )

  // 获取角色标签
  const getRoleBadge = () => {
    if (isAdmin) {
      return <span className="role-badge admin">管理员</span>
    }
    if (isOrganizer) {
      return <span className="role-badge organizer">组织者</span>
    }
    return null
  }

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            🏔️ 户外徒步
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="header-menu"
          />
          <div className="header-actions">
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-info">
                  <Avatar icon={<UserOutlined />} src={currentUser?.avatar} />
                  <div className="user-text">
                    <span className="username">{currentUser?.nickname || currentUser?.username}</span>
                    {getRoleBadge()}
                  </div>
                </div>
              </Dropdown>
            ) : (
              <div className="auth-buttons">
                <Button type="text" onClick={() => navigate('/login')}>
                  <LoginOutlined /> 登录
                </Button>
                <Button type="primary" onClick={() => navigate('/register')}>
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>
      <Content className="main-content">
        <Outlet />
      </Content>
      <Footer className="main-footer">
        <div className="container">
          户外徒步活动管理系统 ©2024 Created for Hiking System
        </div>
      </Footer>
    </Layout>
  )
}

export default MainLayout
