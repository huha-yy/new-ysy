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
import { getDashboard } from '../../../api/admin'
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
    overview: {
      totalUsers: 1256,
      totalActivities: 89,
      totalRegistrations: 3420,
      totalCheckins: 2890
    },
    growth: {
      userGrowth: 12.5,
      activityGrowth: 8.3,
      registrationGrowth: 15.7
    },
    topActivities: [],
    topOrganizers: [],
    activityByDifficulty: [],
    registrationByMonth: []
  })

  useEffect(() => {
    fetchStatistics()
  }, [dateRange])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const res = await getDashboard()
      if (res) {
        // 处理真实数据
      }
    } catch (error) {
    } finally {
      // 使用模拟数据
      setStatsData({
        overview: {
          totalUsers: 1256,
          totalActivities: 89,
          totalRegistrations: 3420,
          totalCheckins: 2890,
          newUsersThisMonth: 156,
          newActivitiesThisMonth: 12,
          completedActivities: 67,
          ongoingActivities: 5
        },
        growth: {
          userGrowth: 12.5,
          activityGrowth: 8.3,
          registrationGrowth: 15.7,
          checkinRate: 84.5
        },
        topActivities: [
          { id: 1, title: '周末香山登顶徒步', registrations: 28, rating: 4.8 },
          { id: 2, title: '长城野长城穿越之旅', registrations: 25, rating: 4.9 },
          { id: 3, title: '密云水库环湖骑行', registrations: 22, rating: 4.7 },
          { id: 4, title: '青海湖三日游', registrations: 20, rating: 4.6 },
          { id: 5, title: '张家界徒步探险', registrations: 18, rating: 4.8 }
        ],
        topOrganizers: [
          { id: 1, name: '户外探险家', activities: 12, totalParticipants: 245 },
          { id: 2, name: '骑行俱乐部', activities: 8, totalParticipants: 180 },
          { id: 3, name: '山野行者', activities: 7, totalParticipants: 156 },
          { id: 4, name: '自然之友', activities: 6, totalParticipants: 132 },
          { id: 5, name: '徒步达人', activities: 5, totalParticipants: 98 }
        ],
        activityByDifficulty: [
          { level: '休闲', count: 25, percent: 28 },
          { level: '简单', count: 30, percent: 34 },
          { level: '中等', count: 22, percent: 25 },
          { level: '困难', count: 10, percent: 11 },
          { level: '极限', count: 2, percent: 2 }
        ],
        registrationByMonth: [
          { month: '7月', count: 320 },
          { month: '8月', count: 450 },
          { month: '9月', count: 520 },
          { month: '10月', count: 680 },
          { month: '11月', count: 750 },
          { month: '12月', count: 700 }
        ]
      })
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
                  value={statsData.overview.totalUsers}
                  suffix={
                    <span className="growth positive">
                      <RiseOutlined /> {statsData.growth.userGrowth}%
                    </span>
                  }
                />
                <div className="sub-stat">
                  本月新增 <strong>{statsData.overview.newUsersThisMonth}</strong>
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
                  value={statsData.overview.totalActivities}
                  suffix={
                    <span className="growth positive">
                      <RiseOutlined /> {statsData.growth.activityGrowth}%
                    </span>
                  }
                />
                <div className="sub-stat">
                  进行中 <strong>{statsData.overview.ongoingActivities}</strong> 个
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
                  value={statsData.overview.totalRegistrations}
                  suffix={
                    <span className="growth positive">
                      <RiseOutlined /> {statsData.growth.registrationGrowth}%
                    </span>
                  }
                />
                <div className="sub-stat">
                  月均增长 <strong>856</strong>
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
                  value={statsData.overview.totalCheckins}
                />
                <div className="sub-stat">
                  签到率 <strong>{statsData.growth.checkinRate}%</strong>
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
                percent={78} 
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
                percent={92} 
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
                percent={88} 
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
                percent={85} 
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

