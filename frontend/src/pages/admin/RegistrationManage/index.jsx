import { useState, useEffect } from 'react'
import {
  Card, Table, Tag, Space, Button, Select, Input,
  DatePicker, Row, Col, message, Modal, Statistic,
  Tabs, Tooltip, Badge, Avatar, Empty
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
  MailOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { getActivityList } from '../../../api/activity'
import { getActivityRegistrations, auditRegistration } from '../../../api/registration'
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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, statusStats: {} })
  const [activeTab, setActiveTab] = useState('all')
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined,
    dateRange: null
  })
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null })
  const [rejectReason, setRejectReason] = useState('')

  // 保存各状态的总数（用于显示标签）
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    waiting: 0,
    cancelled: 0,
    total: 0
  })

  // 获取各状态的统计数据
  const fetchStatusStats = async (activityId) => {
    try {
      const statuses = [0, 1, 2, 3, 4]
      const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        waiting: 0,
        cancelled: 0,
        total: 0
      }

      for (const status of statuses) {
        try {
          const res = await getActivityRegistrations(activityId, {
            pageNum: 1,
            pageSize: 1,
            status
          })
          const count = res?.total || 0
          counts.total += count
          if (status === 0) counts.pending = count
          else if (status === 1) counts.approved = count
          else if (status === 2) counts.rejected = count
          else if (status === 3) counts.waiting = count
          else counts.cancelled = count
        } catch (e) {
          console.error(`获取状态${status}统计失败:`, e)
        }
      }

      setStatusCounts(counts)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 加载活动列表
  useEffect(() => {
    fetchActivities()
  }, [])

  // 加载报名列表
  useEffect(() => {
    if (selectedActivity) {
      fetchRegistrations()
      // 切换活动时，获取各状态统计数据
      fetchStatusStats(selectedActivity)
    }
  }, [selectedActivity])

  // 监听筛选条件变化，重新加载列表
  useEffect(() => {
    if (selectedActivity) {
      fetchRegistrations()
    }
  }, [activeTab, pagination.current, pagination.pageSize, searchParams])

  // 当筛选条件改变时（非分页变化），重新获取统计数据
  useEffect(() => {
    if (selectedActivity) {
      fetchStatusStats(selectedActivity)
    }
  }, [selectedActivity, searchParams])

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
      const params = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        status: activeTab !== 'all' ? parseInt(activeTab) : undefined,
        keyword: searchParams.keyword || undefined
      }

      // 处理日期范围参数
      if (searchParams.dateRange && searchParams.dateRange.length === 2) {
        params.startTime = searchParams.dateRange[0].format('YYYY-MM-DD HH:mm:ss')
        params.endTime = searchParams.dateRange[1].format('YYYY-MM-DD HH:mm:ss')
      }

      const res = await getActivityRegistrations(selectedActivity, params)

      if (res) {
        const allRegistrations = res.records || res.list || []
        setRegistrations(allRegistrations)
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
    total: statusCounts.total,
    pending: statusCounts.pending,
    approved: statusCounts.approved,
    rejected: statusCounts.rejected,
    waiting: statusCounts.waiting,
    cancelled: statusCounts.cancelled
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

  // 审核通过
  const handleApprove = async (id) => {
    try {
      await auditRegistration(id, { approved: true })
      message.success('审核通过')
      fetchRegistrations()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 显示拒绝弹窗
  const showRejectModal = (id) => {
    setRejectModal({ visible: true, id })
    setRejectReason('')
  }

  // 确认拒绝
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('请输入拒绝原因')
      return
    }
    try {
      await auditRegistration(rejectModal.id, { 
        approved: false, 
        rejectReason: rejectReason.trim() 
      })
      message.success('已拒绝该报名')
      setRejectModal({ visible: false, id: null })
      fetchRegistrations()
    } catch (error) {
      message.error('操作失败')
    }
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
                <span className="value">{record.nickname || record.username || record.userNickname || '-'}</span>
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
                <span className="value">{(record.createdAt || record.createTime) ? dayjs(record.createdAt || record.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </div>
            </Col>
          </Row>
          {(record.auditTime || record.audit_time) && (
            <div className="detail-item">
              <span className="label">审核时间:</span>
              <span className="value">{dayjs(record.auditTime || record.audit_time).format('YYYY-MM-DD HH:mm:ss')}</span>
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
            src={record.avatar || record.userAvatar}
            className="user-avatar"
          />
          <div className="user-info">
            <div className="user-nickname">{record.nickname || record.username || record.userNickname || `用户${record.userId}`}</div>
            <div className="user-username">@{record.username || record.userId}</div>
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
      dataIndex: 'createTime',
      key: 'createTime',
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
      width: 200,
      align: 'center',
      render: (_, record) => {
        if (record.status === 0) {
          return (
            <Space>
              <Button 
                type="primary" 
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button 
                danger 
                size="small"
                onClick={() => showRejectModal(record.id)}
              >
                拒绝
              </Button>
              <Button 
                type="link" 
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              >
                详情
              </Button>
            </Space>
          )
        }
        return (
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        )
      }
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
          <Col span={5}>
            <span className="search-label">选择活动:</span>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择活动"
              value={selectedActivity}
              onChange={setSelectedActivity}
              showSearch
              optionFilterProp="children"
              notFoundContent="暂无活动"
            >
              {activities.map(activity => (
                <Option key={activity.id} value={activity.id}>
                  {activity.title} ({activity.currentParticipants}/{activity.maxParticipants}人)
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <span className="search-label">关键词:</span>
            <Input
              placeholder="搜索用户名/昵称/手机号"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col span={4}>
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
            <span className="search-label">报名时间:</span>
            <RangePicker
              style={{ width: '100%' }}
              value={searchParams.dateRange}
              onChange={(dates) => setSearchParams({ ...searchParams, dateRange: dates })}
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={4}>
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
        {!selectedActivity ? (
          <Empty
            description="请先选择要管理的活动"
            style={{ padding: '60px 0' }}
          />
        ) : (
          <>
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
                  setPagination({ current: page, pageSize, total: pagination.total, statusStats: pagination.statusStats })
                },
                onShowSizeChange: (current, size) => {
                  setPagination(prev => ({ ...prev, pageSize: size, current: 1 }))
                }
              }}
              scroll={{ x: 1200 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无报名数据"
                  />
                )
              }}
            />
          </>
        )}
      </Card>

      {/* 拒绝弹窗 */}
      <Modal
        title="拒绝报名"
        open={rejectModal.visible}
        onOk={handleReject}
        onCancel={() => setRejectModal({ visible: false, id: null })}
        okText="确认拒绝"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div className="reject-modal-content">
          <p>请输入拒绝原因，该原因将发送给报名用户：</p>
          <Input.TextArea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="例如：人数已满、不符合参与要求等..."
            rows={4}
            maxLength={200}
            showCount
          />
        </div>
      </Modal>
    </div>
  )
}

export default RegistrationManage

