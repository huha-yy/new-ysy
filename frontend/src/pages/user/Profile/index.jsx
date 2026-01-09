import { useState, useEffect } from 'react'
import { Card, Avatar, Row, Col, Statistic, Button, Tag, Divider, Space, Spin } from 'antd'
import {
  UserOutlined,
  EditOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  TrophyOutlined,
  FireOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HeartOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { getUserInfo } from '../../../api/user'
import { getImageUrl } from '../../../utils/imageUrl'
import './Profile.css'

function Profile() {
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(authUser)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    joinedActivities: 0,
    publishedActivities: 0,
    totalDistance: 0,
    reviews: 0
  })

  useEffect(() => {
    fetchUserInfo()
    fetchStats()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const result = await getUserInfo()
      setUser(result)
      // 更新 localStorage 中的用户信息
      localStorage.setItem('user', JSON.stringify(result))
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败，使用 localStorage 中的数据
      setUser(authUser)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = () => {
    // TODO: 从后端获取统计数据
    // 这里先使用模拟数据
    setStats({
      joinedActivities: 12,
      publishedActivities: authUser?.role >= 1 ? 5 : 0,
      totalDistance: 156,
      reviews: 8
    })
  }

  const getRoleText = (role) => {
    const roleMap = {
      0: '普通用户',
      1: '组织者',
      2: '管理员'
    }
    return roleMap[role] || '未知'
  }

  const getRoleColor = (role) => {
    const colorMap = {
      0: 'default',
      1: 'orange',
      2: 'red'
    }
    return colorMap[role] || 'default'
  }

  const quickActions = [
    {
      icon: <CalendarOutlined />,
      title: '我的活动',
      path: '/user/registrations',
      color: '#1890ff'
    },
    {
      icon: <TeamOutlined />,
      title: '我的报名',
      path: '/user/registrations',
      color: '#52c41a'
    },
    {
      icon: <MessageOutlined />,
      title: '消息通知',
      path: '/user/messages',
      color: '#faad14'
    },
    {
      icon: <EnvironmentOutlined />,
      title: '徒步档案',
      path: '/user/hiking-profile',
      color: '#13c2c2'
    },
    {
      icon: <EditOutlined />,
      title: '编辑资料',
      path: '/user/profile/edit',
      color: '#722ed1'
    },
    {
      icon: <SettingOutlined />,
      title: '账号设置',
      path: '/user/settings',
      color: '#eb2f96'
    }
  ]

  // 如果是组织者，添加组织者相关功能
  if (user?.role >= 1) {
    quickActions.splice(2, 0, {
      icon: <TrophyOutlined />,
      title: '我的发布',
      path: '/organizer/activities',
      color: '#fa8c16'
    })
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="加载中..." />
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* 用户信息卡片 */}
        <Card className="profile-header-card">
          <Row gutter={24} align="middle">
            <Col xs={24} sm={8} md={6} className="avatar-col">
              <Avatar
                size={120}
                src={user?.avatar ? getImageUrl(user.avatar) : null}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
            </Col>
            <Col xs={24} sm={16} md={18}>
              <div className="user-header-info">
                <Space size="middle" align="center">
                  <h2 className="username">{user?.nickname || user?.username}</h2>
                  <Tag color={getRoleColor(user?.role)} icon={<UserOutlined />}>
                    {getRoleText(user?.role)}
                  </Tag>
                  {user?.status === 1 ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>正常</Tag>
                  ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />}>禁用</Tag>
                  )}
                </Space>
                <p className="user-id">ID: {user?.userId}</p>
                <Space size="large" className="user-contact">
                  {user?.phone && (
                    <span><PhoneOutlined /> {user.phone}</span>
                  )}
                  {user?.email && (
                    <span><MailOutlined /> {user.email}</span>
                  )}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 统计数据卡片 */}
        <Card className="stats-card" title={<><FireOutlined /> 我的数据</>}>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Statistic
                title="参加活动"
                value={stats.joinedActivities}
                suffix="次"
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            {user?.role >= 1 && (
              <Col xs={12} sm={6}>
                <Statistic
                  title="发布活动"
                  value={stats.publishedActivities}
                  suffix="个"
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            )}
            <Col xs={12} sm={6}>
              <Statistic
                title="累计里程"
                value={stats.totalDistance}
                suffix="km"
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="获得评价"
                value={stats.reviews}
                suffix="条"
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>
        </Card>

        {/* 基本信息卡片 */}
        <Card className="info-card" title="基本信息">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div className="info-item">
                <span className="info-label">用户名</span>
                <span className="info-value">{user?.username}</span>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="info-item">
                <span className="info-label">昵称</span>
                <span className="info-value">{user?.nickname || '未设置'}</span>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="info-item">
                <span className="info-label">手机号</span>
                <span className="info-value">{user?.phone || '未设置'}</span>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="info-item">
                <span className="info-label">邮箱</span>
                <span className="info-value">{user?.email || '未设置'}</span>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 快捷功能卡片 */}
        <Card className="quick-actions-card" title="快捷功能">
          <Row gutter={[16, 16]}>
            {quickActions.map((action, index) => (
              <Col xs={12} sm={8} md={6} lg={4} key={index}>
                <div
                  className="quick-action-item"
                  onClick={() => navigate(action.path)}
                  style={{ borderColor: action.color }}
                >
                  <div className="action-icon" style={{ color: action.color }}>
                    {action.icon}
                  </div>
                  <div className="action-title">{action.title}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default Profile
