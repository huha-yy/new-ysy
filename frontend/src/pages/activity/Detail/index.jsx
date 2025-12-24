import { useParams } from 'react-router-dom'
import { Spin, Tabs, Descriptions, Button, Tag, Space, message } from 'antd'
import { UserOutlined, CalendarOutlined, TeamOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { getActivityDetail } from '../../../api/activity'
import { DIFFICULTY_MAP } from '../../../utils/constants'
import './Detail.css'

function ActivityDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState(null)

  useEffect(() => {
    fetchActivityDetail()
  }, [id])

  const fetchActivityDetail = async () => {
    setLoading(true)
    try {
      const result = await getActivityDetail(id)
      setActivity(result)
    } catch (error) {
      console.error('获取活动详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    // TODO: 实现报名功能
    message.info('报名功能开发中...')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="empty-state">
        活动不存在或已被删除
      </div>
    )
  }

  return (
    <div className="activity-detail-page">
      <div className="container">
        {/* 活动封面 */}
        {activity.coverImage && (
          <div className="activity-cover" style={{ backgroundImage: `url(${activity.coverImage})` }} />
        )}

        {/* 活动标题和基本信息 */}
        <div className="activity-header">
          <h1 className="activity-title">{activity.title}</h1>
          <Space className="activity-tags" size="middle">
            <Tag color={getDifficultyColor(activity.difficultyLevel)}>
              {activity.difficultyText}
            </Tag>
            <Tag icon={<CalendarOutlined />}>
              {activity.activityDate}
            </Tag>
            <Tag icon={<TeamOutlined />}>
              {activity.currentParticipants}/{activity.maxParticipants}人
            </Tag>
          </Space>
        </div>

        {/* Tab 内容 */}
        <Tabs
          defaultActiveKey="detail"
          className="activity-tabs"
          items={[
            {
              key: 'detail',
              label: '活动详情',
              children: (
                <div className="tab-content">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="组织者">
                      <Space>
                        {activity.organizerAvatar && (
                          <img src={activity.organizerAvatar} alt="" className="organizer-avatar" />
                        )}
                        <span>{activity.organizerNickname}</span>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="活动日期">
                      {activity.activityDate} {activity.startTime}
                    </Descriptions.Item>
                    <Descriptions.Item label="预计时长">
                      {activity.durationHours}小时
                    </Descriptions.Item>
                    <Descriptions.Item label="费用">
                      ¥{activity.fee}
                    </Descriptions.Item>
                    <Descriptions.Item label="人数">
                      {activity.currentParticipants}/{activity.maxParticipants}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Tag color={getStatusColor(activity.status)}>
                        {activity.statusText}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="装备要求" span={2}>
                      {activity.equipmentRequirement || '无特殊要求'}
                    </Descriptions.Item>
                    <Descriptions.Item label="体能要求" span={2}>
                      {activity.fitnessRequirement || '无特殊要求'}
                    </Descriptions.Item>
                    <Descriptions.Item label="活动描述" span={2}>
                      <div className="description-content">
                        {activity.description}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              )
            },
            {
              key: 'route',
              label: '路线信息',
              children: (
                <div className="tab-content">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="路线名称">
                      {activity.routeName}
                    </Descriptions.Item>
                    <Descriptions.Item label="地区">
                      {activity.routeRegion}
                    </Descriptions.Item>
                    <Descriptions.Item label="总里程">
                      {activity.routeTotalDistance}公里
                    </Descriptions.Item>
                    <Descriptions.Item label="累计爬升">
                      {activity.routeElevationGain}米
                    </Descriptions.Item>
                    <Descriptions.Item label="预计用时">
                      {activity.routeEstimatedHours}小时
                    </Descriptions.Item>
                    <Descriptions.Item label="难度">
                      <Tag color={getDifficultyColor(activity.routeDifficultyLevel)}>
                        {activity.routeDifficultyText}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="起点">
                      {activity.routeStartPointName}
                    </Descriptions.Item>
                    <Descriptions.Item label="终点">
                      {activity.routeEndPointName}
                    </Descriptions.Item>
                  </Descriptions>
                  <div className="route-map">
                    {/* TODO: 集成高德地图显示路线 */}
                    <div className="map-placeholder">
                      <EnvironmentOutlined />
                      <span>地图功能开发中...</span>
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'reviews',
              label: '评价',
              children: (
                <div className="tab-content">
                  {/* TODO: 实现评价列表 */}
                  <div className="empty-state">
                    评价功能开发中...
                  </div>
                </div>
              )
            }
          ]}
        />

        {/* 底部操作栏 */}
        <div className="activity-footer">
          <div className="organizer-info">
            {activity.organizerAvatar && (
              <img src={activity.organizerAvatar} alt="" className="organizer-avatar" />
            )}
            <div className="organizer-name">
              {activity.organizerNickname}
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleRegister}
            disabled={activity.isFull || activity.status !== 2}
          >
            {activity.isFull ? '已报满' : '立即报名'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// 获取难度对应的颜色
const getDifficultyColor = (level) => {
  const colors = {
    1: 'green',
    2: 'blue',
    3: 'orange',
    4: 'red',
    5: 'magenta'
  }
  return colors[level] || 'default'
}

// 获取状态对应的颜色
const getStatusColor = (status) => {
  const colors = {
    0: 'default',  // 草稿
    1: 'orange',   // 待审核
    2: 'green',    // 已发布
    3: 'blue',     // 进行中
    4: 'default',  // 已结束
    5: 'red',      // 已取消
    6: 'red'       // 已驳回
  }
  return colors[status] || 'default'
}

export default ActivityDetail

