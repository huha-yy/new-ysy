import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, DatePicker, Select, Progress, Table, Tag, Space } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  TrophyOutlined,
  FireOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined
} from '@ant-design/icons'
import { getStatistics } from '../../../api/admin'
import dayjs from 'dayjs'
import './Statistics.css'

const { RangePicker } = DatePicker

function Statistics() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ])
  const [statsData, setStatsData] = useState({
    overview: {},
    growth: {},
    topActivities: [],
    topOrganizers: [],
    activityByDifficulty: [],
    registrationByMonth: [],
    health: {}
  })

  useEffect(() => {
    fetchStatistics()
  }, [dateRange])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const res = await getStatistics()
      if (res) {
        setStatsData(res)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 热门活动表格列
  const activityColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <span className={`rank-badge rank-${index + 1}`}>
          {index + 1}
        </span>
      )
    },
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '报名人数',
      dataIndex: 'registrations',
      key: 'registrations',
      width: 100,
      render: (num) => <span className="stat-number">{num}人</span>
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      render: (rating) => (
        <Tag color="gold">⭐ {rating}</Tag>
      )
    }
  ]

  // 优秀组织者表格列
  const organizerColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <span className={`rank-badge rank-${index + 1}`}>
          {index + 1}
        </span>
      )
    },
    {
      title: '组织者',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '活动数',
      dataIndex: 'activities',
      key: 'activities',
      width: 80,
      render: (num) => <span className="stat-number">{num}</span>
    },
    {
      title: '总参与人次',
      dataIndex: 'totalParticipants',
      key: 'totalParticipants',
      width: 100,
      render: (num) => <span className="stat-number">{num}</span>
    }
  ]

  return (
    <div className="statistics-page">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            <BarChartOutlined className="title-icon" />
            数据统计
          </h1>
          <p className="page-subtitle">系统运营数据概览与分析</p>
        </div>
        <div className="header-right">
          <Space>
            <span className="date-label">统计周期：</span>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              allowClear={false}
            />
          </Space>
        </div>
      </div>

      {/* 核心数据概览 */}
      <Row gutter={16} className="overview-row">
        <Col span={6}>
          <Card className="overview-card users">
            <div className="card-content">
              <div className="card-icon">
                <UserOutlined />
              </div>
              <div className="card-stats">
                <Statistic
                  title="用户总数"
                  value={statsData.overview?.totalUsers || 0}
                  suffix={
                    statsData.growth?.userGrowth != null && (
                      <span className={`growth ${statsData.growth.userGrowth >= 0 ? 'positive' : 'negative'}`}>
                        {statsData.growth.userGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(statsData.growth.userGrowth)}%
                      </span>
                    )
                  }
                />
                <div className="sub-stat">
                  本月新增 <strong>{statsData.overview?.newUsersThisMonth || 0}</strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="overview-card activities">
            <div className="card-content">
              <div className="card-icon">
                <CalendarOutlined />
              </div>
              <div className="card-stats">
                <Statistic
                  title="活动总数"
                  value={statsData.overview?.totalActivities || 0}
                  suffix={
                    statsData.growth?.activityGrowth != null && (
                      <span className={`growth ${statsData.growth.activityGrowth >= 0 ? 'positive' : 'negative'}`}>
                        {statsData.growth.activityGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(statsData.growth.activityGrowth)}%
                      </span>
                    )
                  }
                />
                <div className="sub-stat">
                  进行中 <strong>{statsData.overview?.ongoingActivities || 0}</strong> 个
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="overview-card registrations">
            <div className="card-content">
              <div className="card-icon">
                <TeamOutlined />
              </div>
              <div className="card-stats">
                <Statistic
                  title="报名总数"
                  value={statsData.overview?.totalRegistrations || 0}
                  suffix={
                    statsData.growth?.registrationGrowth != null && (
                      <span className={`growth ${statsData.growth.registrationGrowth >= 0 ? 'positive' : 'negative'}`}>
                        {statsData.growth.registrationGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(statsData.growth.registrationGrowth)}%
                      </span>
                    )
                  }
                />
                <div className="sub-stat">
                  本月新增 <strong>{statsData.overview?.newRegistrationsThisMonth || 0}</strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="overview-card checkins">
            <div className="card-content">
              <div className="card-icon">
                <EnvironmentOutlined />
              </div>
              <div className="card-stats">
                <Statistic
                  title="签到完成"
                  value={statsData.overview?.totalCheckins || 0}
                />
                <div className="sub-stat">
                  签到率 <strong>{statsData.growth?.checkinRate || 0}%</strong>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表和排行榜 */}
      <Row gutter={24} className="charts-row">
        {/* 活动难度分布 */}
        <Col span={8}>
          <Card 
            className="chart-card"
            title={
              <span className="card-title">
                <PieChartOutlined /> 活动难度分布
              </span>
            }
          >
            <div className="difficulty-chart">
              {statsData.activityByDifficulty.map((item, index) => (
                <div key={item.level} className="difficulty-item">
                  <div className="difficulty-info">
                    <span className={`difficulty-dot level-${index + 1}`}></span>
                    <span className="difficulty-name">{item.level}</span>
                    <span className="difficulty-count">{item.count}个</span>
                  </div>
                  <Progress 
                    percent={item.percent} 
                    showInfo={false}
                    strokeColor={
                      index === 0 ? '#52c41a' : 
                      index === 1 ? '#1890ff' : 
                      index === 2 ? '#fa8c16' : 
                      index === 3 ? '#f5222d' : '#722ed1'
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 月度报名趋势 */}
        <Col span={16}>
          <Card 
            className="chart-card"
            title={
              <span className="card-title">
                <LineChartOutlined /> 月度报名趋势
              </span>
            }
          >
            <div className="trend-chart">
              <div className="chart-bars">
                {statsData.registrationByMonth.map((item, index) => {
                  const maxCount = Math.max(...statsData.registrationByMonth.map(i => i.count))
                  const height = (item.count / maxCount) * 100
                  return (
                    <div key={item.month} className="bar-item">
                      <div 
                        className="bar" 
                        style={{ height: `${height}%` }}
                        data-count={item.count}
                      >
                        <span className="bar-value">{item.count}</span>
                      </div>
                      <span className="bar-label">{item.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 排行榜 */}
      <Row gutter={24} className="rankings-row">
        <Col span={12}>
          <Card 
            className="ranking-card"
            title={
              <span className="card-title">
                <FireOutlined style={{ color: '#ff4d4f' }} /> 热门活动排行
              </span>
            }
          >
            <Table
              columns={activityColumns}
              dataSource={statsData.topActivities}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            className="ranking-card"
            title={
              <span className="card-title">
                <TrophyOutlined style={{ color: '#faad14' }} /> 优秀组织者排行
              </span>
            }
          >
            <Table
              columns={organizerColumns}
              dataSource={statsData.topOrganizers}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 系统健康度 */}
      <Card className="health-card">
        <div className="health-header">
          <h3>🎯 系统运营健康度</h3>
        </div>
        <Row gutter={24}>
          <Col span={6}>
            <div className="health-item">
              <div className="health-label">用户活跃度</div>
              <Progress
                type="dashboard"
                percent={statsData.health?.userActivityRate || 0}
                size={100}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="health-item">
              <div className="health-label">活动完成率</div>
              <Progress
                type="dashboard"
                percent={statsData.health?.activityCompletionRate || 0}
                size={100}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="health-item">
              <div className="health-label">用户满意度</div>
              <Progress
                type="dashboard"
                percent={statsData.health?.userSatisfaction || 0}
                size={100}
                strokeColor={{
                  '0%': '#faad14',
                  '100%': '#52c41a',
                }}
              />
            </div>
          </Col>
          <Col span={6}>
            <div className="health-item">
              <div className="health-label">签到完成率</div>
              <Progress
                type="dashboard"
                percent={statsData.health?.checkinCompletionRate || 0}
                size={100}
                strokeColor={{
                  '0%': '#ff4d4f',
                  '100%': '#52c41a',
                }}
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Statistics

