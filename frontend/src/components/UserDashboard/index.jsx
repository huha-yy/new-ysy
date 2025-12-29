import { Card, Row, Col } from 'antd'
import { TrophyOutlined, CheckCircleOutlined, CalendarOutlined, FireOutlined } from '@ant-design/icons'
import CountUp from '../CountUp'
import './UserDashboard.css'

function UserDashboard({ userData }) {
  return (
    <Card className="user-dashboard-card">
      <div className="dashboard-header">
        <h2>👋 你好，{userData?.nickname || userData?.username || '探险家'}！</h2>
        <p>准备好开始下一次徒步冒险了吗？</p>
      </div>
      
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-item">
            <TrophyOutlined className="stat-icon" />
            <div className="stat-content">
              <CountUp end={userData?.totalActivities || 0} />
              <p>参与活动</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-item">
            <CheckCircleOutlined className="stat-icon completed" />
            <div className="stat-content">
              <CountUp end={userData?.completedActivities || 0} suffix="次" />
              <p>已完成</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-item">
            <CalendarOutlined className="stat-icon upcoming" />
            <div className="stat-content">
              <CountUp end={userData?.upcomingActivities || 0} />
              <p>即将开始</p>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-item">
            <FireOutlined className="stat-icon hot" />
            <div className="stat-content">
              <CountUp end={userData?.completionRate || 100} suffix="%" />
              <p>完成率</p>
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default UserDashboard

