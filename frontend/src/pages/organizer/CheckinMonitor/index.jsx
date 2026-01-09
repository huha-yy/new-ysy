import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Card, Row, Col, Progress, Table, Tag, Space, Button, 
  Avatar, Statistic, Timeline, Badge, Empty, Tooltip, message
} from 'antd'
import {
  LeftOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ReloadOutlined,
  PhoneOutlined,
  WarningOutlined,
  SyncOutlined
} from '@ant-design/icons'
import { getActivityDetail } from '../../../api/activity'
import { getCheckinStatus, getCheckpoints } from '../../../api/checkin'
import { getActivityRegistrations } from '../../../api/registration'
import dayjs from 'dayjs'
import MapView from '../../../components/MapView/MapView'
import './CheckinMonitor.css'

function CheckinMonitor() {
  const navigate = useNavigate()
  const { id: activityId } = useParams()
  
  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState(null)
  const [checkpoints, setCheckpoints] = useState([])
  const [participants, setParticipants] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lng: 116.397428, lat: 39.90923 })

  useEffect(() => {
    fetchData()
    // 设置自动刷新
    const interval = setInterval(fetchData, 30000) // 每30秒刷新
    return () => clearInterval(interval)
  }, [activityId])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchActivityInfo(),
        fetchCheckpoints(),
        fetchParticipants()
      ])
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityInfo = async () => {
    try {
      const res = await getActivityDetail(activityId)
      setActivity(res)
    } catch (error) {
      // 模拟数据
      setActivity({
        id: activityId,
        title: '周末香山登顶徒步',
        startTime: '2024-12-28 08:00:00',
        endTime: '2024-12-28 18:00:00',
        currentParticipants: 25,
        maxParticipants: 30,
        status: 7 // 进行中
      })
    }
  }

  const fetchCheckpoints = async () => {
    try {
      const res = await getCheckpoints(activityId)
      setCheckpoints(res || [])
    } catch (error) {
      // 模拟数据
      setCheckpoints([
        { id: 1, name: '起点-香山公园东门', order: 1, checkedCount: 23, totalCount: 25 },
        { id: 2, name: '途经点-望京楼', order: 2, checkedCount: 18, totalCount: 25 },
        { id: 3, name: '途经点-森林栈道', order: 3, checkedCount: 12, totalCount: 25 },
        { id: 4, name: '终点-香炉峰', order: 4, checkedCount: 5, totalCount: 25 }
      ])
    }
  }

  const fetchParticipants = async () => {
    try {
      const res = await getActivityRegistrations(activityId, { status: 1 })
      setParticipants(res?.records || res?.list || res || [])
    } catch (error) {
      // 模拟数据
      setParticipants([
        {
          id: 1,
          userId: 101,
          nickname: '登山爱好者',
          avatar: null,
          phone: '138****1234',
          checkinStatus: [1, 1, 1, 1], // 4个签到点的状态
          lastCheckin: '2024-12-28 14:30:00',
          lastLocation: '香炉峰'
        },
        {
          id: 2,
          userId: 102,
          nickname: '户外达人',
          avatar: null,
          phone: '137****4567',
          checkinStatus: [1, 1, 1, 0],
          lastCheckin: '2024-12-28 12:15:00',
          lastLocation: '森林栈道'
        },
        {
          id: 3,
          userId: 103,
          nickname: '自然探索者',
          avatar: null,
          phone: '135****7890',
          checkinStatus: [1, 1, 0, 0],
          lastCheckin: '2024-12-28 10:30:00',
          lastLocation: '望京楼'
        },
        {
          id: 4,
          userId: 104,
          nickname: '山野行者',
          avatar: null,
          phone: '136****2345',
          checkinStatus: [1, 0, 0, 0],
          lastCheckin: '2024-12-28 08:15:00',
          lastLocation: '起点'
        },
        {
          id: 5,
          userId: 105,
          nickname: '新手探险家',
          avatar: null,
          phone: '139****6789',
          checkinStatus: [0, 0, 0, 0],
          lastCheckin: null,
          lastLocation: '未签到',
          warning: true
        }
      ])
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    message.success('数据已刷新')
  }

  // 计算整体进度
  const getOverallProgress = () => {
    if (checkpoints.length === 0) return 0
    const totalChecked = checkpoints.reduce((sum, cp) => sum + (cp.checkedCount || 0), 0)
    const totalExpected = checkpoints.reduce((sum, cp) => sum + (cp.totalCount || 0), 0)
    return totalExpected > 0 ? Math.round((totalChecked / totalExpected) * 100) : 0
  }

  // 计算完成签到的人数
  const getCompletedCount = () => {
    return participants.filter(p => 
      p.checkinStatus?.every(s => s === 1)
    ).length
  }

  // 获取未签到的人数
  const getNotStartedCount = () => {
    return participants.filter(p => 
      !p.checkinStatus?.some(s => s === 1)
    ).length
  }

  // 表格列定义
  const columns = [
    {
      title: '参与者',
      key: 'user',
      width: 180,
      fixed: 'left',
      render: (_, record) => (
        <div className="user-cell">
          <Avatar 
            size={36} 
            icon={<UserOutlined />} 
            src={record.avatar}
            className={record.warning ? 'warning-avatar' : ''}
          />
          <div className="user-info">
            <div className="user-nickname">
              {record.nickname}
              {record.warning && (
                <Tooltip title="长时间未签到，请关注">
                  <WarningOutlined className="warning-icon" />
                </Tooltip>
              )}
            </div>
            <div className="user-phone">
              <PhoneOutlined /> {record.phone}
            </div>
          </div>
        </div>
      )
    },
    ...checkpoints.map((cp, index) => ({
      title: (
        <div className="checkpoint-header">
          <span className="cp-order">{index + 1}</span>
          <span className="cp-name">{cp.name}</span>
        </div>
      ),
      key: `cp-${cp.id}`,
      width: 120,
      align: 'center',
      render: (_, record) => {
        const checked = record.checkinStatus?.[index] === 1
        return checked ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>已签到</Tag>
        ) : (
          <Tag color="default" icon={<ClockCircleOutlined />}>未签到</Tag>
        )
      }
    })),
    {
      title: '最后签到',
      key: 'lastCheckin',
      width: 150,
      render: (_, record) => (
        <div className="last-checkin">
          {record.lastCheckin ? (
            <>
              <div className="checkin-time">{dayjs(record.lastCheckin).format('HH:mm')}</div>
              <div className="checkin-location">
                <EnvironmentOutlined /> {record.lastLocation}
              </div>
            </>
          ) : (
            <span className="no-checkin">暂无签到</span>
          )}
        </div>
      )
    },
    {
      title: '进度',
      key: 'progress',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const completed = record.checkinStatus?.filter(s => s === 1).length || 0
        const total = checkpoints.length
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0
        return (
          <Progress 
            type="circle" 
            percent={percent} 
            size={40}
            strokeColor={{
              '0%': 'var(--primary-color)',
              '100%': 'var(--success-color)'
            }}
          />
        )
      }
    }
  ]

  // 生成地图标记点
  const generateMapMarkers = () => {
    const markers = []

    // 添加签到点标记
    checkpoints.forEach((cp, index) => {
      const checkedCount = cp.checkedCount || 0
      const totalCount = cp.totalCount || 0
      const isCompleted = checkedCount === totalCount

      // 创建签到点标记内容
      const markerContent = `
        <div class="checkpoint-marker ${isCompleted ? 'completed' : ''}">
          <div class="marker-order">${index + 1}</div>
          <div class="marker-info">
            <div class="marker-name">${cp.name}</div>
            <div class="marker-count">${checkedCount}/${totalCount}人</div>
          </div>
        </div>
      `

      markers.push({
        lng: cp.longitude,
        lat: cp.latitude,
        title: cp.name,
        content: markerContent
      })

      // 更新地图中心为第一个签到点
      if (index === 0 && cp.longitude && cp.latitude) {
        setMapCenter({ lng: cp.longitude, lat: cp.latitude })
      }
    })

    return markers
  }

  // 生成路线点（用于绘制签到点之间的连线）
  const generateRoutePoints = () => {
    return checkpoints
      .filter(cp => cp.longitude && cp.latitude)
      .map(cp => ({
        lng: cp.longitude,
        lat: cp.latitude
      }))
  }

  return (
    <div className="checkin-monitor-page">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-left">
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/organizer/activities')}
            className="back-btn"
          >
            返回
          </Button>
          <div className="header-title">
            <h1 className="page-title">
              <EnvironmentOutlined className="title-icon" />
              签到监控
            </h1>
            {activity && (
              <div className="activity-info">
                <span className="activity-name">{activity.title}</span>
                <Badge status="processing" text="进行中" />
              </div>
            )}
          </div>
        </div>
        <Space>
          <span className="auto-refresh-tip">
            <SyncOutlined spin={refreshing} /> 每30秒自动刷新
          </span>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            立即刷新
          </Button>
        </Space>
      </div>

      {/* 统计概览 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card className="stat-card overview">
            <div className="stat-content">
              <div className="stat-main">
                <Progress 
                  type="dashboard" 
                  percent={getOverallProgress()} 
                  size={100}
                  strokeColor={{
                    '0%': 'var(--primary-color)',
                    '100%': 'var(--success-color)'
                  }}
                />
              </div>
              <div className="stat-label">整体进度</div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="参与总人数" 
              value={participants.length} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card completed">
            <Statistic 
              title="已完成全程" 
              value={getCompletedCount()} 
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: 'var(--success-color)' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card warning">
            <Statistic 
              title="未开始签到" 
              value={getNotStartedCount()} 
              prefix={<WarningOutlined />}
              valueStyle={{ color: getNotStartedCount() > 0 ? 'var(--danger-color)' : 'var(--text-secondary)' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 地图监控 */}
      <Card className="map-monitor-card" title="实时地图监控">
        <div className="map-monitor-content">
          <MapView
            center={mapCenter}
            zoom={14}
            height="500px"
            markers={generateMapMarkers()}
            routePoints={generateRoutePoints()}
          />
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-marker checkpoint"></span>
              <span>签到点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker completed"></span>
              <span>已完成签到点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker route"></span>
              <span>活动路线</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 签到点进度 */}
      <Card className="checkpoints-card" title="签到点进度">
        <div className="checkpoints-timeline">
          <Timeline mode="left">
            {checkpoints.map((cp, index) => (
              <Timeline.Item
                key={cp.id}
                color={cp.checkedCount === cp.totalCount ? 'green' : 
                       cp.checkedCount > 0 ? 'blue' : 'gray'}
                label={
                  <div className="timeline-label">
                    <span className="cp-order-badge">{index + 1}</span>
                  </div>
                }
              >
                <div className="checkpoint-progress-item">
                  <div className="cp-info">
                    <span className="cp-name">{cp.name}</span>
                    <span className="cp-count">
                      {cp.checkedCount} / {cp.totalCount} 人
                    </span>
                  </div>
                  <Progress 
                    percent={Math.round((cp.checkedCount / cp.totalCount) * 100)} 
                    size="small"
                    strokeColor={{
                      '0%': 'var(--primary-color)',
                      '100%': 'var(--success-color)'
                    }}
                  />
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </Card>

      {/* 参与者签到状态 */}
      <Card className="participants-card" title="参与者签到状态">
        <Table
          columns={columns}
          dataSource={participants}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 + checkpoints.length * 120 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无参与者数据"
              />
            )
          }}
          rowClassName={(record) => record.warning ? 'warning-row' : ''}
        />
      </Card>
    </div>
  )
}

export default CheckinMonitor

