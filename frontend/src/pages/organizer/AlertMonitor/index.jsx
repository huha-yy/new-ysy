import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, List, Tag, Button, Space, Modal, Form, Input, Radio, message, Tabs, Empty, Spin, Badge, Descriptions } from 'antd'
import { ArrowLeftOutlined, ExclamationCircleOutlined, CheckCircleOutlined, LoadingOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { getActivityAlerts, getAlertStats, handleAlert } from '../../../api/alert'
import { getActivityDetail } from '../../../api/activity'
import './AlertMonitor.css'

const { TextArea } = Input
const { TabPane } = Tabs

// 预警类型配置
const ALERT_TYPE_CONFIG = {
  1: { text: '偏离路线', color: 'warning', icon: '↔️' },
  2: { text: '严重偏离', color: 'error', icon: '⚠️' },
  3: { text: '长时间静止', color: 'error', icon: '⏸️' },
  4: { text: '超时未签到', color: 'warning', icon: '⏰' },
  5: { text: '失联', color: 'error', icon: '📡' }
}

// 预警级别配置
const ALERT_LEVEL_CONFIG = {
  1: { text: '警告', color: 'warning' },
  2: { text: '严重', color: 'error' }
}

// 处理状态配置
const HANDLE_STATUS_CONFIG = {
  0: { text: '未处理', color: 'red' },
  1: { text: '处理中', color: 'orange' },
  2: { text: '已处理', color: 'green' },
  3: { text: '已忽略', color: 'default' }
}

function AlertMonitor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState('0')
  const [handleModalVisible, setHandleModalVisible] = useState(false)
  const [currentAlert, setCurrentAlert] = useState(null)
  const [handleForm] = Form.useForm()

  useEffect(() => {
    fetchActivityDetail()
    fetchAlertStats()
    fetchAlerts(1, 0)
  }, [id])

  // 获取活动详情
  const fetchActivityDetail = async () => {
    try {
      const res = await getActivityDetail(id)
      setActivity(res.data)
    } catch (error) {
      message.error('获取活动详情失败')
    }
  }

  // 获取预警统计
  const fetchAlertStats = async () => {
    try {
      const res = await getAlertStats(id)
      setStats(res.data)
    } catch (error) {
      console.error('获取预警统计失败', error)
    }
  }

  // 获取预警列表
  const fetchAlerts = async (page = 1, handleStatus = 0) => {
    setLoading(true)
    try {
      const params = {
        pageNum: page,
        pageSize: 10,
        handleStatus: handleStatus === 'all' ? undefined : parseInt(handleStatus)
      }
      const res = await getActivityAlerts(id, params)
      setAlerts(res.data.records || [])
      setPagination({
        current: page,
        pageSize: 10,
        total: res.data.total || 0
      })
    } catch (error) {
      message.error('获取预警列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 切换Tab
  const handleTabChange = (key) => {
    setActiveTab(key)
    fetchAlerts(1, key)
  }

  // 分页变化
  const handlePageChange = (page) => {
    fetchAlerts(page, activeTab)
  }

  // 打开处理弹窗
  const openHandleModal = (alert) => {
    setCurrentAlert(alert)
    handleForm.setFieldsValue({
      handleStatus: '1',
      handleRemark: ''
    })
    setHandleModalVisible(true)
  }

  // 提交处理
  const submitHandle = async () => {
    try {
      const values = await handleForm.validateFields()
      await handleAlert(currentAlert.id, {
        handleStatus: parseInt(values.handleStatus),
        handleRemark: values.handleRemark
      })
      message.success('预警处理成功')
      setHandleModalVisible(false)
      fetchAlerts(pagination.current, activeTab)
      fetchAlertStats()
    } catch (error) {
      message.error(error.message || '处理失败')
    }
  }

  // 渲染预警项
  const renderAlertItem = (alert) => {
    const typeConfig = ALERT_TYPE_CONFIG[alert.alertType] || { text: '未知', color: 'default', icon: '❓' }
    const levelConfig = ALERT_LEVEL_CONFIG[alert.alertLevel] || { text: '未知', color: 'default' }
    const statusConfig = HANDLE_STATUS_CONFIG[alert.handleStatus] || { text: '未知', color: 'default' }

    return (
      <List.Item
        key={alert.id}
        className={`alert-item ${alert.isSevere ? 'alert-severe' : ''}`}
        actions={[
          alert.handleStatus === 0 || alert.handleStatus === 1 ? (
            <Button type="primary" size="small" onClick={() => openHandleModal(alert)}>
              处理
            </Button>
          ) : null
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={<div className="alert-icon">{typeConfig.icon}</div>}
          title={
            <Space>
              <span>{typeConfig.icon} {typeConfig.text}</span>
              <Tag color={levelConfig.color}>{levelConfig.text}</Tag>
              <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
              <span className="alert-time">{alert.triggerTime}</span>
            </Space>
          }
          description={
            <div className="alert-description">
              <div className="alert-user">
                用户：{alert.userNickname || '未知'}
              </div>
              <div className="alert-detail">{alert.description}</div>
              {alert.latitude && alert.longitude && (
                <div className="alert-location">
                  <EnvironmentOutlined /> 位置：{alert.latitude?.toFixed(6)}, {alert.longitude?.toFixed(6)}
                </div>
              )}
              {alert.handleByNickname && (
                <div className="alert-handler">
                  处理人：{alert.handleByNickname} - {alert.handleRemark || '无备注'}
                </div>
              )}
            </div>
          }
        />
      </List.Item>
    )
  }

  return (
    <div className="alert-monitor-page">
      {/* 头部 */}
      <div className="page-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <h1>预警监控</h1>
      </div>

      {/* 活动信息和统计 */}
      <Card className="activity-info-card" loading={!activity}>
        {activity && (
          <Descriptions column={4}>
            <Descriptions.Item label="活动名称">{activity.title}</Descriptions.Item>
            <Descriptions.Item label="活动日期">{activity.activityDate}</Descriptions.Item>
            <Descriptions.Item label="总预警数">
              <Badge count={stats?.totalAlerts || 0} showZero />
            </Descriptions.Item>
            <Descriptions.Item label="未处理">
              <Badge count={stats?.pendingCount || 0} style={{ backgroundColor: '#f5222d' }} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {/* 统计卡片 */}
      {stats && (
        <div className="stats-cards">
          <Card>
            <div className="stat-item">
              <div className="stat-value">{stats.pendingCount || 0}</div>
              <div className="stat-label">未处理</div>
            </div>
          </Card>
          <Card>
            <div className="stat-item">
              <div className="stat-value">{stats.processingCount || 0}</div>
              <div className="stat-label">处理中</div>
            </div>
          </Card>
          <Card>
            <div className="stat-item">
              <div className="stat-value">{stats.resolvedCount || 0}</div>
              <div className="stat-label">已处理</div>
            </div>
          </Card>
          <Card>
            <div className="stat-item stat-severe">
              <div className="stat-value">{stats.severeCount || 0}</div>
              <div className="stat-label">严重预警</div>
            </div>
          </Card>
        </div>
      )}

      {/* 预警列表 */}
      <Card title="预警列表" className="alert-list-card">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab={<Badge count={stats?.pendingCount || 0} offset={[10, 0]}>未处理</Badge>} key="0" />
          <TabPane tab={<Badge count={stats?.processingCount || 0} offset={[10, 0]}>处理中</Badge>} key="1" />
          <TabPane tab="已处理" key="2" />
          <TabPane tab="已忽略" key="3" />
          <TabPane tab="全部" key="all" />
        </Tabs>

        <Spin spinning={loading}>
          {alerts.length > 0 ? (
            <List
              dataSource={alerts}
              renderItem={renderAlertItem}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: handlePageChange
              }}
            />
          ) : (
            <Empty description="暂无预警数据" />
          )}
        </Spin>
      </Card>

      {/* 处理预警弹窗 */}
      <Modal
        title="处理预警"
        open={handleModalVisible}
        onOk={submitHandle}
        onCancel={() => setHandleModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        {currentAlert && (
          <div className="handle-modal-content">
            <div className="current-alert-info">
              <p><strong>预警类型：</strong>{ALERT_TYPE_CONFIG[currentAlert.alertType]?.text}</p>
              <p><strong>涉及用户：</strong>{currentAlert.userNickname}</p>
              <p><strong>预警描述：</strong>{currentAlert.description}</p>
            </div>
            <Form form={handleForm} layout="vertical">
              <Form.Item
                label="处理状态"
                name="handleStatus"
                rules={[{ required: true, message: '请选择处理状态' }]}
              >
                <Radio.Group>
                  <Radio value="1">处理中</Radio>
                  <Radio value="2">已处理</Radio>
                  <Radio value="3">已忽略</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="处理备注"
                name="handleRemark"
              >
                <TextArea rows={3} placeholder="请输入处理备注（可选）" maxLength={200} showCount />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AlertMonitor
