import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Card, Table, Button, Tag, Space, Modal, Input, message, 
  Tabs, Tooltip, Badge, Descriptions, Image, Row, Col, Statistic
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { getPendingActivities, getAllActivities } from '../../../api/admin'
import { auditActivity } from '../../../api/activity'
import { DIFFICULTY_MAP, ACTIVITY_STATUS } from '../../../utils/constants'
import { getActivityCoverUrl } from '../../../utils/imageUrl'
import dayjs from 'dayjs'
import './ActivityAudit.css'

const { TextArea } = Input

// 活动状态映射（与后端保持一致：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回）
const STATUS_MAP = {
  0: { text: '草稿', color: 'default' },
  1: { text: '待审核', color: 'processing' },
  2: { text: '已发布', color: 'success' },
  3: { text: '进行中', color: 'green' },
  4: { text: '已结束', color: 'default' },
  5: { text: '已取消', color: 'default' },
  6: { text: '已驳回', color: 'error' }
}

function ActivityAudit() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState('pending')
  const [keyword, setKeyword] = useState('')
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null })
  const [rejectReason, setRejectReason] = useState('')
  const [detailModal, setDetailModal] = useState({ visible: false, record: null })

  // 统计数据
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  // 获取各状态的统计数据
  const fetchStatusStats = async () => {
    try {
      const statuses = [0, 1, 2, 3, 4, 5, 6]
      const counts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      }

      for (const status of statuses) {
        try {
          const res = await getAllActivities({
            pageNum: 1,
            pageSize: 1,
            status
          })
          const count = res?.total || 0
          counts.total += count
          if (status === 1) counts.pending = count
          else if (status === 2) counts.approved = count
          else if (status === 6) counts.rejected = count
        } catch (e) {
          console.error(`获取状态${status}统计失败:`, e)
        }
      }

      setStats(counts)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  useEffect(() => {
    // 初始加载：获取统计数据
    fetchStatusStats()
    // 加载当前标签的数据
    fetchActivities()
  }, [])

  useEffect(() => {
    // 切换标签：重新加载列表
    fetchActivities()
  }, [activeTab])

  const fetchActivities = async (params = {}) => {
    setLoading(true)
    try {
      let res
      if (activeTab === 'pending') {
        res = await getPendingActivities({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          keyword,
          ...params
        })
      } else {
        res = await getAllActivities({
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
          keyword,
          status: activeTab !== 'all' ? parseInt(activeTab) : undefined,
          ...params
        })
      }
      if (res) {
        setActivities(res.records || res.list || res || [])
        setPagination(prev => ({
          ...prev,
          total: res.total || 0
        }))
      }
    } catch (error) {
      console.error('获取活动列表失败:', error)
      message.error('获取活动列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 审核通过
  const handleApprove = async (id) => {
    Modal.confirm({
      title: '确认通过审核？',
      content: '通过后活动将自动发布，用户可以开始报名。',
      okText: '确认通过',
      cancelText: '取消',
      onOk: async () => {
        try {
          await auditActivity(id, { approved: true })
          message.success('审核通过，活动已发布')
          fetchActivities()
        } catch (error) {
          message.error('操作失败')
        }
      }
    })
  }

  // 显示拒绝弹窗
  const showRejectModal = (id) => {
    setRejectModal({ visible: true, id })
    setRejectReason('')
  }

  // 确认拒绝
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('请输入驳回原因')
      return
    }
    try {
      await auditActivity(rejectModal.id, { 
        approved: false, 
        rejectReason: rejectReason.trim() 
      })
      message.success('已驳回该活动')
      setRejectModal({ visible: false, id: null })
      fetchActivities()
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 查看详情
  const showDetail = (record) => {
    setDetailModal({ visible: true, record })
  }

  // 表格列定义
  const columns = [
    {
      title: '活动信息',
      key: 'info',
      width: 320,
      render: (_, record) => (
        <div className="activity-info-cell">
          <img
            src={getActivityCoverUrl(record)}
            alt={record.title}
            className="activity-cover"
          />
          <div className="activity-text">
            <div className="activity-title">{record.title}</div>
            <div className="activity-meta">
              <Tag color={
                DIFFICULTY_MAP[record.difficultyLevel] === '休闲' ? 'green' : 
                DIFFICULTY_MAP[record.difficultyLevel] === '简单' ? 'blue' : 
                DIFFICULTY_MAP[record.difficultyLevel] === '中等' ? 'orange' : 
                DIFFICULTY_MAP[record.difficultyLevel] === '困难' ? 'red' : 'purple'
              }>
                {DIFFICULTY_MAP[record.difficultyLevel]}
              </Tag>
              <span className="fee">
                {record.fee > 0 ? `¥${record.fee}` : '免费'}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '组织者',
      dataIndex: 'organizerName',
      key: 'organizerName',
      width: 120,
      render: (name) => (
        <span><UserOutlined /> {name}</span>
      )
    },
    {
      title: '活动时间',
      key: 'time',
      width: 180,
      render: (_, record) => (
        <div className="time-cell">
          <div>{dayjs(record.startTime).format('YYYY-MM-DD')}</div>
          <div className="time-range">
            {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </div>
        </div>
      )
    },
    {
      title: '人数上限',
      dataIndex: 'maxParticipants',
      key: 'maxParticipants',
      width: 100,
      align: 'center',
      render: (num) => <span><TeamOutlined /> {num}人</span>
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const statusInfo = STATUS_MAP[record.status] || { text: '未知', color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (time) => dayjs(time).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 1) {
          return (
            <Space>
              <Button 
                type="primary" 
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                className="approve-btn"
              >
                通过
              </Button>
              <Button 
                danger 
                size="small"
                icon={<CloseOutlined />}
                onClick={() => showRejectModal(record.id)}
              >
                驳回
              </Button>
              <Tooltip title="查看详情">
                <Button 
                  type="text" 
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => showDetail(record)}
                />
              </Tooltip>
            </Space>
          )
        }
        return (
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
        )
      }
    }
  ]

  const tabItems = [
    { key: 'pending', label: <Badge count={stats.pending} offset={[10, 0]}>待审核</Badge> },
    { key: '2', label: `已发布 (${stats.approved})` },
    { key: '6', label: `已驳回 (${stats.rejected})` },
    { key: 'all', label: `全部 (${stats.total})` }
  ]

  return (
    <div className="activity-audit-page">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            <FileTextOutlined className="title-icon" />
            活动审核
          </h1>
          <p className="page-subtitle">审核组织者提交的活动申请</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card className="stat-card pending">
            <Statistic 
              title="待审核" 
              value={stats.pending} 
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card approved">
            <Statistic 
              title="已通过" 
              value={stats.approved} 
              prefix={<CheckOutlined />}
              valueStyle={{ color: 'var(--success-color)' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card rejected">
            <Statistic 
              title="已驳回" 
              value={stats.rejected} 
              prefix={<CloseOutlined />}
              valueStyle={{ color: 'var(--danger-color)' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card total">
            <Statistic 
              title="活动总数" 
              value={stats.total} 
              prefix={<CalendarOutlined />}
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 活动列表 */}
      <Card className="activities-card">
        <div className="card-header">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
            className="status-tabs"
          />
          <div className="search-area">
            <Input
              placeholder="搜索活动名称..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onPressEnter={() => fetchActivities({ pageNum: 1 })}
              style={{ width: 200 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchActivities()}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={activities}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条活动`
          }}
          onChange={(paginationConfig) => {
            setPagination(prev => ({
              ...prev,
              current: paginationConfig.current,
              pageSize: paginationConfig.pageSize
            }))
            fetchActivities({
              pageNum: paginationConfig.current,
              pageSize: paginationConfig.pageSize
            })
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 驳回弹窗 */}
      <Modal
        title={
          <span className="reject-modal-title">
            <ExclamationCircleOutlined style={{ color: 'var(--danger-color)' }} /> 驳回活动
          </span>
        }
        open={rejectModal.visible}
        onOk={handleReject}
        onCancel={() => setRejectModal({ visible: false, id: null })}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div className="reject-modal-content">
          <p>请输入驳回原因，该原因将发送给组织者：</p>
          <TextArea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="例如：活动信息不完整、路线描述不清晰、安全措施不足等..."
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="活动详情"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, record: null })}
        footer={
          detailModal.record?.status === 1 ? (
            <Space>
              <Button onClick={() => setDetailModal({ visible: false, record: null })}>
                关闭
              </Button>
              <Button 
                danger
                onClick={() => {
                  setDetailModal({ visible: false, record: null })
                  showRejectModal(detailModal.record.id)
                }}
              >
                驳回
              </Button>
              <Button 
                type="primary"
                onClick={() => {
                  handleApprove(detailModal.record.id)
                  setDetailModal({ visible: false, record: null })
                }}
              >
                通过
              </Button>
            </Space>
          ) : null
        }
        width={700}
      >
        {detailModal.record && (
          <div className="detail-content">
            <div className="detail-cover">
              <Image
                src={getActivityCoverUrl(detailModal.record)}
                alt={detailModal.record.title}
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12 }}
              />
            </div>
            <h2 className="detail-title">{detailModal.record.title}</h2>
            <Descriptions column={2} className="detail-descriptions">
              <Descriptions.Item label="组织者">
                <UserOutlined /> {detailModal.record.organizerName}
              </Descriptions.Item>
              <Descriptions.Item label="难度等级">
                <Tag color="orange">{DIFFICULTY_MAP[detailModal.record.difficultyLevel]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="活动时间" span={2}>
                <CalendarOutlined /> {dayjs(detailModal.record.startTime).format('YYYY-MM-DD HH:mm')} 
                ~ {dayjs(detailModal.record.endTime).format('MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="集合地点" span={2}>
                <EnvironmentOutlined /> {detailModal.record.startLocation}
              </Descriptions.Item>
              <Descriptions.Item label="人数上限">
                <TeamOutlined /> {detailModal.record.maxParticipants} 人
              </Descriptions.Item>
              <Descriptions.Item label="活动费用">
                <DollarOutlined /> {detailModal.record.fee > 0 ? `¥${detailModal.record.fee}` : '免费'}
              </Descriptions.Item>
              <Descriptions.Item label="活动描述" span={2}>
                {detailModal.record.description || '无'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ActivityAudit

