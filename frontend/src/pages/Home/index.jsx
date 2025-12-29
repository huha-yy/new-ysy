import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Empty, FloatButton, Skeleton, Select } from 'antd'
import { CalendarOutlined, TeamOutlined, SafetyOutlined, FireOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { DIFFICULTY_MAP, DIFFICULTY } from '../../utils/constants'
import { getActivityList, getJoinedActivities } from '../../api/activity'
import BannerCarousel from '../../components/BannerCarousel'
import CountUp from '../../components/CountUp'
import UserDashboard from '../../components/UserDashboard'
import UpcomingActivities from '../../components/UpcomingActivities'
import HotActivities from '../../components/HotActivities'
import Features from '../../components/Features'
import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [upcomingActivities, setUpcomingActivities] = useState([])
  const [showBackTop, setShowBackTop] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [userStats, setUserStats] = useState(null)
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

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  // 加载热门活动
  const loadHotActivities = async () => {
    setLoading(true)
    try {
      const result = await getActivityList({
        pageNum: 1,
        pageSize: 8,
        difficultyLevel: filters.difficulty,
        timeRange: filters.time
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
          coverImage: '/images/activities/activity-1.jpg',
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
          coverImage: '/images/activities/activity-2.jpg',
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
          coverImage: '/images/activities/activity-3.jpg',
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
          coverImage: '/images/activities/activity-4.jpg',
          isHot: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // 加载用户报名的活动
  const loadUpcomingActivities = async () => {
    try {
      const result = await getJoinedActivities({
        pageNum: 1,
        pageSize: 10
      })
      const records = result?.records || result || []
      console.log('用户报名活动数据:', records)
      
      // 过滤出即将开始的活动（状态=1已通过，且活动日期在当前时间之后）
      const upcoming = records.filter(item => {
        const activityDate = item.activityDate  // 后端返回的是 activityDate (String)
        const status = item.status  // 0待审核 1已通过 2已拒绝 3候补中 4已取消 5已缺席
        return status === 1 && activityDate && new Date(activityDate) > new Date()
      })
      
      setUpcomingActivities(upcoming.slice(0, 3))
      
      // 设置用户统计数据
      const completed = records.filter(item => item.status === 5).length  // 5=已缺席（表示已参加）
      
      setUserStats({
        totalActivities: records.length,
        completedActivities: completed,
        upcomingActivities: upcoming.length,
        completionRate: records.length > 0 
          ? Math.round((completed / records.length) * 100) 
          : 100
      })
    } catch (error) {
      console.error('加载用户活动失败:', error)
      // 出错时设置空数组，不影响其他功能
      setUpcomingActivities([])
      setUserStats({
        totalActivities: 0,
        completedActivities: 0,
        upcomingActivities: 0,
        completionRate: 100
      })
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    loadHotActivities()
    if (isLoggedIn) {
      loadUpcomingActivities()
    }
  }, [isLoggedIn])

  // 筛选条件变化时重新加载
  useEffect(() => {
    loadHotActivities()
  }, [filters])

  return (
    <div className="home-page">
      {/* 🎠 轮播Banner */}
      <BannerCarousel />

      <div className="container">
        {isLoggedIn ? (
          // 🟢 登录后：个性化内容
          <>
            {/* 用户数据概览 */}
            <UserDashboard userData={userStats || currentUser} />

            {/* 即将参加的活动 */}
            <UpcomingActivities 
              activities={upcomingActivities} 
              loading={loading} 
            />

            {/* 热门推荐 */}
            <HotActivities 
              activities={activities}
              loading={loading}
              filters={filters}
              onFilterChange={setFilters}
            />
          </>
        ) : (
          // 🔵 未登录：营销内容
          <>
            {/* 热门活动 */}
            <HotActivities 
              activities={activities}
              loading={loading}
              filters={filters}
              onFilterChange={setFilters}
            />

            {/* 功能特色 */}
            <Features />

            {/* 关于我们 */}
            <Card className="about-section">
              <h2>🎯 关于我们</h2>
              <p>
                户外徒步活动管理系统是一个专为户外徒步爱好者打造的平台。
                我们提供专业的徒步路线推荐、活动组织、报名管理、GPS签到等功能，
                让每一次徒步都安全、愉快。
              </p>
              
              {/* 用户评价 */}
              <div className="reviews-section">
                <h3>💬 用户评价</h3>
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

              {/* 平台统计 */}
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={12} sm={12} md={6}>
                  <Card className="stat-card">
                    <h3><CountUp end={1000} suffix="+" /></h3>
                    <p>注册用户</p>
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card className="stat-card">
                    <h3><CountUp end={500} suffix="+" /></h3>
                    <p>精彩活动</p>
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card className="stat-card">
                    <h3><CountUp end={100} suffix="+" /></h3>
                    <p>专业组织者</p>
                  </Card>
                </Col>
                <Col xs={12} sm={12} md={6}>
                  <Card className="stat-card">
                    <h3><CountUp end={99} suffix="%" /></h3>
                    <p>好评率</p>
                  </Card>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </div>

      {/* 🔝 回到顶部按钮 */}
      <FloatButton.BackTop 
        visibilityHeight={400}
        duration={1000}
        icon={<ArrowUpOutlined />}
        className="back-top-float-btn"
      />
    </div>
  )
}

export default Home
