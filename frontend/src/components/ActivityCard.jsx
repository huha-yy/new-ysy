import { Card, Tag, Button } from 'antd'
import {
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  FireOutlined
} from '@ant-design/icons'
import { DIFFICULTY_MAP, DIFFICULTY } from '../utils/constants'
import { getActivityCoverUrl } from '../utils/imageUrl'
import { useNavigate } from 'react-router-dom'
import './ActivityCard.css'

function ActivityCard({ activity }) {
  const navigate = useNavigate()

  if (!activity) return null

  // 获取难度标签颜色
  const getDifficultyColor = (level) => {
    const colors = {
      [DIFFICULTY.EASY]: 'success',
      [DIFFICULTY.SIMPLE]: 'success',
      [DIFFICULTY.MEDIUM]: 'warning',
      [DIFFICULTY.HARD]: 'error',
      [DIFFICULTY.EXTREME]: 'error'
    }
    return colors[level] || 'default'
  }

  // 格式化日期 - 兼容多种字段名
  const formatDate = (activity) => {
    const dateStr = activity.activityDate || activity.startDate
    if (!dateStr) return '待定'
    // 如果已经是格式化的字符串（如 "2024-02-15"），直接返回
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      return dateStr
    }
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 获取地点 - 兼容多种字段名
  const getLocation = () => {
    return activity.routeName || activity.location || '未知地点'
  }

  // 获取报名人数 - 兼容多种字段名
  const getCurrentCount = () => {
    return activity.currentParticipants || activity.registrationCount || 0
  }

  // 获取费用 - 兼容多种字段名
  const getFee = () => {
    const fee = activity.fee !== undefined ? activity.fee : activity.price
    return fee
  }

  // 获取难度文本
  const getDifficultyText = () => {
    return activity.difficultyText || DIFFICULTY_MAP[activity.difficultyLevel] || '未知'
  }

  const fee = getFee()

  return (
    <Card
      hoverable
      className="activity-card"
      cover={
        <div className="activity-cover">
          <img
            alt={activity.title || '活动图片'}
            src={getActivityCoverUrl(activity)}
            loading="lazy"
          />
          {activity.isHot && (
            <div className="hot-badge">
              <FireOutlined /> 热门
            </div>
          )}
          <div className="difficulty-badge">
            <Tag color={getDifficultyColor(activity.difficultyLevel)}>
              {getDifficultyText()}
            </Tag>
          </div>
        </div>
      }
      onClick={() => navigate(`/activities/${activity.id}`)}
    >
      <div className="activity-content">
        <h3 className="activity-title">{activity.title || '未命名活动'}</h3>
        
        <div className="activity-info">
          <div className="info-item">
            <CalendarOutlined />
            <span>{formatDate(activity)}</span>
          </div>
          
          <div className="info-item">
            <UserOutlined />
            <span>
              {getCurrentCount()}/{activity.maxParticipants || 0}
            </span>
          </div>
          
          <div className="info-item">
            <EnvironmentOutlined />
            <span>{getLocation()}</span>
          </div>
        </div>

        <div className="activity-footer">
          <div className="price">
            {fee === 0 || fee === null || fee === undefined ? (
              <span className="free-tag">免费</span>
            ) : (
              <span className="price-tag">
                ¥{fee}
                <span className="unit">/人</span>
              </span>
            )}
          </div>
          <Button 
            type="primary" 
            size="small"
            className="detail-btn"
          >
            查看详情
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default ActivityCard
