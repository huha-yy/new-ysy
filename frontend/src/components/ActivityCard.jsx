import { Card, Tag, Button } from 'antd'
import { 
  CalendarOutlined, 
  UserOutlined, 
  EnvironmentOutlined,
  FireOutlined
} from '@ant-design/icons'
import { DIFFICULTY_MAP, DIFFICULTY } from '../utils/constants'
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

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '待定'
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 处理活动图片
  const getImageUrl = () => {
    if (activity.coverImage) {
      return activity.coverImage
    }
    // 使用随机山地图片作为默认
    const randomId = activity.id ? activity.id % 9 + 1 : 1
    return `/public/images/activities/activity-${randomId}.jpg`
  }

  return (
    <Card
      hoverable
      className="activity-card"
      cover={
        <div className="activity-cover">
          <img 
            alt={activity.title || '活动图片'} 
            src={getImageUrl()}
            loading="lazy"
          />
          {activity.isHot && (
            <div className="hot-badge">
              <FireOutlined /> 热门
            </div>
          )}
          <div className="difficulty-badge">
            <Tag color={getDifficultyColor(activity.difficultyLevel)}>
              {DIFFICULTY_MAP[activity.difficultyLevel] || '未知'}
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
            <span>{formatDate(activity.startDate)}</span>
          </div>
          
          <div className="info-item">
            <UserOutlined />
            <span>
              {activity.registrationCount || 0}/{activity.maxParticipants || 0}
            </span>
          </div>
          
          <div className="info-item">
            <EnvironmentOutlined />
            <span>{activity.location || '未知地点'}</span>
          </div>
        </div>

        <div className="activity-footer">
          <div className="price">
            {activity.price === 0 || activity.price === null ? (
              <span className="free-tag">免费</span>
            ) : (
              <span className="price-tag">
                ¥{activity.price || 0}
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

