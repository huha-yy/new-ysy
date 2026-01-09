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
import { getParticipantsCheckin, getCheckpointStats } from '../../../api/checkin'
import dayjs from 'dayjs'
import MapView from '../../../components/MapView/MapView'
import './CheckinMonitor.css'

function CheckinMonitor() {
  const navigate = useNavigate()
  const { id: activityId } = useParams()

  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState(null)
  const [checkpointStats, setCheckpointStats] = useState([])
  const [participants, setParticipants] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [mapCenter, setMapCenter] = useState({ lng: 116.397428, lat: 39.90923 })
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    fetchData(true)
    // 设置自动刷新
    const interval = setInterval(() => fetchData(false), 30000) // 每30秒刷新，静默模式
    return () => clearInterval(interval)
  }, [activityId])

  const fetchData = async (showErrors = true) => {
    setLoading(true)
    try {
      await Promise.all([
        fetchActivityInfo(showErrors),
        fetchCheckpointStats(showErrors),
        fetchParticipants(showErrors)
      ])
      setIsInitialLoad(false)
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityInfo = async (showErrors = true) => {
    try {
      const res = await getActivityDetail(activityId)
      setActivity(res)
    } catch (error) {
      if (showErrors) message.error('获取活动信息失败')
    }
  }

  const fetchCheckpointStats = async (showErrors = true) => {
    try {
      const res = await getCheckpointStats(activityId)
      setCheckpointStats(res || [])

      // 更新地图中心为第一个有效坐标的签到点
      if (res && res.length > 0) {
        const firstValidPoint = res.find(cp =>
          cp.longitude && cp.latitude &&
          !isNaN(cp.longitude) && !isNaN(cp.latitude) &&
          cp.longitude !== 0 && cp.latitude !== 0
        )
        if (firstValidPoint) {
          setMapCenter({ lng: firstValidPoint.longitude, lat: firstValidPoint.latitude })
        }
      }
    } catch (error) {
      if (showErrors) message.error('获取签到点统计失败')
    }
  }

  const fetchParticipants = async (showErrors = true) => {
    try {
      const res = await getParticipantsCheckin(activityId)
      setParticipants(res || [])
    } catch (error) {
      if (showErrors) message.error('获取参与者数据失败')
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
    if (checkpointStats.length === 0) return 0
    const totalChecked = checkpointStats.reduce((sum, cp) => sum + (cp.checkedCount || 0), 0)
    const totalExpected = checkpointStats.reduce((sum, cp) => sum + (cp.totalCount || 0), 0)
    return totalExpected > 0 ? Math.round((totalChecked / totalExpected) * 100) : 0
  }

  // 计算完成签到的人数
  const getCompletedCount = () => {
    return participants.filter(p =>
      p.checkedInCount === p.totalCheckpoints && p.totalCheckpoints > 0
    ).length
  }

  // 获取未签到的人数
  const getNotStartedCount = () => {
    return participants.filter(p =>
      p.checkedInCount === 0
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
            className={record.warning === 1 ? 'warning-avatar' : ''}
          />
          <div className="user-info">
            <div className="user-nickname">
              {record.nickname}
              {record.warning === 1 && (
                <Tooltip title={record.warningReason || '长时间未签到，请关注'}>
                  <WarningOutlined className="warning-icon" />
                </Tooltip>
              )}
            </div>
            <div className="user-phone">
              <PhoneOutlined /> {record.phone || '未绑定'}
            </div>
          </div>
        </div>
      )
    },
    ...checkpointStats.map((cp, index) => ({
      title: (
        <div className="checkpoint-header">
          <span className="cp-order">{cp.sequence}</span>
          <span className="cp-name">{cp.name}</span>
        </div>
      ),
      key: `cp-${cp.checkpointId}`,
      width: 120,
      align: 'center',
      render: (_, record) => {
        // 从 checkpointStatusList 中找到对应签到点的状态
        const checkpointStatus = record.checkpointStatusList?.find(
          status => status.checkpointId === cp.checkpointId
        )
        const isCheckedIn = checkpointStatus?.isCheckedIn === 1

        return isCheckedIn ? (
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
          {record.lastCheckInTime ? (
            <>
              <div className="checkin-time">{dayjs(record.lastCheckInTime).format('HH:mm')}</div>
              <div className="checkin-location">
                <EnvironmentOutlined /> {record.lastCheckInLocation || '未知位置'}
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
        const percent = record.progress || 0
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
    return checkpointStats
      .filter(cp =>
        cp.longitude && cp.latitude &&
        !isNaN(cp.longitude) && !isNaN(cp.latitude) &&
        cp.longitude !== 0 && cp.latitude !== 0
      )
      .map((cp, index) => {
        const checkedCount = cp.checkedCount || 0
        const totalCount = cp.totalCount || 0
        const isCompleted = checkedCount === totalCount && totalCount > 0

        // 创建签到点标记内容
        const markerContent = `
          <div class="checkpoint-marker ${isCompleted ? 'completed' : ''}">
            <div class="marker-order">${cp.sequence}</div>
            <div class="marker-info">
              <div class="marker-name">${cp.name}</div>
              <div class="marker-count">${checkedCount}/${totalCount}人</div>
            </div>
          </div>
        `

        return {
          lng: cp.longitude,
          lat: cp.latitude,
          title: cp.name,
          content: markerContent
        }
      })
  }

  // 生成路线点（用于绘制签到点之间的连线）
  const generateRoutePoints = () => {
    return checkpointStats
      .filter(cp =>
        cp.longitude && cp.latitude &&
        !isNaN(cp.longitude) && !isNaN(cp.latitude) &&
        cp.longitude !== 0 && cp.latitude !== 0
      )
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
            {checkpointStats.map((cp, index) => (
              <Timeline.Item
                key={cp.checkpointId}
                color={cp.checkedCount === cp.totalCount && cp.totalCount > 0 ? 'green' :
                       cp.checkedCount > 0 ? 'blue' : 'gray'}
                label={
                  <div className="timeline-label">
                    <span className="cp-order-badge">{cp.sequence}</span>
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
                    percent={cp.completionRate || 0}
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
          rowKey="userId"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 + checkpointStats.length * 120 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无参与者数据"
              />
            )
          }}
          rowClassName={(record) => record.warning === 1 ? 'warning-row' : ''}
        />
      </Card>
    </div>
  )
}

export default CheckinMonitor
