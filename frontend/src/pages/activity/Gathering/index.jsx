import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, message, Space, Divider, Alert, Empty } from 'antd'
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CarOutlined,
  AlertOutlined
} from '@ant-design/icons'
import { getGatheringPlan } from '../../../api/activity'
import { loadAmapScript } from '../../../utils/map'
import dayjs from 'dayjs'
import './Gathering.css'

function Gathering() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [gathering, setGathering] = useState(null)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    fetchGatheringPlan()
  }, [id])

  useEffect(() => {
    if (gathering?.gatheringLatitude && gathering?.gatheringLongitude) {
      initLocationMap()
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
    }
  }, [gathering])

  const initLocationMap = async () => {
    if (!mapRef.current) return
    try {
      const AMap = await loadAmapScript()
      const lng = parseFloat(gathering.gatheringLongitude)
      const lat = parseFloat(gathering.gatheringLatitude)
      const map = new AMap.Map(mapRef.current, {
        zoom: 15,
        center: [lng, lat],
        dragEnable: false,
        zoomEnable: false,
        scrollWheel: false
      })
      new AMap.Marker({
        position: [lng, lat],
        map
      })
      mapInstanceRef.current = map
    } catch (e) {
      console.error('地图加载失败', e)
    }
  }

  const fetchGatheringPlan = async () => {
    setLoading(true)
    try {
      const result = await getGatheringPlan(id)
      setGathering(result)
    } catch (error) {
      message.error('获取集合方案失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    message.success('已确认收到集合方案，请准时出席！')
  }

  const openInAmap = () => {
    window.open(
      `https://uri.amap.com/marker?position=${gathering.gatheringLongitude},${gathering.gatheringLatitude}&name=${encodeURIComponent(gathering.gatheringAddress)}`,
      '_blank'
    )
  }

  if (loading) {
    return (
      <div className="gathering-page">
        <div className="gathering-container">
          <Card loading />
        </div>
      </div>
    )
  }

  if (!gathering) {
    return (
      <div className="gathering-page">
        <div className="gathering-container">
          <Card>
            <Empty description="集合方案尚未发布">
              <Button type="primary" onClick={() => navigate(`/activities/${id}`)}>
                返回活动
              </Button>
            </Empty>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="gathering-page">
      <div className="gathering-container">
        {/* 页面标题 */}
        <div className="gathering-header">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/activities/${id}`)}
          >
            返回活动
          </Button>
          <Tag
            color={gathering.isPublished ? 'success' : 'default'}
            icon={gathering.isPublished ? <CheckCircleOutlined /> : null}
          >
            {gathering.isPublished ? '已发布' : '草稿'}
          </Tag>
        </div>

        {/* 注意事项提示 */}
        {gathering.notice && (
          <Alert
            message="注意事项"
            description={gathering.notice}
            type="warning"
            showIcon
            icon={<AlertOutlined />}
            className="gathering-notice"
          />
        )}

        {/* 集合信息卡片 */}
        <Card className="gathering-info-card" title="集合信息">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon time-icon">
                <ClockCircleOutlined />
              </div>
              <div className="info-content">
                <div className="info-label">集合时间</div>
                <div className="info-value time-value">
                  {dayjs(gathering.gatheringTime).format('YYYY年MM月DD日 HH:mm')}
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon location-icon">
                <EnvironmentOutlined />
              </div>
              <div className="info-content">
                <div className="info-label">集合地点</div>
                <div className="info-value">{gathering.gatheringAddress}</div>
                {gathering.gatheringLatitude && gathering.gatheringLongitude && (
                  <Button type="link" size="small" onClick={openInAmap} style={{ padding: 0 }}>
                    在高德地图中打开导航
                  </Button>
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon phone-icon">
                <PhoneOutlined />
              </div>
              <div className="info-content">
                <div className="info-label">组织者电话</div>
                <div className="info-value">
                  {gathering.organizerPhone ? (
                    <a href={`tel:${gathering.organizerPhone}`}>{gathering.organizerPhone}</a>
                  ) : '暂未提供'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 地图预览 */}
        {gathering.gatheringLatitude && gathering.gatheringLongitude && (
          <Card className="gathering-map-card" title="集合地点位置">
            <div className="gathering-map" ref={mapRef} />
          </Card>
        )}

        {/* 交通指引 */}
        {gathering.transportGuide && gathering.transportGuide !== '1' && (
          <Card className="gathering-detail-card" title={<><CarOutlined /> 交通指引</>}>
            <div className="detail-text">{gathering.transportGuide}</div>
          </Card>
        )}

        {/* 携带物品 */}
        {gathering.itemsToBring && gathering.itemsToBring !== '1' && (
          <Card className="gathering-detail-card" title={<><ShoppingOutlined /> 携带物品清单</>}>
            <pre className="detail-text pre-text">{gathering.itemsToBring}</pre>
          </Card>
        )}

        {/* 底部操作 */}
        <div className="gathering-footer">
          <Button
            type="primary"
            size="large"
            block
            onClick={handleConfirm}
            icon={<CheckCircleOutlined />}
            disabled={!gathering.isPublished}
          >
            确认收到集合方案
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Gathering
