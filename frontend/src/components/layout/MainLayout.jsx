import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  LogoutOutlined,
  LoginOutlined,
  MessageOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
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
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setCurrentUser(null)
    navigate('/login')
  }

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
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

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
                  <span className="username">{currentUser?.nickname || currentUser?.username}</span>
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

