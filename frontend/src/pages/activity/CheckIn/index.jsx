import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, message, Space, Tag, Progress, Modal, Alert, Form, Input, InputNumber } from 'antd'
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import MapView from '../../../components/MapView/MapView'
import { getCheckpoints, getCheckinStatus, checkin as checkinApi, reportTrack } from '../../../api/checkin'
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

  const [trackRecorder] = useState(new TrackRecorder())
  const [isRecording, setIsRecording] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState('checking')
  const [diagnosing, setDiagnosing] = useState(false)
  const [manualLocationVisible, setManualLocationVisible] = useState(false)

  useEffect(() => {
    fetchCheckinData()
    checkPermissionAndLocation()
    return () => {
      // 停止轨迹记录
      if (isRecording) {
        trackRecorder.stop()
      }
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
        console.log('需要请求定位权限')
        fetchLocation() // 这会触发权限请求
      } else {
        // 权限被拒绝
        setLocationError('定位权限被拒绝，请在浏览器设置中允许此网站访问位置信息')
      }
    } catch (error) {
      console.error('权限检查失败:', error)
      setPermissionStatus('denied')
    }
  }

  useEffect(() => {
    // 计算签到进度
    if (checkinStatus && checkpoints.length > 0) {
      const completedCount = checkinStatus.checkInRecords?.length || 0
      const progress = Math.round((completedCount / checkpoints.length) * 100)
      setCheckinProgress(progress)

      // 找到下一个签到点
      const completedIds = checkinStatus.checkInRecords?.map(r => r.checkpointId) || []
      const next = checkpoints.find(cp => !completedIds.includes(cp.id))
      setNextCheckpoint(next || null)
    }
  }, [checkinStatus, checkpoints])

  useEffect(() => {
    // 自动获取位置（每2分钟，避免过度请求）
    const interval = setInterval(() => {
      if (!locating && !currentLocation) {
        console.log('自动获取位置...')
        fetchLocation()
      }
    }, 120000) // 2分钟

    return () => clearInterval(interval)
  }, [locating, currentLocation])

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

      // 开始记录轨迹
      if (status.canCheckIn) {
        startTrackRecording()
      }

      // 获取当前位置
      fetchLocation()
    } catch (error) {
      console.error('获取签到数据失败:', error)
      message.error('获取签到数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchLocation = async () => {
    try {
      setLocating(true)
      setLocationError(null)
      console.log('开始获取位置...')
      const location = await getLocation()
      console.log('位置获取成功:', location)
      setCurrentLocation(location)
      message.success(`位置获取成功 (${location.method === 'browser' ? '浏览器定位' : '高德定位'})`)
    } catch (error) {
      console.error('获取位置失败:', error)
      setLocationError(error.message)
      setCurrentLocation(null)
      // 显示详细的错误信息
      Modal.error({
        title: '定位失败',
        content: (
          <div>
            <p>无法获取您的当前位置：</p>
            <p style={{ color: '#ff4d4f', margin: '8px 0' }}>{error.message}</p>
            <p>请尝试以下解决方案：</p>
            <ul style={{ marginLeft: 16, marginTop: 8 }}>
              <li>确保浏览器定位权限已开启</li>
              <li>检查设备GPS功能是否正常</li>
              <li>确保网络连接正常</li>
              <li>尝试在户外或信号更好的地方使用</li>
              <li>如果是HTTPS网站，确保证书有效</li>
            </ul>
          </div>
        ),
        width: 480,
        okText: '我知道了'
      })
    } finally {
      setLocating(false)
    }
  }

  // 强制GPS定位
  const handleForceGpsLocation = async () => {
    try {
      setLocating(true)
      setLocationError(null)
      console.log('开始强制GPS定位...')
      const location = await forceGpsLocation()
      console.log('强制GPS定位成功:', location)
      setCurrentLocation(location)
      message.success(`强制GPS定位成功！响应时间: ${location.diagnostics?.responseTime || 0}ms`)
    } catch (error) {
      console.error('强制GPS定位失败:', error)
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
      console.log('开始定位诊断...')
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
      console.error('定位诊断失败:', error)
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
        console.log('轨迹记录:', track)
        // 上报轨迹到后端
        reportTrack([{
          activityId: Number(id),
          latitude: track.latitude,
          longitude: track.longitude,
          recordTime: new Date(track.timestamp).toISOString().slice(0, 19).replace('T', ' ')
        }]).catch(error => {
          console.error('轨迹上报失败:', error)
        })
      },
      (error) => {
        console.error('轨迹记录错误:', error)
      }
    )
  }

  const handleCheckIn = async (checkpointId) => {
    if (!currentLocation) {
      message.warning('正在获取位置，请稍后...')
      await fetchLocation()
      return
    }

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
      console.error('签到失败:', error)
      message.error('签到失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getCheckpointStatus = (checkpointId) => {
    const record = checkinStatus?.checkInRecords?.find(r => r.checkpointId === checkpointId)
    if (!record) return 'pending'

    return record.status === 1 ? 'completed' : record.status === 2 ? 'late' : 'completed'
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
              <Space>
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
                <Button
                  size="small"
                  type="default"
                  onClick={handleForceGpsLocation}
                  loading={locating}
                  style={{ color: '#1890ff' }}
                >
                  强制GPS
                </Button>
                <Button
                  size="small"
                  type="default"
                  onClick={handleLocationDiagnostics}
                  loading={diagnosing}
                  style={{ color: '#722ed1' }}
                >
                  定位诊断
                </Button>
                <Button
                  size="small"
                  type="default"
                  onClick={handleManualLocation}
                  style={{ color: '#f5222d' }}
                >
                  手动定位
                </Button>
                {currentLocation && currentLocation.originalLatitude && (
                  <Button
                    size="small"
                    type="link"
                    onClick={() => {
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
                    }}
                  >
                    查看转换详情
                  </Button>
                )}
              </Space>
            </div>
            <Progress
              percent={checkinProgress}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068'
              }}
              format={() => `${checkinStatus?.checkInRecords?.length || 0} / ${checkpoints.length}`}
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
              style={{ marginBottom: 16 }}
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
              className="location-error-alert"
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 当前位置信息 */}
          {currentLocation && (
            <Alert
              message="当前位置"
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <EnvironmentOutlined />
                    <span style={{ marginLeft: 8 }}>
                      纬度: {currentLocation.latitude.toFixed(6)}，
                      经度: {currentLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    坐标系: {currentLocation.coordinateSystem || 'GCJ02'}
                    {currentLocation.accuracy && (
                      <span> · 精度: ±{Math.round(currentLocation.accuracy)}米</span>
                    )}
                  </div>
                  {currentLocation.originalLatitude && (
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      原始坐标(WGS84): {currentLocation.originalLatitude.toFixed(6)}, {currentLocation.originalLongitude.toFixed(6)}
                    </div>
                  )}
                  {currentLocation.address && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      地址: {currentLocation.address}
                    </div>
                  )}
                </Space>
              }
              type="info"
              showIcon
              className="location-alert"
            />
          )}

          {/* 地图显示 */}
          <div className="map-section">
            <MapView
              center={currentLocation ? {
                lng: currentLocation.longitude,
                lat: currentLocation.latitude
              } : undefined}
              height="400px"
              showCurrentLocation={true}
              markers={checkpoints.map(cp => ({
                lng: cp.longitude,
                lat: cp.latitude,
                title: cp.name,
                content: `<div>${cp.name}</div>`
              }))}
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
                  >
                    <div className="checkpoint-header">
                      <Space>
                        <span className="checkpoint-seq">序号{checkpoint.sequence}</span>
                        <span className="checkpoint-name">{checkpoint.name}</span>
                        {isNext && (
                          <Tag color="orange">下一签到点</Tag>
                        )}
                      </Space>
                    </div>

                    <div className="checkpoint-body">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {distance !== null && status === 'pending' && (
                          <div className="checkpoint-distance">
                            <EnvironmentOutlined />
                            <span>距离: {formatDistance(distance)}</span>
                          </div>
                        )}

                        <div className="checkpoint-info">
                          <span>签到半径: {checkpoint.radius}米</span>
                          {checkpoint.expectedArriveMinutes && (
                            <span>
                              <ClockCircleOutlined />
                              预计到达: {dayjs().startOf('day').add(checkpoint.expectedArriveMinutes, 'minute').format('HH:mm')}
                            </span>
                          )}
                        </div>
                      </Space>
                    </div>

                    <div className="checkpoint-footer">
                      {status === 'completed' && (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          已签到 {checkinStatus?.checkInRecords?.find(r => r.checkpointId === checkpoint.id)?.checkInTime &&
                            dayjs(checkinStatus.checkInRecords.find(r => r.checkpointId === checkpoint.id).checkInTime).format('HH:mm')
                          }
                        </Tag>
                      )}

                      {status === 'pending' && (
                        <Button
                          type="primary"
                          onClick={() => handleCheckIn(checkpoint.id)}
                          loading={loading}
                          disabled={!currentLocation || distance > checkpoint.radius}
                          block
                        >
                          {distance !== null && distance > checkpoint.radius
                            ? `距离${formatDistance(distance)}，未到签到范围`
                            : '立即签到'
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
            <Alert
              message="🎉 恭喜！"
              description="您已完成所有签到点签到，请等待活动结束"
              type="success"
              showIcon
              className="complete-alert"
            />
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

