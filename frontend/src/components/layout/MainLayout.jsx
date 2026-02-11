import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button, Badge, Drawer } from 'antd'
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
  FileTextOutlined,
  CompassOutlined,
  MenuOutlined,
  CloseOutlined,
  AimOutlined
} from '@ant-design/icons'
import { ROLE } from '../../utils/constants'
import { getImageUrl } from '../../utils/imageUrl'
import './MainLayout.css'

const { Header, Content, Footer } = Layout

function MainLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
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
    },
    {
      key: 'my-location',
      icon: <AimOutlined />,
      label: <Link to="/user/my-location">当前位置</Link>
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
      },
      {
        key: 'routes',
        icon: <CompassOutlined />,
        label: <Link to="/organizer/routes">路线管理</Link>
      },
      {
        key: 'create-route',
        icon: <PlusOutlined />,
        label: <Link to="/organizer/route/create">创建路线</Link>
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
        key: 'admin-registrations',
        icon: <FileTextOutlined />,
        label: <Link to="/admin/registrations">报名管理</Link>
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

  // 关闭抽屉并导航
  const drawerNavigate = (path) => {
    setDrawerVisible(false)
    navigate(path)
  }

  // 抽屉菜单项（合并主菜单 + 用户菜单）
  const drawerMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => drawerNavigate('/')
    },
    {
      key: '/activities',
      icon: <CalendarOutlined />,
      label: '活动列表',
      onClick: () => drawerNavigate('/activities')
    }
  ]

  if (isLoggedIn) {
    drawerMenuItems.push(
      { type: 'divider' },
      {
        key: 'user-header',
        type: 'group',
        label: '个人中心'
      },
      {
        key: '/user/profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => drawerNavigate('/user/profile')
      },
      {
        key: '/user/hiking-profile',
        icon: <EnvironmentOutlined />,
        label: '徒步档案',
        onClick: () => drawerNavigate('/user/hiking-profile')
      },
      {
        key: '/user/registrations',
        icon: <TeamOutlined />,
        label: '我的报名',
        onClick: () => drawerNavigate('/user/registrations')
      },
      {
        key: '/user/messages',
        icon: <MessageOutlined />,
        label: '消息通知',
        onClick: () => drawerNavigate('/user/messages')
      }
    )
  }

  if (isOrganizer) {
    drawerMenuItems.push(
      { type: 'divider' },
      {
        key: 'organizer-drawer-header',
        type: 'group',
        label: '组织者功能'
      },
      {
        key: '/organizer/activities',
        icon: <CalendarOutlined />,
        label: '我发布的活动',
        onClick: () => drawerNavigate('/organizer/activities')
      },
      {
        key: '/organizer/activities/create',
        icon: <PlusOutlined />,
        label: '发布新活动',
        onClick: () => drawerNavigate('/organizer/activities/create')
      },
      {
        key: '/organizer/routes',
        icon: <CompassOutlined />,
        label: '路线管理',
        onClick: () => drawerNavigate('/organizer/routes')
      }
    )
  }

  if (isAdmin) {
    drawerMenuItems.push(
      { type: 'divider' },
      {
        key: 'admin-drawer-header',
        type: 'group',
        label: '管理员功能'
      },
      {
        key: '/admin',
        icon: <DashboardOutlined />,
        label: '管理后台',
        onClick: () => drawerNavigate('/admin')
      },
      {
        key: '/admin/activities/audit',
        icon: <FileTextOutlined />,
        label: '活动审核',
        onClick: () => drawerNavigate('/admin/activities/audit')
      },
      {
        key: '/admin/users',
        icon: <TeamOutlined />,
        label: '用户管理',
        onClick: () => drawerNavigate('/admin/users')
      },
      {
        key: '/admin/statistics',
        icon: <BarChartOutlined />,
        label: '数据统计',
        onClick: () => drawerNavigate('/admin/statistics')
      }
    )
  }

  if (isLoggedIn) {
    drawerMenuItems.push(
      { type: 'divider' },
      {
        key: 'logout-drawer',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: () => {
          setDrawerVisible(false)
          handleLogout()
        }
      }
    )
  }

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
                  <Avatar icon={<UserOutlined />} src={currentUser?.avatar ? getImageUrl(currentUser.avatar) : null} />
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
            <Button
              className="mobile-menu-btn"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
            />
          </div>
        </div>
      </Header>

      <Drawer
        title={
          isLoggedIn ? (
            <div className="mobile-drawer-user">
              <Avatar
                size={40}
                icon={<UserOutlined />}
                src={currentUser?.avatar ? getImageUrl(currentUser.avatar) : null}
              />
              <div className="mobile-drawer-user-info">
                <span className="mobile-drawer-username">{currentUser?.nickname || currentUser?.username}</span>
                {getRoleBadge()}
              </div>
            </div>
          ) : (
            <span>🏔️ 户外徒步</span>
          )
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        className="mobile-drawer"
        width={280}
        closeIcon={<CloseOutlined />}
        footer={
          !isLoggedIn ? (
            <div className="mobile-drawer-auth">
              <Button block onClick={() => drawerNavigate('/login')}>
                <LoginOutlined /> 登录
              </Button>
              <Button block type="primary" onClick={() => drawerNavigate('/register')} style={{ marginTop: 8 }}>
                注册
              </Button>
            </div>
          ) : null
        }
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={drawerMenuItems}
          className="mobile-drawer-menu"
        />
      </Drawer>

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
