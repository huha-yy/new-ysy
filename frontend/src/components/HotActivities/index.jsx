import { Card, Row, Col, Empty, Skeleton, Select } from 'antd'
import { FireOutlined, FilterOutlined, CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { DIFFICULTY } from '../../utils/constants'
import ActivityCard from '../ActivityCard'
import { useNavigate } from 'react-router-dom'
import './HotActivities.css'

function HotActivities({ activities, loading, filters, onFilterChange }) {
  const navigate = useNavigate()

  return (
    <div className="hot-activities-section">
      {/* 装饰背景 */}
      <div className="section-decoration">
        <div className="deco-circle deco-circle-1" />
        <div className="deco-circle deco-circle-2" />
      </div>

      <Card className="hot-activities-card" loading={loading}>
        <div className="section-header">
          <div className="section-title">
            <div className="title-icon-wrapper">
              <FireOutlined className="title-icon" />
            </div>
            <div className="title-text">
              <h2>热门活动</h2>
              <p className="title-desc">发现精彩户外体验，开启你的探险之旅</p>
            </div>
          </div>
          <div className="section-actions">
            {/* 筛选器 */}
            <div className="filter-group">
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
            </div>

            <button className="view-all-btn" onClick={() => navigate('/activities')}>
              <span>查看全部</span>
              <ArrowRightOutlined />
            </button>
          </div>
        </div>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3, 4].map((index) => (
              <Col key={index} xs={24} sm={12} md={8} lg={6}>
                <Card className="activity-skeleton">
                  <Skeleton.Input active style={{ width: '100%', height: 180 }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : activities?.length === 0 ? (
          <Empty 
            description="暂无符合条件的活动" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="empty-state"
          />
        ) : (
          <div className="activities-grid">
            {activities?.map((activity) => (
              <div key={activity.id} className="activity-item">
                <ActivityCard activity={activity} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default HotActivities
