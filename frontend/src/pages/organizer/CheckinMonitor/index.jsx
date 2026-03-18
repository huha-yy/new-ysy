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
import { getParticipantsCheckin, getCheckpointStats, getTrackMonitor } from '../../../api/checkin'
import { getRouteDetail } from '../../../api/route'
import dayjs from 'dayjs'
import MapView from '../../../components/MapView/MapView'
import { DEFAULT_MAP_CENTER } from '../../../utils/constants'
import './CheckinMonitor.css'

const createMapBadge = (className, icon, text, extraText = '') => `
  <div class="${className}">
    <span class="${className}__icon">${icon}</span>
    <span class="${className}__text">${text}</span>
    ${extraText ? `<span class="${className}__extra">${extraText}</span>` : ''}
  </div>
`

const parseCoordinate = (value) => {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) && parsed !== 0 ? parsed : null
}

const truncateMarkerText = (text, maxLength = 4) => {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text
}

function CheckinMonitor() {
  const navigate = useNavigate()
  const { id: activityId } = useParams()

  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState(null)
  const [routeDetail, setRouteDetail] = useState(null)
  const [checkpointStats, setCheckpointStats] = useState([])
  const [participants, setParticipants] = useState([])
  const [trackMonitor, setTrackMonitor] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER)
  const [selectedParticipantId, setSelectedParticipantId] = useState(null)

  useEffect(() => {
    fetchData(true)
    const interval = setInterval(() => fetchData(false), 15000)
    return () => clearInterval(interval)
  }, [activityId])

  useEffect(() => {
    if (!activity?.routeId) {
      setRouteDetail(null)
      return
    }

    fetchRouteInfo(activity.routeId)
  }, [activity?.routeId])

  useEffect(() => {
    if (trackMonitor.length === 0) {
      setSelectedParticipantId(null)
      return
    }

    const selectedExists = trackMonitor.some(item => item.userId === selectedParticipantId)
    if (selectedExists) {
      return
    }

    const firstAvailable = trackMonitor.find(item => item.latestLatitude && item.latestLongitude) || trackMonitor[0]
    if (firstAvailable) {
      setSelectedParticipantId(firstAvailable.userId)
    }
  }, [trackMonitor, selectedParticipantId])

  const selectedParticipant = trackMonitor.find(item => item.userId === selectedParticipantId) || null

  useEffect(() => {
    if (selectedParticipant?.latestLongitude && selectedParticipant?.latestLatitude) {
      setMapCenter({
        lng: selectedParticipant.latestLongitude,
        lat: selectedParticipant.latestLatitude
      })
    }
  }, [selectedParticipant])

  useEffect(() => {
    if (selectedParticipantId) {
      return
    }

    const startLng = parseCoordinate(routeDetail?.startPoint?.longitude)
    const startLat = parseCoordinate(routeDetail?.startPoint?.latitude)
    if (startLng && startLat) {
      setMapCenter({
        lng: startLng,
        lat: startLat
      })
    }
  }, [routeDetail, selectedParticipantId])

  const fetchData = async (showErrors = true) => {
    setLoading(true)
    try {
      await Promise.all([
        fetchActivityInfo(showErrors),
        fetchCheckpointStats(showErrors),
        fetchParticipants(showErrors),
        fetchTrackMonitorData(showErrors)
      ])
    } catch (error) {
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

  const fetchRouteInfo = async (routeId, showErrors = false) => {
    try {
      const res = await getRouteDetail(routeId)
      setRouteDetail(res)
    } catch (error) {
      if (showErrors) message.error('获取路线详情失败')
    }
  }

  const fetchCheckpointStats = async (showErrors = true) => {
    try {
      const res = await getCheckpointStats(activityId)
      setCheckpointStats(res || [])

      if (res && res.length > 0) {
        const firstValidPoint = res.find(cp =>
          cp.longitude && cp.latitude &&
          !isNaN(cp.longitude) && !isNaN(cp.latitude) &&
          cp.longitude !== 0 && cp.latitude !== 0
        )
        if (firstValidPoint && !selectedParticipantId) {
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

  const fetchTrackMonitorData = async (showErrors = true) => {
    try {
      const res = await getTrackMonitor(activityId)
      setTrackMonitor(res || [])
    } catch (error) {
      if (showErrors) message.error('获取轨迹监控数据失败')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    message.success('数据已刷新')
  }

  const getOverallProgress = () => {
    if (checkpointStats.length === 0) return 0
    const totalChecked = checkpointStats.reduce((sum, cp) => sum + (cp.checkedCount || 0), 0)
    const totalExpected = checkpointStats.reduce((sum, cp) => sum + (cp.totalCount || 0), 0)
    return totalExpected > 0 ? Math.round((totalChecked / totalExpected) * 100) : 0
  }

  const getCompletedCount = () => {
    return participants.filter(p =>
      p.checkedInCount === p.totalCheckpoints && p.totalCheckpoints > 0
    ).length
  }

  const getOnlineCount = () => {
    return trackMonitor.filter(item => item.onlineStatus === 1).length
  }

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
    ...checkpointStats.map(cp => ({
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

  const generateCheckpointMarkers = () => {
    return checkpointStats
      .filter(cp =>
        cp.longitude && cp.latitude &&
        !isNaN(cp.longitude) && !isNaN(cp.latitude) &&
        cp.longitude !== 0 && cp.latitude !== 0
      )
      .map(cp => {
        const checkedCount = cp.checkedCount || 0
        const totalCount = cp.totalCount || 0
        const isCompleted = checkedCount === totalCount && totalCount > 0

        return {
          markerType: 'checkpoint',
          lng: cp.longitude,
          lat: cp.latitude,
          title: cp.name,
          content: `
            <div class="checkpoint-marker ${isCompleted ? 'completed' : ''}">
              <div class="marker-order">${cp.sequence}</div>
              <div class="marker-info">
                <div class="marker-name">${cp.name}</div>
                <div class="marker-count">${checkedCount}/${totalCount}人</div>
              </div>
            </div>
          `
        }
      })
  }

  const generateRouteMarkers = () => {
    if (!routeDetail) {
      return []
    }

    const markers = []

    const startLng = parseCoordinate(routeDetail.startPoint?.longitude)
    const startLat = parseCoordinate(routeDetail.startPoint?.latitude)
    if (startLng && startLat) {
      markers.push({
        markerType: 'route-start',
        lng: startLng,
        lat: startLat,
        title: routeDetail.startPoint?.name || routeDetail.startPointName || '起点',
        offset: { x: -30, y: -38 },
        content: createMapBadge(
          'route-pill-marker route-pill-marker--start route-pill-marker--key',
          '起',
          truncateMarkerText(routeDetail.startPoint?.name || routeDetail.startPointName || '起点', 4)
        )
      })
    }

    const endLng = parseCoordinate(routeDetail.endPoint?.longitude)
    const endLat = parseCoordinate(routeDetail.endPoint?.latitude)
    if (endLng && endLat) {
      markers.push({
        markerType: 'route-end',
        lng: endLng,
        lat: endLat,
        title: routeDetail.endPoint?.name || routeDetail.endPointName || '终点',
        offset: { x: -30, y: -38 },
        content: createMapBadge(
          'route-pill-marker route-pill-marker--end route-pill-marker--key',
          '终',
          truncateMarkerText(routeDetail.endPoint?.name || routeDetail.endPointName || '终点', 4)
        )
      })
    }

    ;(routeDetail.routePoints || []).forEach(point => {
      const lng = parseCoordinate(point.longitude)
      const lat = parseCoordinate(point.latitude)

      if (!lng || !lat) {
        return
      }

      markers.push({
        markerType: 'route-point',
        lng,
        lat,
        title: point.name || `路线点${point.sequence || ''}`,
        offset: { x: -14, y: -14 },
        content: `
          <div class="route-node-marker">
            <span class="route-node-marker__seq">${point.sequence || ''}</span>
          </div>
        `
      })
    })

    const appendRoutePointMarkers = (points, type, icon, options = {}) => {
      ;(points || []).forEach(point => {
        const lng = parseCoordinate(point.longitude)
        const lat = parseCoordinate(point.latitude)

        if (!lng || !lat) {
          return
        }

        markers.push({
          markerType: type,
          lng,
          lat,
          title: point.name,
          offset: options.offset || { x: -42, y: -34 },
          content: createMapBadge(
            `route-pill-marker route-pill-marker--${type} ${options.className || 'route-pill-marker--minor'}`.trim(),
            icon,
            truncateMarkerText(point.name, options.maxLength || 4),
            options.showSequence && point.sequence ? `#${point.sequence}` : ''
          )
        })
      })
    }

    appendRoutePointMarkers(routeDetail.waypoints, 'waypoint', '途', {
      className: 'route-pill-marker--minor',
      maxLength: 3
    })
    appendRoutePointMarkers(routeDetail.riskPoints, 'risk', '险', {
      className: 'route-pill-marker--alert',
      maxLength: 4,
      showSequence: true,
      offset: { x: -46, y: -36 }
    })
    appendRoutePointMarkers(routeDetail.restPoints, 'rest', '休', {
      className: 'route-pill-marker--minor',
      maxLength: 3
    })
    appendRoutePointMarkers(routeDetail.supplyPoints, 'supply', '补', {
      className: 'route-pill-marker--minor',
      maxLength: 3
    })

    return markers
  }

  const generateParticipantMarkers = () => {
    return trackMonitor
      .filter(item =>
        item.latestLongitude && item.latestLatitude &&
        !isNaN(item.latestLongitude) && !isNaN(item.latestLatitude)
      )
      .map(item => {
        const markerClass = [
          'participant-marker',
          item.onlineStatus === 1 ? 'online' : 'offline',
          item.warning === 1 ? 'warning' : '',
          item.userId === selectedParticipantId ? 'selected' : ''
        ].filter(Boolean).join(' ')

        return {
          markerType: 'participant',
          userId: item.userId,
          lng: item.latestLongitude,
          lat: item.latestLatitude,
          title: item.nickname,
          offset: { x: -18, y: -18 },
          content: `
            <div class="${markerClass}">
              <span class="participant-marker__initial">${(item.nickname || '?').slice(0, 1)}</span>
            </div>
          `
        }
      })
  }

  const generateMapMarkers = () => {
    return [
      ...generateRouteMarkers(),
      ...generateCheckpointMarkers(),
      ...generateParticipantMarkers()
    ]
  }

  const generateRoutePoints = () => {
    const routePoints = (routeDetail?.routePoints || [])
      .map(point => {
        const lng = parseCoordinate(point.longitude)
        const lat = parseCoordinate(point.latitude)

        if (!lng || !lat) {
          return null
        }

        return { lng, lat }
      })
      .filter(Boolean)

    if (routePoints.length >= 2) {
      return routePoints
    }

    return checkpointStats
      .map(cp => {
        const lng = parseCoordinate(cp.longitude)
        const lat = parseCoordinate(cp.latitude)

        if (!lng || !lat) {
          return null
        }

        return { lng, lat }
      })
      .filter(Boolean)
  }

  const selectedTrackPolyline = selectedParticipant?.recentTracks?.length >= 2
    ? [{
        path: selectedParticipant.recentTracks.map(track => ({
          lng: track.longitude,
          lat: track.latitude
        })),
        strokeColor: selectedParticipant.warning === 1 ? '#FF4D4F' : '#FF7A45',
        strokeWeight: 6,
        strokeOpacity: 0.95,
        zIndex: 150
      }]
    : []

  const handleMarkerClick = (markerData) => {
    if (markerData.markerType !== 'participant') {
      return
    }

    setSelectedParticipantId(markerData.userId)
    setMapCenter({
      lng: markerData.lng,
      lat: markerData.lat
    })
  }

  return (
    <div className="checkin-monitor-page">
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
            <SyncOutlined spin={refreshing} /> 每15秒自动刷新
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
              title="在线人数"
              value={getOnlineCount()}
              prefix={<SyncOutlined />}
              valueStyle={{ color: getOnlineCount() > 0 ? 'var(--success-color)' : 'var(--text-secondary)' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="map-monitor-card" title="实时地图监控">
        <div className="track-focus-panel">
          {selectedParticipant ? (
            <>
              <div className="track-focus-main">
                <Avatar src={selectedParticipant.avatar} icon={<UserOutlined />} />
                <div>
                  <div className="track-focus-name">
                    {selectedParticipant.nickname}
                    <Tag color={selectedParticipant.onlineStatus === 1 ? 'success' : 'default'}>
                      {selectedParticipant.onlineStatusText}
                    </Tag>
                    {selectedParticipant.warning === 1 && (
                      <Tag color="error">预警</Tag>
                    )}
                  </div>
                  <div className="track-focus-meta">
                    最近上报：
                    {selectedParticipant.latestRecordTime
                      ? dayjs(selectedParticipant.latestRecordTime).format('HH:mm:ss')
                      : '暂无'}
                    {selectedParticipant.warningReason ? ` · ${selectedParticipant.warningReason}` : ''}
                  </div>
                </div>
              </div>
              <div className="track-focus-actions">
                {trackMonitor.map(item => (
                  <Button
                    key={item.userId}
                    size="small"
                    type={item.userId === selectedParticipantId ? 'primary' : 'default'}
                    danger={item.warning === 1}
                    onClick={() => {
                      setSelectedParticipantId(item.userId)
                      if (item.latestLongitude && item.latestLatitude) {
                        setMapCenter({
                          lng: item.latestLongitude,
                          lat: item.latestLatitude
                        })
                      }
                    }}
                  >
                    {item.nickname}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="track-focus-empty">点击地图上的参与者标记查看最近轨迹</div>
          )}
        </div>

        {routeDetail && (
          <div className="route-summary-panel">
            <span className="route-summary-item">路线点 {routeDetail.routePoints?.length || 0}</span>
            <span className="route-summary-item">签到点 {checkpointStats.length}</span>
            <span className="route-summary-item">途经点 {routeDetail.waypoints?.length || 0}</span>
            <span className="route-summary-item">风险点 {routeDetail.riskPoints?.length || 0}</span>
            <span className="route-summary-item">休息点 {routeDetail.restPoints?.length || 0}</span>
            <span className="route-summary-item">补给点 {routeDetail.supplyPoints?.length || 0}</span>
          </div>
        )}

        <div className="map-monitor-content">
          <MapView
            center={mapCenter}
            zoom={14}
            height="500px"
            markers={generateMapMarkers()}
            routePoints={generateRoutePoints()}
            polylines={selectedTrackPolyline}
            onMarkerClick={handleMarkerClick}
          />
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-marker start"></span>
              <span>起终点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker route-point"></span>
              <span>路线点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker checkpoint"></span>
              <span>签到点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker completed"></span>
              <span>已完成签到点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker waypoint"></span>
              <span>途经点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker risk"></span>
              <span>风险点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker rest"></span>
              <span>休息点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker supply"></span>
              <span>补给点</span>
            </div>
            <div className="legend-item">
              <span className="legend-marker route"></span>
              <span>活动路线</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot online"></span>
              <span>参与者在线</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot offline"></span>
              <span>参与者离线</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="checkpoints-card" title="签到点进度">
        <div className="checkpoints-timeline">
          <Timeline mode="left">
            {checkpointStats.map(cp => (
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
