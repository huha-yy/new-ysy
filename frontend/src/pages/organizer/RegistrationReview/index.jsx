import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Card, Table, Button, Tag, Space, Modal, message, Input, 
  Avatar, Tabs, Tooltip, Badge, Descriptions, Empty, Statistic, Row, Col
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  LeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  MessageOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { getActivityRegistrations, auditRegistration } from '../../../api/registration'
import { getActivityDetail } from '../../../api/activity'
import { REGISTRATION_STATUS } from '../../../utils/constants'
import dayjs from 'dayjs'
import './RegistrationReview.css'

const { TextArea } = Input

// 报名状态映射
const STATUS_MAP = {
  0: { text: '待审核', color: 'processing', icon: <ClockCircleOutlined /> },
  1: { text: '已通过', color: 'success', icon: <CheckOutlined /> },
  2: { text: '已拒绝', color: 'error', icon: <CloseOutlined /> },
  3: { text: '候补中', color: 'warning', icon: <ExclamationCircleOutlined /> },
  4: { text: '已取消', color: 'default', icon: <ExclamationCircleOutlined /> }
}

function RegistrationReview() {
  const navigate = useNavigate()
  const { id: activityId } = useParams()

  // 如果没有 activityId，返回活动列表
  useEffect(() => {
    console.log('RegistrationReview 组件已加载，activityId:', activityId)
    if (!activityId) {
      message.error('活动ID不存在')
      navigate('/organizer/activities')
    }
  }, [activityId, navigate])

  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState('0') // 默认显示待审核
  const [keyword, setKeyword] = useState('')
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null })
  const [rejectReason, setRejectReason] = useState('')
  const [detailModal, setDetailModal] = useState({ visible: false, record: null })
  const [error, setError] = useState(null)

  // 加载活动信息
  useEffect(() => {
    if (activityId) {
      console.log('开始加载数据，activityId:', activityId)
      fetchActivityInfo()
      fetchRegistrations()
    }
  }, [activityId])

  const fetchActivityInfo = async () => {
    try {
      console.log('获取活动信息，activityId:', activityId)
      const res = await getActivityDetail(activityId)
      console.log('活动信息返回:', res)
      setActivity(res)
    } catch (error) {
      console.error('获取活动信息失败:', error)
      // 使用模拟数据
      setActivity({
        id: activityId,
        title: '周末香山登顶徒步',
        startTime: '2024-12-28 08:00:00',
        maxParticipants: 30,
        currentParticipants: 15
      })
    }
  }

  const fetchRegistrations = async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      console.log('获取报名列表，activityId:', activityId)
      const res = await getActivityRegistrations(activityId, {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        status: activeTab !== 'all' ? parseInt(activeTab) : undefined,
        keyword,
        ...params
      })
      console.log('报名列表返回数据:', res)
      console.log('报名记录详情:', res?.records || res?.list)
      if (res) {
        setRegistrations(res.records || res.list || res || [])
        setPagination(prev => ({
          ...prev,
          total: res.total || 0
        }))
      }
    } catch (error) {
      console.error('获取报名列表失败:', error)
      setError('获取报名列表失败，请稍后重试')
      // 使用模拟数据
      setRegistrations([
        {
          id: 1,
          userId: 101,
          userNickname: '登山爱好者',
          userAvatar: null,
          activityId: activityId,
          activityTitle: '周末香山登顶徒步',
          activityDate: '2025-01-20',
          status: 0,
          statusText: '待审核',
          remark: '我有3年徒步经验，非常期待这次活动！',
          createTime: '2024-12-22 14:30:00'
        },
        {
          id: 2,
          userId: 102,
          userNickname: '户外达人',
          userAvatar: null,
          activityId: activityId,
          activityTitle: '周末香山登顶徒步',
          activityDate: '2025-01-20',
          status: 0,
          statusText: '待审核',
          remark: '已准备好所有装备',
          createTime: '2024-12-23 09:15:00'
        },
        {
          id: 3,
          userId: 103,
          userNickname: '自然探索者',
          userAvatar: null,
          activityId: activityId,
          activityTitle: '周末香山登顶徒步',
          activityDate: '2025-01-20',
          status: 1,
          statusText: '已通过',
          remark: '第一次参加户外徒步',
          auditorNickname: '活动组织者',
          auditTime: '2024-12-22 10:00:00',
          createTime: '2024-12-21 16:45:00'
        }
      ])
      setPagination(prev => ({ ...prev, total: 3 }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations({ pageNum: 1 })
  }, [activeTab])

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

  // 批量审核通过
  const handleBatchApprove = async () => {
    const pendingIds = registrations
      .filter(r => r.status === 0)
      .map(r => r.id)
    
    if (pendingIds.length === 0) {
      message.info('没有待审核的报名')
      return
    }

    Modal.confirm({
      title: '批量审核',
      content: `确定要通过 ${pendingIds.length} 个待审核报名吗？`,
      okText: '确认通过',
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(pendingIds.map(id => auditRegistration(id, { approved: true })))
          message.success(`已通过 ${pendingIds.length} 个报名`)
          fetchRegistrations()
        } catch (error) {
          message.error('操作失败')
        }
      }
    })
  }

  // 查看详情
  const showDetail = (record) => {
    setDetailModal({ visible: true, record })
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
            src={record.userAvatar}
            className="user-avatar"
          />
          <div className="user-info">
            <div className="user-nickname">{record.userNickname || `用户${record.userId}`}</div>
            <div className="user-username">ID: {record.userId}</div>
          </div>
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
      render: (time) => dayjs(time).format('MM-DD HH:mm')
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
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        if (record.status === 0) {
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
                拒绝
              </Button>
              <Tooltip title="查看详情">
                <Button 
                  type="text" 
                  size="small"
                  icon={<FileTextOutlined />}
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
              icon={<FileTextOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
        )
      }
    }
  ]

  // 统计数据
  const getStats = () => {
    return {
      total: registrations.length,
      pending: registrations.filter(r => r.status === 0).length,
      approved: registrations.filter(r => r.status === 1).length,
      rejected: registrations.filter(r => r.status === 2).length
    }
  }

  const stats = getStats()

  const tabItems = [
    { key: '0', label: <Badge count={stats.pending} offset={[10, 0]}>待审核</Badge> },
    { key: '1', label: `已通过 (${stats.approved})` },
    { key: '2', label: `已拒绝 (${stats.rejected})` },
    { key: '3', label: `候补中 (${stats.waiting})` },
    { key: 'all', label: `全部 (${stats.total})` }
  ]

  return (
    <div className="registration-review-page">
      {/* 页面头部 */}
      <div className="page-header">
        <div className="header-left">
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/organizer/activities')}
            className="back-btn"
          >
            返回
          </Button>
          <div className="header-title">
            <h1 className="page-title">
              <TeamOutlined className="title-icon" />
              报名审核
            </h1>
            {activity && (
              <div className="activity-info">
                <span className="activity-name">{activity.title}</span>
                <Tag color="blue">{dayjs(activity.startTime).format('MM-DD HH:mm')}</Tag>
              </div>
            )}
          </div>
        </div>
        {stats.pending > 0 && (
          <Button 
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleBatchApprove}
          >
            全部通过 ({stats.pending})
          </Button>
        )}
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card className="stat-card">
            <Statistic 
              title="报名总数" 
              value={stats.total} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
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
              suffix={activity ? `/ ${activity.maxParticipants}` : ''} 
              prefix={<CheckOutlined />}
              valueStyle={{ color: 'var(--success-color)' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card rejected">
            <Statistic 
              title="已拒绝" 
              value={stats.rejected} 
              prefix={<CloseOutlined />}
              valueStyle={{ color: 'var(--danger-color)' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 报名列表 */}
      <Card className="registrations-card">
        <div className="card-header">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
            className="status-tabs"
          />
          <div className="search-area">
            <Input
              placeholder="搜索用户名或手机号..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onPressEnter={() => fetchRegistrations({ pageNum: 1 })}
              style={{ width: 200 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchRegistrations()}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={registrations}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条报名`
          }}
          onChange={(paginationConfig) => {
            setPagination(prev => ({
              ...prev,
              current: paginationConfig.current,
              pageSize: paginationConfig.pageSize
            }))
            fetchRegistrations({
              pageNum: paginationConfig.current,
              pageSize: paginationConfig.pageSize
            })
          }}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无报名数据"
              />
            )
          }}
        />
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
          <TextArea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="例如：人数已满、不符合参与要求等..."
            rows={4}
            maxLength={200}
            showCount
          />
        </div>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="报名详情"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, record: null })}
        footer={
          detailModal.record?.status === 0 ? (
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
                拒绝
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
        width={600}
      >
        {detailModal.record && (
          <div className="detail-content">
            <div className="user-header">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={detailModal.record.userAvatar}
              />
              <div className="user-meta">
                <h3>{detailModal.record.userNickname || `用户${detailModal.record.userId}`}</h3>
                <p>用户ID: {detailModal.record.userId}</p>
              </div>
              <Tag
                color={STATUS_MAP[detailModal.record.status]?.color}
                style={{ marginLeft: 'auto' }}
              >
                {STATUS_MAP[detailModal.record.status]?.text}
              </Tag>
            </div>

            <Descriptions column={2} className="detail-descriptions">
              <Descriptions.Item label="报名时间" span={2}>
                {dayjs(detailModal.record.createTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              {detailModal.record.auditorNickname && (
                <Descriptions.Item label="审核人">
                  {detailModal.record.auditorNickname}
                </Descriptions.Item>
              )}
              {detailModal.record.auditTime && (
                <Descriptions.Item label="审核时间">
                  {dayjs(detailModal.record.auditTime).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              )}
              {detailModal.record.queueNumber && detailModal.record.queueNumber > 0 && (
                <Descriptions.Item label="排队序号">
                  {detailModal.record.queueNumber}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="报名留言" span={detailModal.record.queueNumber > 0 ? 2 : 1}>
                {detailModal.record.remark || '无'}
              </Descriptions.Item>
              {detailModal.record.rejectReason && (
                <Descriptions.Item label="拒绝原因" span={2}>
                  {detailModal.record.rejectReason}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default RegistrationReview

