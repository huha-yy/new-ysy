import { Card, Row, Col, Tag, Pagination, Spin } from 'antd'
import { CalendarOutlined, TeamOutlined, EnvironmentOutlined, FireOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivityList } from '../../../api/activity'
import { DIFFICULTY_MAP } from '../../../utils/constants'
import { getImageUrl } from '../../../utils/imageUrl'
import './List.css'

function ActivityList() {
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  })
  const navigate = useNavigate()

  // 获取活动列表
  const fetchActivities = async (page = 1) => {
    setLoading(true)
    try {
      const result = await getActivityList({
        pageNum: page,
        pageSize: pagination.pageSize
      })
      setActivities(result.records || [])
      setPagination({
        current: result.current,
        pageSize: result.size,
        total: result.total
      })
    } catch (error) {
      console.error('获取活动列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const handlePageChange = (page) => {
    fetchActivities(page)
  }

  const handleActivityClick = (id) => {
    navigate(`/activities/${id}`)
  }

  if (loading && activities.length === 0) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="activity-list-page">
      <div className="container">
        <h2 className="page-title">
          <CalendarOutlined /> 活动列表
        </h2>
        
        {activities.length === 0 ? (
          <div className="empty-state">
            暂无活动数据
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]} className="activity-list">
              {activities.map((activity) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={activity.id}>
                  <Card
                    hoverable
                    className="activity-card"
                    cover={
                      activity.coverImage && (
                        <div className="card-cover" style={{ backgroundImage: `url(${getImageUrl(activity.coverImage)})` }}>
                          {activity.isFull && (
                            <div className="card-tag">已满员</div>
                          )}
                        </div>
                      )
                    }
                    onClick={() => handleActivityClick(activity.id)}
                  >
                    <Card.Meta
                      title={activity.title}
                      description={
                        <div className="card-info">
                          <div className="info-row">
                            <EnvironmentOutlined />
                            <span>{activity.routeName}</span>
                          </div>
                          <div className="info-row">
                            <CalendarOutlined />
                            <span>{activity.activityDate}</span>
                          </div>
                          <div className="info-row">
                            <Tag color={getDifficultyColor(activity.difficultyLevel)}>
                              {activity.difficultyText}
                            </Tag>
                            <span>
                              <TeamOutlined /> {activity.currentParticipants}/{activity.maxParticipants}
                            </span>
                          </div>
                          <div className="fee-row">
                            <span className="fee">¥{activity.fee}</span>
                            <span className="views"><FireOutlined /> {activity.viewCount}</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <Pagination
              className="pagination"
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 个活动`}
            />
          </>
        )}
      </div>
    </div>
  )
}

// 获取难度对应的颜色
const getDifficultyColor = (level) => {
  const colors = {
    1: 'green',    // 休闲
    2: 'blue',     // 简单
    3: 'orange',   // 中等
    4: 'red',      // 困难
    5: 'magenta'   // 极限
  }
  return colors[level] || 'default'
}

export default ActivityList

