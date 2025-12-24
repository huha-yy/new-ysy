import { useState, useEffect } from 'react'
import { 
  Card, Table, Button, Tag, Space, Input, message, 
  Avatar, Tabs, Modal, Descriptions, Badge, Switch, Tooltip, Row, Col, Statistic
} from 'antd'
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  StopOutlined,
  CheckCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TeamOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { getUserList, updateUserStatus, getUserStats } from '../../../api/admin'
import { ROLE } from '../../../utils/constants'
import dayjs from 'dayjs'
import './UserManage.css'

// 用户角色映射
const ROLE_MAP = {
  0: { text: '普通用户', color: 'blue', icon: <UserOutlined /> },
  1: { text: '组织者', color: 'orange', icon: <TeamOutlined /> },
  2: { text: '管理员', color: 'red', icon: <CrownOutlined /> }
}

// 用户状态映射
const STATUS_MAP = {
  0: { text: '禁用', color: 'error' },
  1: { text: '正常', color: 'success' }
}

function UserManage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [detailModal, setDetailModal] = useState({ visible: false, record: null })

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    users: 0,
    organizers: 0,
    admins: 0,
    disabled: 0
  })

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [activeTab])

  // 获取用户统计数据
  const fetchStats = async () => {
    try {
      const statsData = await getUserStats()
      if (statsData) {
        setStats({
          total: statsData.total || 0,
          users: statsData.users || 0,
          organizers: statsData.organizers || 0,
          admins: statsData.admins || 0,
          disabled: statsData.disabled || 0
        })
      }
    } catch (error) {
      console.error('获取用户统计失败:', error)
      // 使用默认值
      setStats({
        total: 0,
        users: 0,
        organizers: 0,
        admins: 0,
        disabled: 0
      })
    }
  }

  const fetchUsers = async (params = {}) => {
    setLoading(true)
    try {
      const res = await getUserList({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        role: activeTab !== 'all' ? parseInt(activeTab) : undefined,
        ...params
      })
      if (res) {
        setUsers(res.records || res.list || res || [])
        setPagination(prev => ({
          ...prev,
          total: res.total || 0
        }))
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      // 使用模拟数据
      const mockData = [
        {
          id: 1,
          username: 'admin',
          nickname: '系统管理员',
          avatar: null,
          phone: '138****0000',
          email: 'admin@hiking.com',
          role: 2,
          status: 1,
          createdAt: '2024-01-01 00:00:00',
          lastLoginAt: '2024-12-26 09:30:00',
          activityCount: 0,
          registrationCount: 0
        },
        {
          id: 2,
          username: 'hiking_organizer',
          nickname: '户外探险家',
          avatar: null,
          phone: '137****1234',
          email: 'organizer@hiking.com',
          role: 1,
          status: 1,
          createdAt: '2024-03-15 10:30:00',
          lastLoginAt: '2024-12-25 14:20:00',
          activityCount: 12,
          registrationCount: 0
        },
        {
          id: 3,
          username: 'hiking_lover',
          nickname: '登山爱好者',
          avatar: null,
          phone: '136****5678',
          email: 'lover@hiking.com',
          role: 0,
          status: 1,
          createdAt: '2024-06-20 08:15:00',
          lastLoginAt: '2024-12-26 08:00:00',
          activityCount: 0,
          registrationCount: 8
        },
        {
          id: 4,
          username: 'outdoor_fan',
          nickname: '户外达人',
          avatar: null,
          phone: '135****9012',
          email: 'fan@hiking.com',
          role: 0,
          status: 1,
          createdAt: '2024-08-10 14:45:00',
          lastLoginAt: '2024-12-24 16:30:00',
          activityCount: 0,
          registrationCount: 15
        },
        {
          id: 5,
          username: 'spam_user',
          nickname: '违规用户',
          avatar: null,
          phone: '139****3456',
          email: 'spam@test.com',
          role: 0,
          status: 0,
          createdAt: '2024-11-01 12:00:00',
          lastLoginAt: '2024-11-05 10:00:00',
          activityCount: 0,
          registrationCount: 0
        }
      ]
      setUsers(mockData)
      setStats({
        total: 1256,
        users: 1200,
        organizers: 50,
        admins: 6,
        disabled: 12
      })
      setPagination(prev => ({ ...prev, total: mockData.length }))
    } finally {
      setLoading(false)
    }
  }

  // 切换用户状态
  const handleToggleStatus = async (record) => {
    const newStatus = record.status === 1 ? 0 : 1
    const action = newStatus === 0 ? '禁用' : '启用'
    
    Modal.confirm({
      title: `确认${action}该用户？`,
      icon: <ExclamationCircleOutlined />,
      content: newStatus === 0 
        ? '禁用后该用户将无法登录系统。'
        : '启用后该用户可以正常使用系统。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await updateUserStatus(record.id, { status: newStatus })
          message.success(`${action}成功`)
          fetchUsers()
        } catch (error) {
          message.error(`${action}失败`)
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
      title: '用户信息',
      key: 'user',
      width: 250,
      render: (_, record) => (
        <div className="user-cell">
          <Avatar 
            size={48} 
            icon={<UserOutlined />} 
            src={record.avatar}
            className={`user-avatar role-${record.role}`}
          />
          <div className="user-info">
            <div className="user-nickname">
              {record.nickname || record.username}
              {record.role === 2 && <CrownOutlined className="admin-icon" />}
            </div>
            <div className="user-username">@{record.username}</div>
          </div>
        </div>
      )
    },
    {
      title: '角色',
      key: 'role',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const roleInfo = ROLE_MAP[record.role] || { text: '未知', color: 'default' }
        return (
          <Tag color={roleInfo.color} icon={roleInfo.icon}>
            {roleInfo.text}
          </Tag>
        )
      }
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div className="contact-cell">
          <div><PhoneOutlined /> {record.phone}</div>
          <div><MailOutlined /> {record.email}</div>
        </div>
      )
    },
    {
      title: '活动/报名',
      key: 'stats',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="stats-cell">
          {record.role === 1 ? (
            <span className="stat-item">
              <CalendarOutlined /> {record.activityCount} 个活动
            </span>
          ) : (
            <span className="stat-item">
              <TeamOutlined /> {record.registrationCount} 次报名
            </span>
          )}
        </div>
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
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
          <Badge 
            status={statusInfo.color === 'success' ? 'success' : 'error'} 
            text={statusInfo.text} 
          />
        )
      }
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small"
              icon={<UserOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          {record.role !== 2 && ( // 管理员不能被禁用
            <Tooltip title={record.status === 1 ? '禁用用户' : '启用用户'}>
              <Switch
                size="small"
                checked={record.status === 1}
                onChange={() => handleToggleStatus(record)}
                checkedChildren={<CheckCircleOutlined />}
                unCheckedChildren={<StopOutlined />}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  const tabItems = [
    { key: 'all', label: `全部 (${stats.total})` },
    { key: '0', label: `普通用户 (${stats.users})` },
    { key: '1', label: `组织者 (${stats.organizers})` },
    { key: '2', label: `管理员 (${stats.admins})` }
  ]

  return (
    <div className="user-manage-page">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            <SafetyCertificateOutlined className="title-icon" />
            用户管理
          </h1>
          <p className="page-subtitle">管理系统所有用户账户</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card className="stat-card total">
            <Statistic 
              title="用户总数" 
              value={stats.total} 
              prefix={<UserOutlined />}
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card users">
            <Statistic 
              title="普通用户" 
              value={stats.users} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card organizers">
            <Statistic 
              title="组织者" 
              value={stats.organizers} 
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card disabled">
            <Statistic 
              title="已禁用" 
              value={stats.disabled} 
              prefix={<StopOutlined />}
              valueStyle={{ color: 'var(--danger-color)' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 用户列表 */}
      <Card className="users-card">
        <div className="card-header">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
            className="role-tabs"
          />
          <div className="search-area">
            <Input
              placeholder="搜索用户名、昵称或手机号..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onPressEnter={() => fetchUsers({ pageNum: 1 })}
              style={{ width: 250 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchUsers()}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个用户`
          }}
          onChange={(paginationConfig) => {
            setPagination(prev => ({
              ...prev,
              current: paginationConfig.current,
              pageSize: paginationConfig.pageSize
            }))
            fetchUsers({
              pageNum: paginationConfig.current,
              pageSize: paginationConfig.pageSize
            })
          }}
          scroll={{ x: 1100 }}
          rowClassName={(record) => record.status === 0 ? 'disabled-row' : ''}
        />
      </Card>

      {/* 用户详情弹窗 */}
      <Modal
        title="用户详情"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, record: null })}
        footer={null}
        width={600}
      >
        {detailModal.record && (
          <div className="user-detail-content">
            <div className="user-header">
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                src={detailModal.record.avatar}
                className={`role-${detailModal.record.role}`}
              />
              <div className="user-meta">
                <h3>
                  {detailModal.record.nickname || detailModal.record.username}
                  {detailModal.record.role === 2 && <CrownOutlined className="admin-icon" />}
                </h3>
                <p>@{detailModal.record.username}</p>
                <Space>
                  <Tag color={ROLE_MAP[detailModal.record.role]?.color}>
                    {ROLE_MAP[detailModal.record.role]?.text}
                  </Tag>
                  <Badge 
                    status={detailModal.record.status === 1 ? 'success' : 'error'} 
                    text={STATUS_MAP[detailModal.record.status]?.text} 
                  />
                </Space>
              </div>
            </div>

            <Descriptions column={2} className="detail-descriptions">
              <Descriptions.Item label="手机号码">
                {detailModal.record.phone}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {detailModal.record.email}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {dayjs(detailModal.record.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="最后登录">
                {detailModal.record.lastLoginAt 
                  ? dayjs(detailModal.record.lastLoginAt).format('YYYY-MM-DD HH:mm')
                  : '从未登录'
                }
              </Descriptions.Item>
              {detailModal.record.role === 1 ? (
                <Descriptions.Item label="发布活动数" span={2}>
                  {detailModal.record.activityCount} 个
                </Descriptions.Item>
              ) : (
                <Descriptions.Item label="报名次数" span={2}>
                  {detailModal.record.registrationCount} 次
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UserManage

