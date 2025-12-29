import { useState, useEffect } from 'react'
import { Card, Form, Input, DatePicker, Select, Button, Progress, Row, Col, Statistic, message } from 'antd'
import { TrophyOutlined, CalendarOutlined, EnvironmentOutlined, FireOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import './HikingProfile.css'

function HikingProfile() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [stats, setStats] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    // 模拟从后端获取徒步档案数据
    const profileData = {
      totalActivities: 5,
      totalDistance: 45.5,
      totalElevation: 1200,
      totalDuration: 25,
      completedActivities: 3,
      preferenceDifficulty: 2,
      preferredDuration: '4-6',
      favoriteRoutes: '香山环线,灵山古道'
    }

    // 设置统计数据
    setStats(profileData)

    // 设置表单初始值
    form.setFieldsValue({
      preferenceDifficulty: profileData.preferenceDifficulty,
      preferredDuration: profileData.preferredDuration,
      routeTypes: ['loop', 'point'],
      notes: ''
    })
  }, [form])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // TODO: 调用后端 API 保存徒步档案
      message.success('徒步档案保存成功')
      // 可以跳转到个人中心
      // navigate('/user/profile')
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hiking-profile-page">
      <div className="container">
        <Card
          title="🏔️ 徒步档案"
          className="hiking-profile-card"
          extra={
            <Button onClick={() => navigate('/user/profile')} icon={<UserOutlined />}>
              返回
            </Button>
          }
        >
          {/* 徒步统计 */}
          <div className="stats-section">
            <h2 className="section-title">📊 徒步统计</h2>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="参与次数"
                  value={stats.totalActivities}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#FFA726' }}
                  className="stat-item"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="总里程"
                  value={stats.totalDistance}
                  suffix="公里"
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: '#4ADE80' }}
                  className="stat-item"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="累计爬升"
                  value={stats.totalElevation}
                  suffix="米"
                  prefix={<FireOutlined />}
                  valueStyle={{ color: '#FFC93D' }}
                  className="stat-item"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="总时长"
                  value={stats.totalDuration}
                  suffix="小时"
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#00D9FF' }}
                  className="stat-item"
                />
              </Col>
            </Row>
          </div>

          {/* 徒步等级 */}
          <div className="level-section">
            <h2 className="section-title">⭐ 徒步等级</h2>
            <div className="level-display">
              <div className="current-level">
                <span className="level-label">当前等级：</span>
                <span className="level-badge">中级</span>
              </div>
              <div className="level-progress">
                <span className="level-desc">初级</span>
                <Progress 
                  percent={50} 
                  strokeColor="#4ADE80"
                  showInfo={false}
                />
                <span className="level-desc">中级</span>
                <Progress 
                  percent={75} 
                  strokeColor="#FFA726"
                  showInfo={false}
                />
                <span className="level-desc">高级</span>
                <Progress 
                  percent={90} 
                  strokeColor="#FFC93D"
                  showInfo={false}
                />
                <span className="level-desc">专家</span>
              </div>
            </div>
            <div className="level-info">
              <p>已参与 3 个活动，总里程 45.5 公里，累计爬升 1200 米</p>
              <p>再参与 2 个活动即可升级到高级！</p>
            </div>
          </div>

          {/* 徒步偏好设置 */}
          <div className="preference-section">
            <h2 className="section-title">🎯 徒步偏好</h2>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                label="偏好难度"
                name="preferenceDifficulty"
                rules={[
                  { required: true, message: '请选择偏好难度' }
                ]}
              >
                <Select 
                  placeholder="请选择偏好难度"
                  size="large"
                  suffixIcon={<TrophyOutlined />}
                >
                  <Select.Option value={1}>休闲（1-10km）</Select.Option>
                  <Select.Option value={2}>简单（10-20km）</Select.Option>
                  <Select.Option value={3}>中等（20-30km）</Select.Option>
                  <Select.Option value={4}>困难（30-50km）</Select.Option>
                  <Select.Option value={5}>极限（50km+）</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="偏好时长"
                name="preferredDuration"
                rules={[
                  { required: true, message: '请选择偏好时长' }
                ]}
              >
                <Select 
                  placeholder="请选择偏好时长"
                  size="large"
                  suffixIcon={<CalendarOutlined />}
                >
                  <Select.Option value="1-2">1-2小时</Select.Option>
                  <Select.Option value="2-4">2-4小时</Select.Option>
                  <Select.Option value="4-6">4-6小时</Select.Option>
                  <Select.Option value="6-8">6-8小时</Select.Option>
                  <Select.Option value="8-12">8-12小时</Select.Option>
                  <Select.Option value="12+">全天</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="喜欢的路线类型"
                name="routeTypes"
                rules={[
                  { required: true, message: '请选择路线类型' }
                ]}
              >
                <Select 
                  mode="multiple"
                  placeholder="请选择喜欢的路线类型"
                  size="large"
                  suffixIcon={<EnvironmentOutlined />}
                >
                  <Select.Option value="loop">环线</Select.Option>
                  <Select.Option value="point">往返</Select.Option>
                  <Select.Option value="one-way">单程</Select.Option>
                  <Select.Option value="cross-country">穿越</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="其他备注"
                name="notes"
              >
                <Input.TextArea
                  placeholder="请输入其他偏好备注"
                  rows={3}
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item className="submit-section">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<TeamOutlined />}
                  block
                >
                  保存档案
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* 成就徽章 */}
          <div className="badges-section">
            <h2 className="section-title">🏅 成就徽章</h2>
            <div className="badges-container">
              <div className="badge-item">
                <div className="badge-icon">🥇</div>
                <div className="badge-info">
                  <div className="badge-title">新手上路</div>
                  <div className="badge-desc">完成10次以上徒步</div>
                </div>
              </div>

              <div className="badge-item">
                <div className="badge-icon">🏔️</div>
                <div className="badge-info">
                  <div className="badge-title">雪山征服者</div>
                  <div className="badge-desc">完成5次高山徒步</div>
                </div>
              </div>

              <div className="badge-item">
                <div className="badge-icon">🎯</div>
                <div className="badge-info">
                  <div className="badge-title">活跃参与者</div>
                  <div className="badge-desc">连续参与3个月活动</div>
                </div>
              </div>

              <div className="badge-item">
                <div className="badge-icon">📅</div>
                <div className="badge-info">
                  <div className="badge-title">评价达人</div>
                  <div className="badge-desc">累计评价10次以上</div>
                </div>
              </div>

              <div className="badge-item">
                <div className="badge-icon locked">🔒</div>
                <div className="badge-info">
                  <div className="badge-title">探险家</div>
                  <div className="badge-desc">累计里程100公里</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default HikingProfile

