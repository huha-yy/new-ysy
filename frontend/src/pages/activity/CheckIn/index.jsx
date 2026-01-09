import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, message, Space, Tag, Progress, Modal, Alert } from 'antd'
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LocationOutlined,
  WarningOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import MapView from '../../../components/MapView/MapView'
import { getCheckpoints, getCheckinStatus, checkin as checkinApi, reportTrack } from '../../../api/checkin'
import { getLocation, checkIn, TrackRecorder } from '../../../utils/location'
import { formatDistance } from '../../../utils/map'
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
  const [checkinProgress, setCheckinProgress] = useState(0)
  const [nextCheckpoint, setNextCheckpoint] = useState(null)

  const [trackRecorder] = useState(new TrackRecorder())
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    fetchCheckinData()
    return () => {
      // 停止轨迹记录
      if (isRecording) {
        trackRecorder.stop()
      }
    }
  }, [id])

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
    // 自动获取位置（每30秒）
    const interval = setInterval(() => {
      if (!locating) {
        fetchLocation()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [locating])

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
      const location = await getLocation()
      setCurrentLocation(location)
    } catch (error) {
      console.error('获取位置失败:', error)
      // 不显示错误提示，避免频繁打扰用户
    } finally {
      setLocating(false)
    }
  }

  const startTrackRecording = () => {
    if (isRecording) return

    setIsRecording(true)
    trackRecorder.start(
      (track) => {
        console.log('轨迹记录:', track)
        // 上报轨迹到后端
        reportTrack({
          activityId: Number(id),
          latitude: track.latitude,
          longitude: track.longitude,
          timestamp: track.timestamp
        }).catch(error => {
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

    const distance = Math.round(
      Math.sqrt(
        Math.pow(currentLocation.latitude - checkpoint.latitude, 2) +
        Math.pow(currentLocation.longitude - checkpoint.longitude, 2)
      ) * 111000
    )

    return distance
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

          {/* 当前位置信息 */}
          {currentLocation && (
            <Alert
              message="当前位置"
              description={
                <Space>
                  <LocationOutlined />
                  <span>
                    纬度: {currentLocation.latitude.toFixed(6)}，
                    经度: {currentLocation.longitude.toFixed(6)}
                  </span>
                  {currentLocation.address && (
                    <span style={{ color: '#999' }}>
                      ({currentLocation.address})
                    </span>
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
                            <LocationOutlined />
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
      </div>
    </div>
  )
}

export default CheckIn

