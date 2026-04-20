import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, message, Space, Tag, Progress, Modal, Alert, Form, Input, InputNumber, Dropdown } from 'antd'
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  MoreOutlined,
  AimOutlined,
  EditOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import MapView from '../../../components/MapView/MapView'
import { getCheckpoints, getCheckinStatus, checkin as checkinApi, reportTrack } from '../../../api/checkin'
import { getActivityDetail } from '../../../api/activity'
import { getRouteDetail } from '../../../api/route'
import { getLocation, checkIn, TrackRecorder, checkLocationPermission, forceGpsLocation, locationDiagnostics } from '../../../utils/location'
import { formatDistance, calculateDistance } from '../../../utils/map'
import dayjs from 'dayjs'
import './CheckIn.css'

function CheckIn() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [checkinStatus, setCheckinStatus] = useState(null)
  const [checkpoints, setCheckpoints] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [checkinProgress, setCheckinProgress] = useState(0)
  const [nextCheckpoint, setNextCheckpoint] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)

  // 路线数据（用于地图展示路线轨迹和各类标记点）
  const [routeData, setRouteData] = useState(null)

  const [trackRecorder] = useState(new TrackRecorder())
  const [isRecording, setIsRecording] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState('checking')
  const [diagnosing, setDiagnosing] = useState(false)
  const [manualLocationVisible, setManualLocationVisible] = useState(false)

  useEffect(() => {
    fetchCheckinData()
    return () => {
      trackRecorder.stop()
      setIsRecording(false)
    }
  }, [id])

  const checkPermissionAndLocation = async () => {
    try {
      const permission = await checkLocationPermission()
      setPermissionStatus(permission)

      if (permission === 'granted') {
        // 权限已授权，直接获取位置
        fetchLocation()
      } else if (permission === 'prompt') {
        // 需要用户授权，主动请求
        fetchLocation() // 这会触发权限请求
      } else {
        // 权限被拒绝
        setLocationError('定位权限被拒绝，请在浏览器设置中允许此网站访问位置信息')
      }
    } catch (error) {
      setPermissionStatus('denied')
    }
  }

  useEffect(() => {
    // 计算签到进度
    if (checkinStatus && checkpoints.length > 0) {
      const completedCount = checkinStatus.checkpointStatusList?.filter(s => s.isCheckedIn === 1).length || 0
      const progress = Math.round((completedCount / checkpoints.length) * 100)
      setCheckinProgress(progress)

      // 找到下一个签到点
      const completedIds = checkinStatus.checkpointStatusList?.filter(s => s.isCheckedIn === 1).map(s => s.checkpointId) || []
      const next = checkpoints.find(cp => !completedIds.includes(cp.id))
      setNextCheckpoint(next || null)
    }
  }, [checkinStatus, checkpoints])

  useEffect(() => {
    // 自动刷新位置（每2分钟，仅在已有位置时更新）
    const interval = setInterval(() => {
      if (!locating && currentLocation) {
        fetchLocation()
      }
    }, 120000) // 2分钟

    return () => clearInterval(interval)
  }, [])

  const fetchCheckinData = async () => {
    try {
      setLoading(true)

      // 并行获取签到状态和签到点列表
      const [status, points] = await Promise.all([
        getCheckinStatus(id),
        getCheckpoints(id)
      ])

      setCheckinStatus(status)
      setCheckpoints(points)

      // 获取活动关联的路线数据（轨迹、途经点、风险点等）
      try {
        const activity = await getActivityDetail(id)
        if (activity.routeId) {
          const route = await getRouteDetail(activity.routeId)
          setRouteData(route)
          // 以路线起点为地图中心
          if (route.startPoint) {
            setMapCenter({ lng: parseFloat(route.startPoint.longitude), lat: parseFloat(route.startPoint.latitude) })
          }
        }
      } catch (e) {
        // 路线数据加载失败不影响签到功能
      }

      // 开始记录轨迹
      if (status.canCheckIn) {
        startTrackRecording()
      }

      // 获取当前位置
      fetchLocation()
    } catch (error) {
      message.error('获取签到数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchLocation = async () => {
    try {
      setLocating(true)
      setLocationError(null)
      const location = await getLocation()
      const isFirstLocate = !currentLocation
      setCurrentLocation(location)
      if (isFirstLocate) {
        message.success(`定位成功，精度 ±${Math.round(location.accuracy)}米`)
      }
    } catch (error) {
      setLocationError(error.message)
      setCurrentLocation(null)
    } finally {
      setLocating(false)
    }
  }

  // 强制GPS定位
  const handleForceGpsLocation = async () => {
    try {
      setLocating(true)
      setLocationError(null)
      const location = await forceGpsLocation()
      setCurrentLocation(location)
      message.success(`强制GPS定位成功！响应时间: ${location.diagnostics?.responseTime || 0}ms`)
    } catch (error) {
      setLocationError(error.message)
      message.error('强制GPS定位失败: ' + error.message)
    } finally {
      setLocating(false)
    }
  }

  // 定位诊断
  const handleLocationDiagnostics = async () => {
    try {
      setDiagnosing(true)
      const results = await locationDiagnostics()

      // 显示诊断结果
      Modal.info({
        title: '定位诊断结果',
        width: 600,
        content: (
          <div>
            {results.map((result, index) => (
              <div key={index} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  {result.method} {result.success ? '✅' : '❌'}
                </div>
                {result.success ? (
                  <div style={{ fontSize: '12px' }}>
                    <div>坐标: {result.latitude?.toFixed(6)}, {result.longitude?.toFixed(6)}</div>
                    <div>精度: ±{Math.round(result.accuracy || 0)}米</div>
                    {result.diagnostics && (
                      <div>
                        <div>定位源: {result.diagnostics.source}</div>
                        <div>响应时间: {result.diagnostics.responseTime}ms</div>
                      </div>
                    )}
                    {result.address && <div>地址: {result.address}</div>}
                  </div>
                ) : (
                  <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
                    错误: {result.error}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 8, backgroundColor: '#f6f8fa', borderRadius: 4, fontSize: '12px' }}>
              💡 诊断说明：
              <ul style={{ marginLeft: 16, marginTop: 4 }}>
                <li>精度 &lt; 100米：通常来自GPS卫星</li>
                <li>精度 &gt; 100米：可能来自网络定位(WiFi/基站)</li>
                <li>如果多个方法结果相似但都偏差很大，可能是设备GPS异常</li>
                <li>如果高德地图定位更准确，建议使用高德定位</li>
              </ul>
            </div>
          </div>
        ),
        okText: '我知道了'
      })
    } catch (error) {
      message.error('定位诊断失败')
    } finally {
      setDiagnosing(false)
    }
  }

  // 手动设置位置
  const handleManualLocation = () => {
    setManualLocationVisible(true)
  }

  const handleManualLocationSubmit = (values) => {
    const { latitude, longitude } = values
    if (!latitude || !longitude) {
      message.error('请输入有效的坐标')
      return
    }

    // 创建手动位置对象
    const manualLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: 0, // 手动输入，精度设为0
      method: 'manual',
      coordinateSystem: 'GCJ02 (手动输入)',
      isManual: true
    }

    setCurrentLocation(manualLocation)
    setLocationError(null)
    setManualLocationVisible(false)
    message.success('手动位置设置成功！')
  }

  const startTrackRecording = () => {
    if (isRecording) return

    setIsRecording(true)
    trackRecorder.start(
      (track) => {
        setCurrentLocation(prev => ({
          ...(prev || {}),
          ...track,
          method: 'track'
        }))
      },
      (error) => {
      },
      async (tracks) => {
        await reportTrack(tracks.map(track => ({
          activityId: Number(id),
          latitude: track.latitude,
          longitude: track.longitude,
          accuracy: track.accuracy ? Math.round(track.accuracy) : undefined,
          speed: typeof track.speed === 'number' ? track.speed : undefined,
          recordTime: new Date(track.timestamp).toISOString().slice(0, 19).replace('T', ' ')
        })))
      }
    )
  }

  const handleCheckIn = async (checkpointId) => {
    if (!currentLocation) {
      message.warning('正在获取位置，请稍后...')
      await fetchLocation()
      return
    }

    // 检查定位精度，精度 > 100米时提示用户
    if (currentLocation.accuracy && currentLocation.accuracy > 100) {
      Modal.confirm({
        title: '定位精度较低',
        content: `当前定位精度为 ±${Math.round(currentLocation.accuracy)} 米，可能导致签到失败。建议到空旷处重新定位后再签到。`,
        okText: '重新定位',
        cancelText: '继续签到',
        onOk: async () => {
          try {
            setLocating(true)
            const location = await forceGpsLocation()
            setCurrentLocation(location)
            message.success('重新定位成功')
          } catch (error) {
            message.error('重新定位失败: ' + error.message)
          } finally {
            setLocating(false)
          }
        },
        onCancel: () => {
          // 用户选择继续签到，执行实际签到逻辑
          doCheckIn(checkpointId)
        }
      })
      return
    }

    doCheckIn(checkpointId)
  }

  const doCheckIn = async (checkpointId) => {
    try {
      setLoading(true)

      // 检查是否在签到范围内
      const checkpoint = checkpoints.find(cp => cp.id === checkpointId)
      const checkResult = checkIn(
        currentLocation.latitude,
        currentLocation.longitude,
        checkpoint.latitude,
        checkpoint.longitude,
        checkpoint.radius
      )

      if (!checkResult.inRange) {
        Modal.warning({
          title: '不在签到范围内',
          content: `您距离签到点还有${checkResult.distance}米，请移动到签到点附近`,
          okText: '知道了'
        })
        setLoading(false)
        return
      }

      // 提交签到
      await checkinApi(id, {
        checkpointId: checkpointId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      })

      message.success('签到成功！')

      // 重新获取签到状态
      await fetchCheckinData()
    } catch (error) {
      message.error(error.message || '签到失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getCheckpointStatus = (checkpointId) => {
    const statusItem = checkinStatus?.checkpointStatusList?.find(s => s.checkpointId === checkpointId)
    if (!statusItem || statusItem.isCheckedIn !== 1) return 'pending'

    const record = statusItem.checkInRecord
    return record?.status === 2 ? 'late' : 'completed'
  }

  const getDistanceToCheckpoint = (checkpoint) => {
    if (!currentLocation) return null

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      checkpoint.latitude,
      checkpoint.longitude
    )

    return Math.round(distance)
  }

  if (loading && !checkinStatus) {
    return (
      <div className="checkin-loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    )
  }

  if (checkinStatus && !checkinStatus.canCheckIn) {
    return (
      <div className="checkin-disabled">
        <WarningOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />
        <h3>暂不可签到</h3>
        <p>{checkinStatus.message || '您没有报名此活动或活动未开始'}</p>
        <Button type="primary" onClick={() => navigate(`/activities/${id}`)}>
          返回活动
        </Button>
      </div>
    )
  }

  return (
    <div className="checkin-page">
      <div className="container">
        <Card
          title="活动签到"
          extra={
            <Button
              onClick={() => navigate(`/activities/${id}`)}
              icon={<EnvironmentOutlined />}
            >
              返回活动
            </Button>
          }
          className="checkin-card"
        >
          {/* 签到进度 */}
          <div className="checkin-progress-section">
            <div className="progress-header">
              <h3>签到进度</h3>
              <div className="progress-actions">
                <Tag color="blue">
                  {checkinProgress}%
                </Tag>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={fetchLocation}
                  loading={locating}
                >
                  刷新位置
                </Button>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'force-gps',
                        label: '强制GPS定位',
                        icon: <AimOutlined />,
                        onClick: handleForceGpsLocation,
                        disabled: locating
                      },
                      {
                        key: 'diagnostics',
                        label: '定位诊断',
                        icon: <InfoCircleOutlined />,
                        onClick: handleLocationDiagnostics,
                        disabled: diagnosing
                      },
                      {
                        key: 'manual',
                        label: '手动定位',
                        icon: <EditOutlined />,
                        onClick: handleManualLocation
                      },
                      ...(currentLocation && currentLocation.originalLatitude ? [{
                        key: 'conversion',
                        label: '坐标转换详情',
                        icon: <InfoCircleOutlined />,
                        onClick: () => {
                          Modal.info({
                            title: '坐标转换详情',
                            content: (
                              <div>
                                <p><strong>GPS原始坐标 (WGS84):</strong></p>
                                <p>纬度: {currentLocation.originalLatitude.toFixed(7)}</p>
                                <p>经度: {currentLocation.originalLongitude.toFixed(7)}</p>
                                <br />
                                <p><strong>转换后坐标 (GCJ02):</strong></p>
                                <p>纬度: {currentLocation.latitude.toFixed(7)}</p>
                                <p>经度: {currentLocation.longitude.toFixed(7)}</p>
                                <br />
                                <p style={{ fontSize: '12px', color: '#666' }}>
                                  * 中国境内GPS定位需要进行坐标系转换才能在地图上正确显示
                                </p>
                              </div>
                            ),
                            width: 420
                          })
                        }
                      }] : [])
                    ]
                  }}
                  placement="bottomRight"
                >
                  <Button size="small" icon={<MoreOutlined />} />
                </Dropdown>
              </div>
            </div>
            <Progress
              percent={checkinProgress}
              strokeColor={{
                '0%': '#FFA726',
                '100%': '#52c41a'
              }}
              format={() => `${checkinStatus?.checkpointStatusList?.filter(s => s.isCheckedIn === 1).length || 0} / ${checkpoints.length}`}
            />
          </div>

          {/* 位置权限状态 */}
          {permissionStatus === 'denied' && (
            <Alert
              message="定位权限被拒绝"
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <span>请在浏览器设置中允许此网站访问您的位置信息，然后刷新页面</span>
                  <div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => window.location.reload()}
                    >
                      刷新页面
                    </Button>
                    <span style={{ margin: '0 8px' }}>或</span>
                    <Button
                      type="primary"
                      size="small"
                      onClick={checkPermissionAndLocation}
                    >
                      重新检查权限
                    </Button>
                  </div>
                </Space>
              }
              type="warning"
              showIcon
              className="location-error-bar"
            />
          )}

          {/* 定位错误提示 */}
          {locationError && !currentLocation && permissionStatus !== 'denied' && (
            <Alert
              message="定位失败"
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <span>{locationError}</span>
                  <Button
                    type="primary"
                    size="small"
                    onClick={fetchLocation}
                    loading={locating}
                    icon={<ReloadOutlined />}
                  >
                    重新获取位置
                  </Button>
                </Space>
              }
              type="error"
              showIcon
              className="location-error-bar"
            />
          )}

          {/* 当前位置信息 */}
          {currentLocation && (
            <>
              <div className="location-status-bar">
                <div className="location-status-left">
                  <EnvironmentOutlined />
                  <span>已获取当前位置</span>
                </div>
                <div className="location-status-right">
                  {currentLocation.accuracy && (
                    <Tag color={currentLocation.accuracy < 50 ? 'success' : currentLocation.accuracy < 100 ? 'warning' : 'error'}>
                      精度 ±{Math.round(currentLocation.accuracy)}米
                    </Tag>
                  )}
                </div>
              </div>
              {currentLocation.accuracy && currentLocation.accuracy > 100 && (
                <div className="location-low-accuracy">
                  <WarningOutlined />
                  <span>定位精度较低，建议到空旷处重新定位</span>
                  <Button
                    size="small"
                    type="primary"
                    onClick={handleForceGpsLocation}
                    loading={locating}
                  >
                    重新定位
                  </Button>
                </div>
              )}
            </>
          )}

          {/* 地图显示 */}
          <div className="map-section">
            <MapView
              center={mapCenter || (currentLocation ? {
                lng: currentLocation.longitude,
                lat: currentLocation.latitude
              } : undefined)}
              zoom={16}
              height="400px"
              showCurrentLocation={true}
              routePoints={routeData?.routePoints?.map(p => ({
                lng: parseFloat(p.longitude),
                lat: parseFloat(p.latitude)
              })) || []}
              markers={[
                ...(currentLocation ? [{
                  lng: currentLocation.longitude,
                  lat: currentLocation.latitude,
                  title: '我的位置',
                  content: '<div class="user-location-marker"><div class="user-pulse"></div><div class="user-dot"></div></div>',
                  offset: { x: -28, y: -28 }
                }] : []),
                // 起点
                ...(routeData?.startPoint ? [{
                  lng: parseFloat(routeData.startPoint.longitude),
                  lat: parseFloat(routeData.startPoint.latitude),
                  title: '起点',
                  content: '<div style="display:flex;align-items:center;padding:4px 10px;border-radius:12px;background:linear-gradient(135deg,#52c41a,#389e0d);color:#fff;font-size:12px;font-weight:bold;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">🎯 起点</div>',
                  offset: { x: -35, y: -15 }
                }] : []),
                // 终点
                ...(routeData?.endPoint ? [{
                  lng: parseFloat(routeData.endPoint.longitude),
                  lat: parseFloat(routeData.endPoint.latitude),
                  title: '终点',
                  content: '<div style="display:flex;align-items:center;padding:4px 10px;border-radius:12px;background:linear-gradient(135deg,#f5222d,#cf1322);color:#fff;font-size:12px;font-weight:bold;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.15);white-space:nowrap;">🏁 终点</div>',
                  offset: { x: -35, y: -15 }
                }] : []),
                // 签到点
                ...checkpoints.map((cp, index) => ({
                  lng: cp.longitude,
                  lat: cp.latitude,
                  title: cp.name,
                  content: `<div class="checkpoint-marker"><span class="checkpoint-seq">${cp.sequence || index + 1}</span><div class="checkpoint-label">${cp.name}</div></div>`
                })),
                // 途经点
                ...(routeData?.waypoints || []).map(wp => ({
                  lng: parseFloat(wp.longitude),
                  lat: parseFloat(wp.latitude),
                  title: wp.name,
                  content: `<div style="display:flex;align-items:center;padding:3px 8px;border-radius:10px;background:linear-gradient(135deg,#13c2c2,#08979c);color:#fff;font-size:11px;font-weight:bold;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap;">➕ ${wp.name}</div>`,
                  offset: { x: -40, y: -15 }
                })),
                // 风险点
                ...(routeData?.riskPoints || []).map(rp => ({
                  lng: parseFloat(rp.longitude),
                  lat: parseFloat(rp.latitude),
                  title: rp.name,
                  content: `<div style="display:flex;align-items:center;padding:3px 8px;border-radius:10px;background:linear-gradient(135deg,#faad14,#d48806);color:#fff;font-size:11px;font-weight:bold;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap;">⚠️ ${rp.name}</div>`,
                  offset: { x: -40, y: -15 }
                })),
                // 休息点
                ...(routeData?.restPoints || []).map(rp => ({
                  lng: parseFloat(rp.longitude),
                  lat: parseFloat(rp.latitude),
                  title: rp.name,
                  content: `<div style="display:flex;align-items:center;padding:3px 8px;border-radius:10px;background:linear-gradient(135deg,#722ed1,#531dab);color:#fff;font-size:11px;font-weight:bold;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap;">☕ ${rp.name}</div>`,
                  offset: { x: -40, y: -15 }
                })),
                // 补给点
                ...(routeData?.supplyPoints || []).map(sp => ({
                  lng: parseFloat(sp.longitude),
                  lat: parseFloat(sp.latitude),
                  title: sp.name,
                  content: `<div style="display:flex;align-items:center;padding:3px 8px;border-radius:10px;background:linear-gradient(135deg,#52c41a,#389e0d);color:#fff;font-size:11px;font-weight:bold;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap;">🏪 ${sp.name}</div>`,
                  offset: { x: -40, y: -15 }
                }))
              ]}
            />
          </div>

          {/* 签到点列表 */}
          <div className="checkpoints-section">
            <h3>签到点列表</h3>
            <div className="checkpoints-list">
              {checkpoints.map((checkpoint, index) => {
                const status = getCheckpointStatus(checkpoint.id)
                const distance = getDistanceToCheckpoint(checkpoint)
                const isNext = nextCheckpoint?.id === checkpoint.id

                return (
                  <div
                    key={checkpoint.id}
                    className={`checkpoint-item ${status} ${isNext ? 'next' : ''}`}
                    onClick={() => setMapCenter({ lng: checkpoint.longitude, lat: checkpoint.latitude })}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* 序号圆圈 */}
                    <div className="checkpoint-seq-circle">
                      {status === 'completed' ? '✓' : checkpoint.sequence}
                    </div>

                    {/* 信息区 */}
                    <div className="checkpoint-info-area">
                      <div className="checkpoint-name-row">
                        <span className="checkpoint-name">{checkpoint.name}</span>
                        {isNext && (
                          <Tag color="orange">下一站</Tag>
                        )}
                      </div>
                      <div className="checkpoint-meta">
                        {distance !== null && status === 'pending' && (
                          <span>
                            <EnvironmentOutlined />
                            距离 {formatDistance(distance)}
                          </span>
                        )}
                        <span>半径 {checkpoint.radius}m</span>
                        {checkpoint.expectedArriveMinutes && (
                          <span>
                            <ClockCircleOutlined />
                            {dayjs().startOf('day').add(checkpoint.expectedArriveMinutes, 'minute').format('HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 操作区 */}
                    <div className="checkpoint-action">
                      {status === 'completed' && (() => {
                        const statusItem = checkinStatus?.checkpointStatusList?.find(s => s.checkpointId === checkpoint.id)
                        const checkInTime = statusItem?.checkInRecord?.checkInTime
                        return (
                          <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: '14px', padding: '4px 12px' }}>
                            已签到 {checkInTime && dayjs(checkInTime).format('HH:mm:ss')}
                          </Tag>
                        )
                      })()}

                      {status === 'pending' && (
                        <Button
                          type="primary"
                          onClick={() => handleCheckIn(checkpoint.id)}
                          loading={loading}
                          disabled={!currentLocation || distance > checkpoint.radius}
                        >
                          {distance !== null && distance > checkpoint.radius
                            ? `${formatDistance(distance)}`
                            : '签到'
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 完成提示 */}
          {checkinProgress === 100 && (
            <div className="complete-celebration">
              <div className="celebration-icon">🎉</div>
              <div className="celebration-title">恭喜完成所有签到！</div>
              <div className="celebration-desc">您已完成所有签到点签到，请等待活动结束</div>
            </div>
          )}
        </Card>

        {/* 手动定位对话框 */}
        <Modal
          title="手动设置位置"
          open={manualLocationVisible}
          onCancel={() => setManualLocationVisible(false)}
          footer={null}
          width={480}
        >
          <div style={{ marginBottom: 16 }}>
            <Alert
              message="GPS定位不准确？"
              description={
                <div>
                  <p>当GPS定位存在较大偏差时，您可以手动输入准确的坐标信息。</p>
                  <p style={{ color: '#666', fontSize: '12px' }}>
                    💡 提示：您可以使用手机的指南针应用或其他地图应用获取准确坐标。
                  </p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Form
              layout="vertical"
              onFinish={handleManualLocationSubmit}
              initialValues={{
                latitude: 40.068333, // 根据您的实际位置设置默认值
                longitude: 116.173333
              }}
            >
              <Form.Item
                label="纬度 (北纬)"
                name="latitude"
                rules={[
                  { required: true, message: '请输入纬度' },
                  { type: 'number', min: 0, max: 90, message: '纬度范围0-90' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="例如: 40.068333"
                  precision={6}
                  step={0.000001}
                />
              </Form.Item>
              <Form.Item
                label="经度 (东经)"
                name="longitude"
                rules={[
                  { required: true, message: '请输入经度' },
                  { type: 'number', min: 0, max: 180, message: '经度范围0-180' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="例如: 116.173333"
                  precision={6}
                  step={0.000001}
                />
              </Form.Item>
              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setManualLocationVisible(false)}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit">
                    设置位置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default CheckIn
