import { Card, Row, Col } from 'antd'
import { FireOutlined, TeamOutlined, SafetyOutlined, CalendarOutlined } from '@ant-design/icons'
import './Features.css'

function Features() {
  const features = [
    {
      icon: <FireOutlined />,
      title: '热门活动',
      description: '精选热门徒步路线，探索更多精彩'
    },
    {
      icon: <TeamOutlined />,
      title: '团队协作',
      description: '专业组织者带队，安全有保障'
    },
    {
      icon: <SafetyOutlined />,
      title: '安全保障',
      description: 'GPS签到实时监控，守护您的安全'
    },
    {
      icon: <CalendarOutlined />,
      title: '灵活报名',
      description: '便捷的报名流程，随时随地参与'
    }
  ]

  return (
    <Card className="features-card">
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-item">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default Features

