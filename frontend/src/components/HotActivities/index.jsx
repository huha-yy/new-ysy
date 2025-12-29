import { Card, Row, Col, Empty, Skeleton, Select } from 'antd'
import { FireOutlined, FilterOutlined, CalendarOutlined } from '@ant-design/icons'
import { DIFFICULTY } from '../../utils/constants'
import ActivityCard from '../ActivityCard'
import { useNavigate } from 'react-router-dom'
import './HotActivities.css'

function HotActivities({ activities, loading, filters, onFilterChange }) {
  const navigate = useNavigate()

  return (
    <Card className="hot-activities-card" loading={loading}>
      <div className="section-header">
        <div className="section-title">
          <FireOutlined className="title-icon" />
          <h2>🔥 热门活动</h2>
        </div>
        <div className="section-actions">
          {/* 筛选器 */}
          <Select
            placeholder="选择难度"
            allowClear
            suffixIcon={<FilterOutlined />}
            value={filters?.difficulty}
            onChange={(value) => onFilterChange?.({ ...filters, difficulty: value })}
            className="filter-select"
          >
            <Select.Option value={DIFFICULTY.EASY}>休闲</Select.Option>
            <Select.Option value={DIFFICULTY.SIMPLE}>简单</Select.Option>
            <Select.Option value={DIFFICULTY.MEDIUM}>中等</Select.Option>
            <Select.Option value={DIFFICULTY.HARD}>困难</Select.Option>
            <Select.Option value={DIFFICULTY.EXTREME}>极限</Select.Option>
          </Select>

          <Select
            placeholder="选择时间"
            allowClear
            suffixIcon={<CalendarOutlined />}
            value={filters?.time}
            onChange={(value) => onFilterChange?.({ ...filters, time: value })}
            className="filter-select"
          >
            <Select.Option value="week">近一周</Select.Option>
            <Select.Option value="month">近一月</Select.Option>
          </Select>

          <div className="divider" />
          
          <button className="view-all-btn" onClick={() => navigate('/activities')}>
            查看全部 →
          </button>
        </div>
      </div>

      {loading ? (
        <Row gutter={[24, 24]}>
          {[1, 2, 3, 4].map((index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <Card className="activity-skeleton">
                <Skeleton.Input active style={{ width: '100%' }} />
                <Skeleton active paragraph={{ rows: 3 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : activities?.length === 0 ? (
        <Empty 
          description="暂无符合条件的活动" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '80px 0' }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {activities?.map((activity) => (
            <Col key={activity.id} xs={24} sm={12} md={8} lg={6}>
              <ActivityCard activity={activity} />
            </Col>
          ))}
        </Row>
      )}
    </Card>
  )
}

export default HotActivities

