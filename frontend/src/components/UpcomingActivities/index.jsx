import { Card, Row, Col, Empty, Button, Tag } from 'antd'
import { ClockCircleOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons'
import ActivityCard from '../ActivityCard'
import { useNavigate } from 'react-router-dom'
import './UpcomingActivities.css'

function UpcomingActivities({ activities, loading }) {
  const navigate = useNavigate()

  // 将报名记录转换为活动卡片数据格式
  const activityList = activities?.map(reg => ({
    id: reg.activityId,
    title: reg.activityTitle,
    coverImage: reg.activityCoverImage,
    startDate: reg.activityDate,
    location: reg.activityTitle,  // 暂时用标题代替位置
    difficultyLevel: 1,  // 默认难度，因为后端没返回
    maxParticipants: 20,  // 默认值
    registrationCount: 0,  // 默认值
    isHot: false,
    // 添加状态标签信息
    _registrationData: reg  // 保存原始报名数据
  })) || []

  return (
    <Card className="upcoming-activities-card" loading={loading}>
      <div className="section-header">
        <div className="section-title">
          <ClockCircleOutlined className="title-icon" />
          <h3>🗓️ 即将参加的活动</h3>
        </div>
        {activities?.length > 0 && (
          <Button type="text" onClick={() => navigate('/user/registrations')}>
            查看全部 →
          </Button>
        )}
      </div>

      {activities?.length === 0 ? (
        <Empty 
          description="暂无即将参加的活动"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '40px 0' }}
        >
          <Button type="primary" onClick={() => navigate('/activities')}>
            去浏览活动
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {activityList.slice(0, 3).map((activity) => (
            <Col key={activity.id} xs={24} sm={12} md={8}>
              <ActivityCard activity={activity} />
            </Col>
          ))}
        </Row>
      )}
    </Card>
  )
}

export default UpcomingActivities

