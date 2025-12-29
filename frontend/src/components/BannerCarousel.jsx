import { Carousel, Button } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './BannerCarousel.css'

// 轮播图片数据 - 使用本地活动图片
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
  const navigate = useNavigate()
  const carouselRef = useRef(null)

  // 自动播放
  useEffect(() => {
    const timer = setInterval(() => {
      next()
    }, 5000) // 5秒自动切换

    return () => clearInterval(timer)
  }, [])

  const next = () => {
    if (carouselRef.current) {
      carouselRef.current.next()
    }
  }

  const prev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev()
    }
  }

  const handleCtaClick = (link) => {
    navigate(link)
  }

    return (
    <div className="banner-carousel-wrapper">
      <Carousel
        ref={carouselRef}
        autoplay={false}
        effect="fade"
        dots={{ className: 'custom-dots' }}
        beforeChange={(from, to) => setCurrentSlide(to)}
        className="banner-carousel"
      >
        {bannerData.map((item) => (
          <div key={item.id} className="carousel-item">
            <div className="carousel-bg">
              <img
                src={item.image}
                alt={item.title}
                className="carousel-image"
              />
              <div className="carousel-overlay" />
              <div className="carousel-content">
                <div className="content-wrapper">
                  <h2 className="carousel-title">{item.title}</h2>
                  <p className="carousel-subtitle">{item.subtitle}</p>
                  <Button
                    type="primary"
                    size="large"
                    className="carousel-cta"
                    onClick={() => handleCtaClick(item.link)}
                  >
                    {item.cta}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 左右箭头 */}
      <Button
        className="carousel-arrow carousel-arrow-left"
        icon={<LeftOutlined />}
        onClick={prev}
      />
      <Button
        className="carousel-arrow carousel-arrow-right"
        icon={<RightOutlined />}
        onClick={next}
      />

      {/* 轮播指示器 */}
      <div className="carousel-indicators">
        {bannerData.map((_, index) => (
          <button
            key={index}
            className={`indicator ${currentSlide === index ? 'active' : ''}`}
            onClick={() => carouselRef.current && carouselRef.current.goTo(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default BannerCarousel

