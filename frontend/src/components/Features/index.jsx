import { 
  CompassOutlined,
  TeamOutlined, 
  SafetyOutlined, 
  ThunderboltOutlined
} from '@ant-design/icons'
import './Features.css'

function Features() {
  const features = [
    {
      icon: <CompassOutlined />,
      title: '精选路线',
      description: '专业团队精心规划，涵盖全国热门徒步路线',
      color: '#FFA726'
    },
    {
      icon: <TeamOutlined />,
      title: '专业领队',
      description: '经验丰富的户外领队，全程陪伴保驾护航',
      color: '#4ADE80'
    },
    {
      icon: <SafetyOutlined />,
      title: 'GPS签到',
      description: '实时定位追踪，确保每位徒步者安全无忧',
      color: '#00D9FF'
    },
    {
      icon: <ThunderboltOutlined />,
      title: '便捷报名',
      description: '一键报名，智能匹配，随时随地开启探险',
      color: '#FF6B6B'
    }
  ]

  return (
    <section className="features-section">
      {/* 背景装饰 */}
      <div className="features-bg">
        <div className="features-pattern" />
      </div>

      <div className="features-container">
        <div className="features-header">
          <span className="features-badge">为什么选择我们</span>
          <h2 className="features-title">专业的户外徒步平台</h2>
          <p className="features-desc">
            我们致力于为每一位户外爱好者提供安全、专业、便捷的徒步体验
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div 
                className="feature-icon-wrapper"
                style={{ 
                  background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}10 100%)`,
                  borderColor: `${feature.color}30`
                }}
              >
                <span 
                  className="feature-icon"
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
              <div 
                className="feature-line"
                style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
