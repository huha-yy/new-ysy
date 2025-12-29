import { Card, Row, Col } from 'antd'
import { TrophyOutlined, CheckCircleOutlined, CalendarOutlined, FireOutlined } from '@ant-design/icons'
import CountUp from '../CountUp'
import './UserDashboard.css'

function UserDashboard({ userData }) {
  const stats = [
    {
      icon: <TrophyOutlined />,
      value: userData?.totalActivities || 0,
      suffix: '',
      label: '参与活动',
      color: '#FFA726',
      bgColor: '#FFF3E0'
    },
    {
      icon: <CheckCircleOutlined />,
      value: userData?.completedActivities || 0,
      suffix: '次',
      label: '已完成',
      color: '#4ADE80',
      bgColor: '#E8F5E9'
    },
    {
      icon: <CalendarOutlined />,
      value: userData?.upcomingActivities || 0,
      suffix: '',
      label: '即将开始',
      color: '#3B82F6',
      bgColor: '#E3F2FD'
    },
    {
      icon: <FireOutlined />,
      value: userData?.completionRate || 100,
      suffix: '%',
      label: '完成率',
      color: '#F43F5E',
      bgColor: '#FCE4EC'
    }
  ]

  return (
    <Card className="user-dashboard-card">
      <div className="dashboard-header">
        <h2>👋 你好，{userData?.nickname || userData?.username || '探险家'}！</h2>
        <p>准备好开始下一次徒步冒险了吗？</p>
      </div>
      
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col key={index} xs={12} sm={12} md={6}>
            <Card className="stat-item">
              <div 
                className="stat-icon-wrapper"
                style={{ 
                  backgroundColor: stat.bgColor,
                  border: `2px solid ${stat.color}30`
                }}
              >
                <span className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </span>
              </div>
              <div className="stat-content">
                <CountUp end={stat.value} suffix={stat.suffix} />
                <p>{stat.label}</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default UserDashboard
