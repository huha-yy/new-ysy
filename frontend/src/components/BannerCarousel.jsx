import { Button } from 'antd'
import { LeftOutlined, RightOutlined, CompassOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './BannerCarousel.css'

// 轮播图片数据
const bannerData = [
  {
    id: 1,
    title: '探索自然之美',
    subtitle: '在壮丽山水中寻找内心的宁静',
    image: '/public/images/activities/activity-1.jpg',
    cta: '立即探索',
    link: '/activities'
  },
  {
    id: 2,
    title: '挑战自我极限',
    subtitle: '与志同道合的伙伴一起征服高山',
    image: '/public/images/activities/activity-2.jpg',
    cta: '查看活动',
    link: '/activities'
  },
  {
    id: 3,
    title: '感受户外魅力',
    subtitle: '专业领队，安全保障，尽情享受',
    image: '/public/images/activities/activity-3.jpg',
    cta: '加入我们',
    link: '/register'
  },
  {
    id: 4,
    title: '记录美好瞬间',
    subtitle: '每一次徒步都是难忘的回忆',
    image: '/public/images/activities/activity-4.jpg',
    cta: '开始旅程',
    link: '/activities'
  }
]

function BannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const navigate = useNavigate()
  const timerRef = useRef(null)

  // 自动播放
  useEffect(() => {
    startAutoPlay()
    return () => stopAutoPlay()
  }, [currentSlide])

  const startAutoPlay = () => {
    stopAutoPlay()
    timerRef.current = setTimeout(() => {
      next()
    }, 6000)
  }

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 800)
  }

  const next = () => {
    const nextIndex = (currentSlide + 1) % bannerData.length
    goToSlide(nextIndex)
  }

  const prev = () => {
    const prevIndex = (currentSlide - 1 + bannerData.length) % bannerData.length
    goToSlide(prevIndex)
  }

  const handleCtaClick = (link) => {
    navigate(link)
  }

  const currentItem = bannerData[currentSlide]

  return (
    <div className="hero-section">
      {/* 背景图片层 */}
      <div className="hero-backgrounds">
        {bannerData.map((item, index) => (
          <div
            key={item.id}
            className={`hero-bg-image ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${item.image})` }}
          />
        ))}
      </div>

      {/* 渐变遮罩 */}
      <div className="hero-overlay" />

      {/* 山峦剪影层 */}
      <div className="mountains-container">
        <svg className="mountain-layer mountain-back" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="rgba(255, 167, 38, 0.15)" 
            d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,128C672,117,768,139,864,165.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg className="mountain-layer mountain-mid" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="rgba(255, 167, 38, 0.25)" 
            d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,218.7C840,235,960,245,1080,234.7C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
        <svg className="mountain-layer mountain-front" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="rgba(255, 167, 38, 0.4)" 
            d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,245.3C960,235,1056,213,1152,202.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* 飘动的云层 */}
      <div className="clouds-container">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* 主内容区 */}
      <div className="hero-content">
        <div className="hero-badge">
          <CompassOutlined />
          <span>户外徒步探险平台</span>
        </div>
        
        <h1 className="hero-title" key={currentSlide}>
          {currentItem.title}
        </h1>
        
        <p className="hero-subtitle" key={`sub-${currentSlide}`}>
          {currentItem.subtitle}
        </p>
        
        <div className="hero-actions">
          <Button
            type="primary"
            size="large"
            className="hero-cta-primary"
            onClick={() => handleCtaClick(currentItem.link)}
          >
            {currentItem.cta}
          </Button>
          <Button
            size="large"
            className="hero-cta-secondary"
            onClick={() => navigate('/activities')}
          >
            浏览全部活动
          </Button>
        </div>

        {/* 统计数据 */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">活跃用户</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">精彩活动</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">99%</span>
            <span className="stat-label">好评率</span>
          </div>
        </div>
      </div>

      {/* 导航箭头 */}
      <Button
        className="hero-arrow hero-arrow-left"
        icon={<LeftOutlined />}
        onClick={prev}
      />
      <Button
        className="hero-arrow hero-arrow-right"
        icon={<RightOutlined />}
        onClick={next}
      />

      {/* 轮播指示器 */}
      <div className="hero-indicators">
        {bannerData.map((_, index) => (
          <button
            key={index}
            className={`hero-indicator ${currentSlide === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          >
            <span className="indicator-progress" />
          </button>
        ))}
      </div>

      {/* 滚动提示 */}
      <div className="scroll-hint">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>向下滚动探索更多</span>
      </div>
    </div>
  )
}

export default BannerCarousel
