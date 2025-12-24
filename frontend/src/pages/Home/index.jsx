import { Card, Row, Col, Button } from 'antd'
import { CalendarOutlined, TeamOutlined, SafetyOutlined, FireOutlined } from '@ant-design/icons'
import { DIFFICULTY_MAP } from '../../utils/constants'
import './Home.css'

function Home() {
  return (
    <div className="home-page">
      <div className="banner">
        <div className="banner-content">
          <h1>探索户外，享受徒步</h1>
          <p>发现精彩活动，结识志同道合的朋友</p>
          <Button type="primary" size="large" href="/activities">
            立即探索
          </Button>
        </div>
      </div>

      <div className="container">
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

        <div className="intro-section">
          <h2>关于我们</h2>
          <p>
            户外徒步活动管理系统是一个专为户外徒步爱好者打造的平台。
            我们提供专业的徒步路线推荐、活动组织、报名管理、GPS签到等功能，
            让每一次徒步都安全、愉快。
          </p>
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3>1000+</h3>
                <p>注册用户</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3>500+</h3>
                <p>精彩活动</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3>100+</h3>
                <p>专业组织者</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="stat-card">
                <h3>99%</h3>
                <p>好评率</p>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Home

