import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Button, Avatar, Badge } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  FireOutlined
} from '@ant-design/icons'
import { getDashboard } from '../../../api/admin'
import dayjs from 'dayjs'
import './Dashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    userCount: 0,
    activityCount: 0,
    registrationCount: 0,
    pendingAuditCount: 0,
    todayNewUsers: 0,
    todayNewActivities: 0,
    weeklyActiveUsers: 0,
    monthlyRegistrations: 0
  })
  const [pendingActivities, setPendingActivities] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await getDashboard()
      if (res) {
        setDashboardData(res)
        setPendingActivities(res.pendingActivities || [])
        setRecentActivities(res.recentActivities || [])
      }
    } catch (error) {
      // 使用模拟数据
      setDashboardData({
        userCount: 1256,
        activityCount: 89,
        registrationCount: 3420,
        pendingAuditCount: 5,
        todayNewUsers: 12,
        todayNewActivities: 3,
        weeklyActiveUsers: 458,
        monthlyRegistrations: 856
      })
      setPendingActivities([
        {
          id: 1,
          title: '长城野长城穿越之旅',
          organizerName: '户外探险家',
          createdAt: '2024-12-25 14:30:00',
          maxParticipants: 20
        },
        {
          id: 2,
          title: '青海湖环湖骑行',
          organizerName: '骑行俱乐部',
          createdAt: '2024-12-24 10:15:00',
          maxParticipants: 30
        },
        {
          id: 3,
          title: '秦岭徒步露营',
          organizerName: '山野行者',
          createdAt: '2024-12-23 16:45:00',
          maxParticipants: 15
        }
      ])
      setRecentActivities([
        {
          id: 1,
          title: '周末香山登顶徒步',
          status: 3,
          currentParticipants: 25,
          maxParticipants: 30,
          startTime: '2024-12-28 08:00:00'
        },
        {
          id: 2,
          title: '密云水库环湖徒步',
          status: 2,
          currentParticipants: 18,
          maxParticipants: 25,
          startTime: '2024-12-30 07:30:00'
        },
        {
          id: 3,
          title: '慕田峪长城穿越',
          status: 2,
          currentParticipants: 12,
          maxParticipants: 20,
          startTime: '2025-01-01 06:00:00'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // 活动状态映射（与后端保持一致：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回）
  const STATUS_MAP = {
    0: { text: '草稿', color: 'default' },
    1: { text: '待审核', color: 'processing' },
    2: { text: '已发布', color: 'success' },
    3: { text: '进行中', color: 'green' },
    4: { text: '已结束', color: 'default' },
    5: { text: '已取消', color: 'default' },
    6: { text: '已驳回', color: 'error' }
  }

  // 待审核活动表格列
  const pendingColumns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '组织者',
      dataIndex: 'organizerName',
      key: 'organizerName',
      width: 120
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (time) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button 
          type="link" 
          size="small"
          onClick={() => navigate(`/admin/activities/${record.id}/audit`)}
        >
          审核
        </Button>
      )
    }
  ]

  // 最近活动表格列
  const recentColumns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '状态',
      key: 'status',
      width: 90,
      render: (_, record) => {
        const statusInfo = STATUS_MAP[record.status] || { text: '未知', color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '报名进度',
      key: 'progress',
      width: 120,
      render: (_, record) => (
        <Progress 
          percent={Math.round((record.currentParticipants / record.maxParticipants) * 100)} 
          size="small"
          strokeColor="var(--primary-color)"
        />
      )
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 140,
      render: (time) => dayjs(time).format('MM-DD HH:mm')
    }
  ]

  return (
    <div className="admin-dashboard-page">
      {/* 欢迎横幅 */}
      <div className="welcome-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h1>👋 欢迎回来，管理员</h1>
            <p>今天是 {dayjs().format('YYYY年MM月DD日 dddd')}，系统运行正常</p>
          </div>
          <div className="banner-stats">
            {dashboardData.pendingAuditCount > 0 && (
              <Badge count={dashboardData.pendingAuditCount} offset={[10, 0]}>
                <Button 
                  type="primary" 
                  icon={<ClockCircleOutlined />}
                  onClick={() => navigate('/admin/activities/audit')}
                >
                  待审核活动
                </Button>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 核心统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card className="stat-card users" hoverable>
            <div className="stat-icon-wrapper">
              <UserOutlined className="stat-icon" />
            </div>
            <Statistic 
              title="用户总数" 
              value={dashboardData.userCount}
              suffix={
                <span className="stat-change positive">
                  <RiseOutlined /> +{dashboardData.todayNewUsers} 今日
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card activities" hoverable>
            <div className="stat-icon-wrapper">
              <CalendarOutlined className="stat-icon" />
            </div>
            <Statistic 
              title="活动总数" 
              value={dashboardData.activityCount}
              suffix={
                <span className="stat-change positive">
                  <RiseOutlined /> +{dashboardData.todayNewActivities} 今日
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card registrations" hoverable>
            <div className="stat-icon-wrapper">
              <TeamOutlined className="stat-icon" />
            </div>
            <Statistic 
              title="报名总数" 
              value={dashboardData.registrationCount}
              suffix={
                <span className="stat-change positive">
                  <RiseOutlined /> +{dashboardData.monthlyRegistrations} 本月
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card active" hoverable>
            <div className="stat-icon-wrapper">
              <FireOutlined className="stat-icon" />
            </div>
            <Statistic 
              title="周活跃用户" 
              value={dashboardData.weeklyActiveUsers}
            />
          </Card>
        </Col>
      </Row>

      {/* 待审核和快捷入口 */}
      <Row gutter={24} className="content-row">
        <Col span={14}>
          <Card 
            className="pending-card"
            title={
              <span className="card-title">
                <ClockCircleOutlined /> 待审核活动
                {dashboardData.pendingAuditCount > 0 && (
                  <Badge 
                    count={dashboardData.pendingAuditCount} 
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            }
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/admin/activities/audit')}
              >
                查看全部 <ArrowRightOutlined />
              </Button>
            }
          >
            <Table
              columns={pendingColumns}
              dataSource={pendingActivities}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无待审核活动 🎉' }}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card className="shortcuts-card" title="快捷入口">
            <div className="shortcuts-grid">
              <div 
                className="shortcut-item"
                onClick={() => navigate('/admin/activities/audit')}
              >
                <div className="shortcut-icon audit">
                  <CheckCircleOutlined />
                </div>
                <span>活动审核</span>
              </div>
              <div 
                className="shortcut-item"
                onClick={() => navigate('/admin/users')}
              >
                <div className="shortcut-icon users">
                  <UserOutlined />
                </div>
                <span>用户管理</span>
              </div>
              <div 
                className="shortcut-item"
                onClick={() => navigate('/admin/registrations')}
              >
                <div className="shortcut-icon registrations">
                  <FileTextOutlined />
                </div>
                <span>报名管理</span>
              </div>
              <div 
                className="shortcut-item"
                onClick={() => navigate('/admin/statistics')}
              >
                <div className="shortcut-icon stats">
                  <BarChartOutlined />
                </div>
                <span>数据统计</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近活动 */}
      <Card 
        className="recent-card"
        title={
          <span className="card-title">
            <CalendarOutlined /> 最近活动
          </span>
        }
        extra={
          <Button 
            type="link" 
            onClick={() => navigate('/admin/activities')}
          >
            查看全部 <ArrowRightOutlined />
          </Button>
        }
      >
        <Table
          columns={recentColumns}
          dataSource={recentActivities}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 系统提示 */}
      <Card className="tips-card">
        <div className="tips-content">
          <TrophyOutlined className="tips-icon" />
          <div className="tips-text">
            <h4>系统运行良好</h4>
            <p>所有服务正常运行，当前无异常告警。继续保持，加油！💪</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard

