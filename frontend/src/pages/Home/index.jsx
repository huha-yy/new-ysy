import { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Empty, FloatButton } from 'antd'
import { ArrowUpOutlined, StarOutlined, TrophyOutlined, HeartOutlined } from '@ant-design/icons'
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [filters, setFilters] = useState({
    difficulty: undefined,
    time: undefined
  })
  const navigate = useNavigate()

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
      
      // 过滤出即将开始的活动
      const upcoming = records.filter(item => {
        const activityDate = item.activityDate
        const status = item.status
        return status === 1 && activityDate && new Date(activityDate) > new Date()
      })
      
      setUpcomingActivities(upcoming.slice(0, 3))
      
      // 设置用户统计数据
      const completed = records.filter(item => item.status === 5).length
      
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

  // 用户评价数据
  const reviews = [
    {
      name: '张明',
      avatar: '👨',
      rating: 5,
      comment: '黄山徒步体验太棒了！组织者非常专业，风景美不胜收！强烈推荐！',
      activity: '黄山风景区一日游'
    },
    {
      name: '李红',
      avatar: '👩',
      rating: 5,
      comment: '西湖休闲徒步很放松，路线规划合理，领队专业负责，值得参加！',
      activity: '杭州西湖徒步'
    },
    {
      name: '王强',
      avatar: '🧑',
      rating: 4,
      comment: '泰山日出非常壮观，虽然累但很值得！团队氛围很棒！',
      activity: '泰山日出之旅'
    }
  ]

  return (
    <div className="home-page">
      {/* 🏔️ 全屏英雄区 */}
      <BannerCarousel />

      {/* 🌊 波浪分隔线 */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill="#FFF9E6" 
            d="M0,40 C240,100 480,0 720,50 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      <div className="container">
        {/* 🟢 登录用户专属：个人数据概览 */}
        {isLoggedIn && (
          <>
            <UserDashboard userData={userStats || currentUser} />
            <UpcomingActivities 
              activities={upcomingActivities} 
              loading={loading} 
            />
          </>
        )}

        {/* 🔥 热门活动 - 所有用户都能看到 */}
        <HotActivities 
          activities={activities}
          loading={loading}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* ✨ 功能特色 - 所有用户都能看到 */}
        <Features />

        {/* 📝 关于我们 - 所有用户都能看到 */}
        <section className="about-section">
          <div className="about-header">
            <span className="about-badge">
              <HeartOutlined /> 关于我们
            </span>
            <h2 className="about-title">开启你的户外探险之旅</h2>
            <p className="about-desc">
              户外徒步活动管理系统是一个专为户外徒步爱好者打造的平台。
              我们提供专业的徒步路线推荐、活动组织、报名管理、GPS签到等功能，
              让每一次徒步都安全、愉快。
            </p>
          </div>
          
          {/* ⭐ 用户评价 */}
          <div className="reviews-section">
            <h3 className="reviews-title">
              <StarOutlined /> 用户好评如潮
            </h3>
            <div className="reviews-grid">
              {reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar">{review.avatar}</div>
                    <div className="review-info">
                      <h4>{review.name}</h4>
                      <div className="review-stars">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">"{review.comment}"</p>
                  <span className="review-activity">— {review.activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 📊 平台统计 */}
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <TrophyOutlined />
                </div>
                <div className="stat-content">
                  <h3><CountUp end={1000} suffix="+" /></h3>
                  <p>注册用户</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #2ECC71 100%)' }}>
                  <TrophyOutlined />
                </div>
                <div className="stat-content">
                  <h3><CountUp end={500} suffix="+" /></h3>
                  <p>精彩活动</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00D9FF 0%, #00A8CC 100%)' }}>
                  <TrophyOutlined />
                </div>
                <div className="stat-content">
                  <h3><CountUp end={100} suffix="+" /></h3>
                  <p>专业组织者</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)' }}>
                  <HeartOutlined />
                </div>
                <div className="stat-content">
                  <h3><CountUp end={99} suffix="%" /></h3>
                  <p>好评率</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🚀 CTA 区域 - 仅未登录用户显示 */}
          {!isLoggedIn && (
            <div className="cta-section">
              <h3>准备好开始你的探险了吗？</h3>
              <div className="cta-buttons">
                <Button 
                  type="primary" 
                  size="large" 
                  className="cta-primary"
                  onClick={() => navigate('/register')}
                >
                  立即注册
                </Button>
                <Button 
                  size="large" 
                  className="cta-secondary"
                  onClick={() => navigate('/activities')}
                >
                  浏览活动
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 🔝 回到顶部按钮 */}
      <FloatButton.BackTop 
        visibilityHeight={400}
        duration={800}
        icon={<ArrowUpOutlined />}
        className="back-top-btn"
      />
    </div>
  )
}

export default Home
