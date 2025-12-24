import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Tag, message, Space, Divider, Alert } from 'antd'
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'
import { getGatheringPlan } from '../../../api/activity'
import dayjs from 'dayjs'
import './Gathering.css'

function Gathering() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [gathering, setGathering] = useState(null)

  useEffect(() => {
    fetchGatheringPlan()
  }, [id])

  const fetchGatheringPlan = async () => {
    setLoading(true)
    try {
      const result = await getGatheringPlan(id)
      setGathering(result)
    } catch (error) {
      console.error('获取集合方案失败:', error)
      message.error('获取集合方案失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    // TODO: 实现确认出行功能
    message.success('已确认收到集合方案，请准时出席！')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">加载中...</div>
      </div>
    )
  }

  if (!gathering) {
    return (
      <div className="empty-state">
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#999' }} />
        <p>集合方案尚未发布</p>
        <Button type="primary" onClick={() => navigate(`/activities/${id}`)}>
          返回活动
        </Button>
      </div>
    )
  }

  return (
    <div className="gathering-page">
      <div className="container">
        <Card
          title="📍 集合方案"
          className="gathering-card"
          extra={
            <Button
              onClick={() => navigate(`/activities/${id}`)}
              icon={<ArrowLeftOutlined />}
            >
              返回活动
            </Button>
          }
        >
          {/* 重要提示 */}
          {gathering.notice && (
            <Alert
              message="重要提示"
              description={gathering.notice}
              type="warning"
              showIcon
              className="gathering-alert"
            />
          )}

          {/* 集合信息 */}
          <Divider orientation="left" className="section-divider">
            集合信息
          </Divider>

          <Descriptions bordered column={1} className="gathering-descriptions">
            <Descriptions.Item label="集合时间" labelStyle={{ width: 120 }}>
              <Space>
                <ClockCircleOutlined style={{ color: '#FFA726' }} />
                <span className="gathering-time">
                  {dayjs(gathering.gatheringTime).format('YYYY年MM月DD日 HH:mm')}
                </span>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="集合地点">
              <Space direction="vertical">
                <Space>
                  <EnvironmentOutlined style={{ color: '#4ADE80' }} />
                  <span className="gathering-address">
                    {gathering.gatheringAddress}
                  </span>
                </Space>
                {gathering.gatheringLatitude && gathering.gatheringLongitude && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      window.open(
                        `https://uri.amap.com/marker?position=${gathering.gatheringLongitude},${gathering.gatheringLatitude}&name=${encodeURIComponent(gathering.gatheringAddress)}`,
                        '_blank'
                      )
                    }}
                    className="map-link"
                  >
                    在地图中查看
                  </Button>
                )}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="组织者电话">
              <Space>
                <PhoneOutlined style={{ color: '#00D9FF' }} />
                <span className="organizer-phone">
                  {gathering.organizerPhone || '暂未提供'}
                </span>
              </Space>
            </Descriptions.Item>
          </Descriptions>

          {/* 交通指引 */}
          {gathering.transportGuide && (
            <>
              <Divider orientation="left" className="section-divider">
                交通指引
              </Divider>
              <div className="transport-guide">
                <SafetyCertificateOutlined style={{ fontSize: 20, marginRight: 8 }} />
                <span>{gathering.transportGuide}</span>
              </div>
            </>
          )}

          {/* 携带物品 */}
          {gathering.itemsToBring && (
            <>
              <Divider orientation="left" className="section-divider">
                携带物品清单
              </Divider>
              <div className="items-to-bring">
                <ShoppingOutlined style={{ fontSize: 20, marginRight: 8 }} />
                <pre className="items-content">
                  {gathering.itemsToBring}
                </pre>
              </div>
            </>
          )}

          {/* 注意事项 */}
          {gathering.notice && (
            <>
              <Divider orientation="left" className="section-divider">
                注意事项
              </Divider>
              <div className="notices">
                <SafetyCertificateOutlined style={{ fontSize: 20, marginRight: 8 }} />
                <ul className="notice-list">
                  {gathering.notice.split('\n').map((notice, index) => (
                    <li key={index}>{notice}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* 发布信息 */}
          <Divider orientation="left" className="section-divider">
            发布信息
          </Divider>

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="发布时间">
              {gathering.publishTime
                ? dayjs(gathering.publishTime).format('YYYY-MM-DD HH:mm')
                : '未发布'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                color={gathering.isPublished ? 'success' : 'default'}
                icon={gathering.isPublished ? <CheckCircleOutlined /> : null}
              >
                {gathering.isPublished ? '已发布' : '草稿'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* 底部操作 */}
          <div className="gathering-actions">
            <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                size="large"
                onClick={() => navigate(`/activities/${id}`)}
                icon={<ArrowLeftOutlined />}
              >
                返回
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleConfirm}
                icon={<CheckCircleOutlined />}
                disabled={!gathering.isPublished}
              >
                确认收到
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Gathering

