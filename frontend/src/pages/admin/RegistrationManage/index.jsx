import { useState, useEffect } from 'react'
import { 
  Card, Table, Tag, Space, Button, Select, Input, 
  DatePicker, Row, Col, message, Modal, Statistic,
  Tabs, Tooltip, Badge, Avatar
} from 'antd'
import {
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons'
import { getActivityList } from '../../../api/activity'
import { getActivityRegistrations } from '../../../api/registration'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import './RegistrationManage.css'

const { RangePicker } = DatePicker
const { Option } = Select

// 报名状态映射
const STATUS_MAP = {
  0: { text: '待审核', color: 'processing', icon: <ClockCircleOutlined /> },
  1: { text: '已通过', color: 'success', icon: <CheckCircleOutlined /> },
  2: { text: '已拒绝', color: 'error', icon: <CloseCircleOutlined /> },
  3: { text: '候补中', color: 'warning', icon: <ExclamationCircleOutlined /> },
  4: { text: '已取消', color: 'default', icon: <ExclamationCircleOutlined /> }
}

function RegistrationManage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState('all')
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined,
    dateRange: null
  })

  // 加载活动列表
  useEffect(() => {
    fetchActivities()
  }, [])

  // 加载报名列表
  useEffect(() => {
    if (selectedActivity) {
      fetchRegistrations()
    }
  }, [selectedActivity, activeTab, pagination.current, searchParams])

  const fetchActivities = async () => {
    try {
      const res = await getActivityList({
        pageNum: 1,
        pageSize: 100
      })
      setActivities(res.records || res.list || [])
      
      // 默认选择第一个活动
      if (res.records && res.records.length > 0) {
        setSelectedActivity(res.records[0].id)
      }
    } catch (error) {
      console.error('获取活动列表失败:', error)
      message.error('获取活动列表失败')
    }
  }

  const fetchRegistrations = async () => {
    if (!selectedActivity) return
    
    setLoading(true)
    try {
      const res = await getActivityRegistrations(selectedActivity, {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        status: activeTab !== 'all' ? parseInt(activeTab) : undefined,
        keyword: searchParams.keyword || undefined
      })
      
      if (res) {
        setRegistrations(res.records || res.list || [])
        setPagination(prev => ({
          ...prev,
          total: res.total || 0
        }))
      }
    } catch (error) {
      console.error('获取报名列表失败:', error)
      message.error('获取报名列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 计算统计数据
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 0).length,
    approved: registrations.filter(r => r.status === 1).length,
    rejected: registrations.filter(r => r.status === 2).length,
    waiting: registrations.filter(r => r.status === 3).length,
    cancelled: registrations.filter(r => r.status === 4).length
  }

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchRegistrations()
  }

  // 处理重置
  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
      dateRange: null
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // 查看详情
  const handleViewDetail = (record) => {
    Modal.info({
      title: '报名详情',
      width: 600,
      content: (
        <div className="detail-modal">
          <Row gutter={16}>
            <Col span={12}>
              <div className="detail-item">
                <span className="label">用户昵称:</span>
                <span className="value">{record.nickname || record.username || '-'}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="detail-item">
                <span className="label">手机号:</span>
                <span className="value">{record.phone || '-'}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <div className="detail-item">
                <span className="label">邮箱:</span>
                <span className="value">{record.email || '-'}</span>
              </div>
            </Col>
            <Col span={12}>
              <div className="detail-item">
                <span className="label">报名时间:</span>
                <span className="value">{record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </div>
            </Col>
          </Row>
          {record.auditTime && (
            <div className="detail-item">
              <span className="label">审核时间:</span>
              <span className="value">{dayjs(record.auditTime).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          )}
          {record.rejectReason && (
            <div className="detail-item">
              <span className="label">拒绝原因:</span>
              <span className="value" style={{ color: 'red' }}>{record.rejectReason}</span>
            </div>
          )}
          {record.queueNumber && (
            <div className="detail-item">
              <span className="label">候补序号:</span>
              <span className="value">第 {record.queueNumber} 位</span>
            </div>
          )}
          {record.remark && (
            <div className="detail-item">
              <span className="label">报名留言:</span>
              <span className="value">{record.remark}</span>
            </div>
          )}
        </div>
      )
    })
  }

  // 表格列定义
  const columns = [
    {
      title: '报名用户',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div className="user-cell">
          <Avatar 
            size={40} 
            icon={<UserOutlined />} 
            src={record.avatar}
            className="user-avatar"
          />
          <div className="user-info">
            <div className="user-nickname">{record.nickname || record.username}</div>
            <div className="user-username">@{record.username}</div>
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div className="contact-cell">
          <div><PhoneOutlined /> {record.phone || '-'}</div>
          <div><MailOutlined /> {record.email || '-'}</div>
        </div>
      )
    },
    {
      title: '报名留言',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="remark-text">{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: '报名时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (time) => time ? dayjs(time).format('MM-DD HH:mm') : '-'
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const statusInfo = STATUS_MAP[record.status] || { text: '未知', color: 'default' }
        return (
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.text}
          </Tag>
        )
      }
    },
    {
      title: '候补序号',
      dataIndex: 'queueNumber',
      key: 'queueNumber',
      width: 100,
      align: 'center',
      render: (num) => num ? `第 ${num} 位` : '-'
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      )
    }
  ]

  const tabItems = [
    { key: 'all', label: <Badge count={stats.total} offset={[10, 0]}>全部</Badge> },
    { key: '0', label: <Badge count={stats.pending} offset={[10, 0]}>待审核</Badge> },
    { key: '1', label: `已通过 (${stats.approved})` },
    { key: '2', label: `已拒绝 (${stats.rejected})` },
    { key: '3', label: `候补中 (${stats.waiting})` },
    { key: '4', label: `已取消 (${stats.cancelled})` }
  ]

  return (
    <div className="registration-manage-page">
      {/* 页面头部 */}
      <div className="page-header">
        <h1 className="page-title">
          <UserOutlined className="title-icon" />
          报名管理
        </h1>
        <Button 
          icon={<ReloadOutlined />}
          onClick={fetchRegistrations}
        >
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={4}>
          <Card>
            <Statistic
              title="总报名数"
              value={stats.total}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已通过"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已拒绝"
              value={stats.rejected}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="候补中"
              value={stats.waiting}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="已取消"
              value={stats.cancelled}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 查询区域 */}
      <Card className="search-card">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <span className="search-label">选择活动:</span>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择活动"
              value={selectedActivity}
              onChange={setSelectedActivity}
              showSearch
              optionFilterProp="children"
            >
              {activities.map(activity => (
                <Option key={activity.id} value={activity.id}>
                  {activity.title} ({activity.currentParticipants}/{activity.maxParticipants}人)
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <span className="search-label">关键词:</span>
            <Input
              placeholder="搜索用户名/昵称/手机号"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={6}>
            <span className="search-label">状态:</span>
            <Select
              style={{ width: '100%' }}
              placeholder="全部状态"
              value={searchParams.status}
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
              allowClear
            >
              <Option value={0}>待审核</Option>
              <Option value={1}>已通过</Option>
              <Option value={2}>已拒绝</Option>
              <Option value={3}>候补中</Option>
              <Option value={4}>已取消</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 报名列表 */}
      <Card className="table-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        <Table
          loading={loading}
          columns={columns}
          dataSource={registrations}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize, total: pagination.total })
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

export default RegistrationManage

