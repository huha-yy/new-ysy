import { Rate, Progress, Space, Statistic } from 'antd'
import { StarOutlined, UserOutlined } from '@ant-design/icons'
import './ReviewStats.css'

/**
 * 评价统计组件
 * 展示活动的评分统计和评价分布
 */
const ReviewStats = ({
  overallRating = 0,
  routeRating = 0,
  organizationRating = 0,
  safetyRating = 0,
  totalReviews = 0,
  ratingDistribution = []
}) => {
  // 评分等级描述
  const getRatingText = (rating) => {
    if (rating >= 4.5) return '非常好'
    if (rating >= 4) return '很好'
    if (rating >= 3.5) return '好'
    if (rating >= 3) return '一般'
    if (rating >= 2) return '较差'
    return '很差'
  }

  // 评分百分比
  const getRatingPercent = (rating) => {
    if (totalReviews === 0) return 0
    const count = ratingDistribution.find(d => d.rating === rating)?.count || 0
    return Math.round((count / totalReviews) * 100)
  }

  return (
    <div className="review-stats">
      {/* 总体评分 */}
      <div className="stats-overview">
        <div className="rating-big">
          <div className="rating-number">
            {overallRating.toFixed(1)}
          </div>
          <div className="rating-stars">
            <Rate
              disabled
              value={overallRating}
              allowHalf
              character={<StarOutlined />}
              style={{ fontSize: 28 }}
            />
          </div>
          <div className="rating-text">
            {getRatingText(overallRating)}
          </div>
        </div>

        <div className="stats-count">
          <Statistic
            title="总评价数"
            value={totalReviews}
            prefix={<UserOutlined />}
          />
        </div>
      </div>

      {/* 评分分布 */}
      <div className="rating-distribution">
        <h4>评分分布</h4>
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="rating-bar">
            <Space align="center">
              <span className="rating-label">{rating} 星</span>
              <Progress
                percent={getRatingPercent(rating)}
                showInfo={false}
                strokeColor="#faad14"
                trailColor="#f5f5f5"
                style={{ width: 200 }}
              />
              <span className="rating-count">
                {ratingDistribution.find(d => d.rating === rating)?.count || 0}
              </span>
            </Space>
          </div>
        ))}
      </div>

      {/* 各项评分 */}
      <div className="rating-details">
        <h4>各项评分</h4>
        <div className="rating-items">
          <div className="rating-item">
            <div className="rating-item-label">整体评价</div>
            <Rate
              disabled
              value={overallRating}
              allowHalf
              style={{ fontSize: 20 }}
            />
            <span className="rating-item-value">
              {overallRating.toFixed(1)}
            </span>
          </div>

          <div className="rating-item">
            <div className="rating-item-label">路线规划</div>
            <Rate
              disabled
              value={routeRating}
              allowHalf
              style={{ fontSize: 20 }}
            />
            <span className="rating-item-value">
              {routeRating.toFixed(1)}
            </span>
          </div>

          <div className="rating-item">
            <div className="rating-item-label">组织安排</div>
            <Rate
              disabled
              value={organizationRating}
              allowHalf
              style={{ fontSize: 20 }}
            />
            <span className="rating-item-value">
              {organizationRating.toFixed(1)}
            </span>
          </div>

          <div className="rating-item">
            <div className="rating-item-label">安全保障</div>
            <Rate
              disabled
              value={safetyRating}
              allowHalf
              style={{ fontSize: 20 }}
            />
            <span className="rating-item-value">
              {safetyRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewStats

