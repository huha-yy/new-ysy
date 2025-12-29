import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Empty, BackTop, Skeleton, Select } from 'antd'
import { CalendarOutlined, TeamOutlined, SafetyOutlined, FireOutlined, ArrowUpOutlined, FilterOutlined } from '@ant-design/icons'
import { DIFFICULTY_MAP, DIFFICULTY } from '../../utils/constants'
import { getActivityList } from '../../api/activity'
import ActivityCard from '../../components/ActivityCard'
import BannerCarousel from '../../components/BannerCarousel'
import CountUp from '../../components/CountUp'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [showBackTop, setShowBackTop] = useState(false)
  const [filters, setFilters] = useState({
    difficulty: undefined,
    time: undefined
  })
  const navigate = useNavigate()

  // 监听滚动，显示回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackTop(true)
      } else {
        setShowBackTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 加载热门活动
  const loadHotActivities = async () => {
    setLoading(true)
    try {
      const result = await getActivityList({
        pageNum: 1,
        pageSize: 8
      })
      console.log('活动数据:', result)
      setActivities(result.records || [])
    } catch (error) {
      console.error('加载热门活动失败:', error)
      // 设置模拟数据用于测试
      setActivities([
        {
          id: 1,
          title: '黄山风景区一日游',
          startDate: '2024-02-15',
          location: '安徽黄山',
          difficultyLevel: 2,
          maxParticipants: 30,
          registrationCount: 24,
          price: 299,
          coverImage: '/public/images/activities/activity-1.jpg',
          isHot: true
        },
        {
          id: 2,
          title: '杭州西湖徒步',
          startDate: '2024-02-20',
          location: '浙江杭州',
          difficultyLevel: 1,
          maxParticipants: 50,
          registrationCount: 42,
          price: 0,
          coverImage: '/public/images/activities/activity-2.jpg',
          isHot: true
        },
        {
          id: 3,
          title: '泰山日出之旅',
          startDate: '2024-02-25',
          location: '山东泰山',
          difficultyLevel: 3,
          maxParticipants: 20,
          registrationCount: 15,
          price: 399,
          coverImage: '/public/images/activities/activity-3.jpg',
          isHot: true
        },
        {
          id: 4,
          title: '长城徒步体验',
          startDate: '2024-03-01',
          location: '北京八达岭',
          difficultyLevel: 2,
          maxParticipants: 40,
          registrationCount: 35,
          price: 199,
          coverImage: '/public/images/activities/activity-4.jpg',
          isHot: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    loadHotActivities()
  }, [])

  return (
    <div className="home-page">
      {/* 🎠 轮播Banner */}
      <BannerCarousel />

      <div className="container">
        {/* 🔥 热门活动列表 */}
        <div className="hot-activities-section">
          <div className="section-header">
            <div className="section-title">
              <FireOutlined className="title-icon" />
              <h2>热门活动</h2>
            </div>
            <Button type="text" onClick={() => navigate('/activities')}>
              查看全部 →
            </Button>
          </div>

          {/* 筛选器 */}
          <div className="activity-filters">
            <Select
              placeholder="选择难度"
              allowClear
              suffixIcon={<FilterOutlined />}
              value={filters.difficulty}
              onChange={(value) => setFilters({ ...filters, difficulty: value })}
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
              value={filters.time}
              onChange={(value) => setFilters({ ...filters, time: value })}
              className="filter-select"
            >
              <Select.Option value="week">近一周</Select.Option>
              <Select.Option value="month">近一月</Select.Option>
            </Select>
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
          ) : activities.length === 0 ? (
            <Empty description="暂无热门活动" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Row gutter={[24, 24]}>
              {activities.map((activity) => (
                <Col key={activity.id} xs={24} sm={12} md={8} lg={6}>
                  <ActivityCard activity={activity} />
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* ✨ 功能特色 */}
        <div className="features">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="feature-card">
                <FireOutlined className="feature-icon" />
                <h3>热门活动</h3>
                <p>精选热门徒步路线</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="feature-card">
                <TeamOutlined className="feature-icon" />
                <h3>团队协作</h3>
                <p>专业组织者带队</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="feature-card">
                <SafetyOutlined className="feature-icon" />
                <h3>安全保障</h3>
                <p>GPS签到实时监控</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="feature-card">
                <CalendarOutlined className="feature-icon" />
                <h3>灵活报名</h3>
                <p>便捷的报名流程</p>
              </Card>
            </Col>
          </Row>
        </div>

        {/* 📊 介绍统计区 */}
        <div className="intro-section">
          <h2>关于我们</h2>
          <p>
            户外徒步活动管理系统是一个专为户外徒步爱好者打造的平台。
            我们提供专业的徒步路线推荐、活动组织、报名管理、GPS签到等功能，
            让每一次徒步都安全、愉快。
          </p>
          
          {/* 用户评价 */}
          <div className="reviews-section">
            <h3>用户评价</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card className="review-card">
                  <div className="review-content">
                    <div className="review-header">
                      <span className="review-avatar">👨</span>
                      <div>
                        <h4>张明</h4>
                        <div className="review-stars">⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p>"黄山徒步体验太棒了！组织者非常专业，风景美不胜收！"</p>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className="review-card">
                  <div className="review-content">
                    <div className="review-header">
                      <span className="review-avatar">👩</span>
                      <div>
                        <h4>李红</h4>
                        <div className="review-stars">⭐⭐⭐⭐</div>
                      </div>
                    </div>
                    <p>"西湖休闲徒步很放松，路线规划合理，强烈推荐！"</p>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card className="review-card">
                  <div className="review-content">
                    <div className="review-header">
                      <span className="review-avatar">👨</span>
                      <div>
                        <h4>王强</h4>
                        <div className="review-stars">⭐⭐⭐</div>
                      </div>
                    </div>
                    <p>"泰山日出非常壮观，虽然累但很值得！"</p>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3><CountUp end={1000} suffix="+" /></h3>
                <p>注册用户</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3><CountUp end={500} suffix="+" /></h3>
                <p>精彩活动</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3><CountUp end={100} suffix="+" /></h3>
                <p>专业组织者</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3><CountUp end={99} suffix="%" /></h3>
                <p>好评率</p>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* 🔝 回到顶部按钮 */}
      <BackTop visible={showBackTop} duration={1000}>
        <div className="back-top-btn">
          <ArrowUpOutlined />
        </div>
      </BackTop>
    </div>
  )
}

export default Home
