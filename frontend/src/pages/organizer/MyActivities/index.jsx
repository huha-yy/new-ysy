import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, Space, Modal, message, Tabs, Input, Tooltip, Popconfirm, Badge, Empty } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  SendOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { getMyActivities, deleteActivity, cancelActivity, submitActivity } from '../../../api/activity'
import { ACTIVITY_STATUS, DIFFICULTY_MAP } from '../../../utils/constants'
import dayjs from 'dayjs'
import './MyActivities.css'

// 活动状态映射
const STATUS_MAP = {
  0: { text: '草稿', color: 'default', icon: <EditOutlined /> },
  1: { text: '待审核', color: 'processing', icon: <ClockCircleOutlined /> },
  2: { text: '已发布', color: 'success', icon: <CheckCircleOutlined /> },
  3: { text: '进行中', color: 'green', icon: <TeamOutlined /> },
  4: { text: '已结束', color: 'default', icon: <CheckCircleOutlined /> },
  5: { text: '已取消', color: 'default', icon: <StopOutlined /> },
  6: { text: '已驳回', color: 'error', icon: <ExclamationCircleOutlined /> }
}

function MyActivities() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState('all')
  const [keyword, setKeyword] = useState('')

  // 加载活动列表
  const fetchActivities = async (params = {}) => {
    setLoading(true)
    try {
      const res = await getMyActivities({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        keyword,
        status: activeTab !== 'all' ? parseInt(activeTab) : undefined,
        ...params
      })
      if (res) {
        setActivities(res.records || res.list || res || [])
        setPagination(prev => ({
          ...prev,
          total: res.total || 0
        }))
      }
    } catch (error) {
      console.error('获取活动列表失败:', error)
      // 使用模拟数据
      setActivities([
        {
          id: 1,
          title: '周末香山登顶徒步',
          coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300',
          difficultyLevel: 2,
          startTime: '2024-12-28 08:00:00',
          endTime: '2024-12-28 18:00:00',
          currentParticipants: 15,
          maxParticipants: 30,
          fee: 99,
          status: 4,
          createTime: '2024-12-20 10:00:00'
        },
        {
          id: 2,
          title: '长城野长城穿越之旅',
          coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300',
          difficultyLevel: 4,
          startTime: '2025-01-05 07:00:00',
          endTime: '2025-01-05 19:00:00',
          currentParticipants: 8,
          maxParticipants: 20,
          fee: 199,
          status: 1,
          createTime: '2024-12-22 14:30:00'
        },
        {
          id: 3,
          title: '密云水库环湖骑行',
          coverImage: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=300',
          difficultyLevel: 1,
          startTime: '2025-01-12 09:00:00',
          endTime: '2025-01-12 16:00:00',
          currentParticipants: 0,
          maxParticipants: 25,
          fee: 0,
          status: 0,
          createTime: '2024-12-25 09:00:00'
        }
      ])
      setPagination(prev => ({ ...prev, total: 3 }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [activeTab])

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchActivities({ pageNum: 1 })
  }

  // 处理分页变化
  const handleTableChange = (paginationConfig) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }))
    fetchActivities({
      pageNum: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    })
  }

  // 提交审核
  const handleSubmit = async (id) => {
    try {
      await submitActivity(id)
      message.success('已提交审核')
      fetchActivities()
    } catch (error) {
      message.error('提交失败')
    }
  }

  // 删除活动
  const handleDelete = async (id) => {
    try {
      await deleteActivity(id)
      message.success('删除成功')
      fetchActivities()
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 取消活动
  const handleCancel = async (id) => {
    try {
      await cancelActivity(id)
      message.success('活动已取消')
      fetchActivities()
    } catch (error) {
      message.error('取消失败')
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '活动信息',
      key: 'info',
      width: 350,
      render: (_, record) => (
        <div className="activity-info-cell">
          <img 
            src={record.coverImage || 'https://via.placeholder.com/80x60?text=活动'} 
            alt={record.title} 
            className="activity-cover-thumb"
          />
          <div className="activity-info-text">
            <div className="activity-title-row">
              <span className="activity-title">{record.title}</span>
              <Tag color={DIFFICULTY_MAP[record.difficultyLevel] === '休闲' ? 'green' : 
                         DIFFICULTY_MAP[record.difficultyLevel] === '简单' ? 'blue' : 
                         DIFFICULTY_MAP[record.difficultyLevel] === '中等' ? 'orange' : 
                         DIFFICULTY_MAP[record.difficultyLevel] === '困难' ? 'red' : 'purple'}>
                {DIFFICULTY_MAP[record.difficultyLevel]}
              </Tag>
            </div>
            <div className="activity-time">
              {dayjs(record.startTime).format('MM-DD HH:mm')} ~ {dayjs(record.endTime).format('MM-DD HH:mm')}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '报名情况',
      key: 'participants',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="participants-cell">
          <div className="participants-count">
            <TeamOutlined /> {record.currentParticipants || 0} / {record.maxParticipants}
          </div>
          <div className="participants-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${((record.currentParticipants || 0) / record.maxParticipants) * 100}%` 
              }}
            />
          </div>
        </div>
      )
    },
    {
      title: '费用',
      dataIndex: 'fee',
      key: 'fee',
      width: 100,
      align: 'center',
      render: (fee) => (
        <span className={fee > 0 ? 'fee-paid' : 'fee-free'}>
          {fee > 0 ? `¥${fee}` : '免费'}
        </span>
      )
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      render: (time) => dayjs(time).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const actions = []
        
        // 查看详情
        actions.push(
          <Tooltip title="查看详情" key="view">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => navigate(`/activities/${record.id}`)}
            />
          </Tooltip>
        )

        // 草稿状态：可编辑、提交审核、删除
        if (record.status === ACTIVITY_STATUS.DRAFT) {
          actions.push(
            <Tooltip title="编辑" key="edit">
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/organizer/activities/${record.id}/edit`)}
              />
            </Tooltip>
          )
          actions.push(
            <Tooltip title="提交审核" key="submit">
              <Button 
                type="text" 
                icon={<SendOutlined />}
                onClick={() => handleSubmit(record.id)}
                style={{ color: 'var(--primary-color)' }}
              />
            </Tooltip>
          )
          actions.push(
            <Popconfirm
              key="delete"
              title="确定要删除这个活动吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button type="text" icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          )
        }

        // 待审核状态：可查看
        if (record.status === ACTIVITY_STATUS.PENDING) {
          actions.push(
            <Tag key="pending" color="processing">审核中...</Tag>
          )
        }

        // 已驳回状态：可编辑、重新提交
        if (record.status === ACTIVITY_STATUS.REJECTED) {
          actions.push(
            <Tooltip title="编辑并重新提交" key="edit">
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => navigate(`/organizer/activities/${record.id}/edit`)}
              />
            </Tooltip>
          )
        }

        // 已发布状态：可查看报名、取消活动
        if (record.status === ACTIVITY_STATUS.PUBLISHED) {
          actions.push(
            <Tooltip title="报名管理" key="registrations">
              <Button 
                type="text" 
                icon={<TeamOutlined />}
                onClick={() => navigate(`/organizer/activities/${record.id}/registrations`)}
                style={{ color: 'var(--success-color)' }}
              />
            </Tooltip>
          )
          actions.push(
            <Popconfirm
              key="cancel"
              title="确定要取消这个活动吗？取消后无法恢复！"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="取消活动">
                <Button type="text" icon={<StopOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          )
        }

        // 进行中状态：可查看签到
        if (record.status === ACTIVITY_STATUS.IN_PROGRESS) {
          actions.push(
            <Tooltip title="签到监控" key="checkin">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />}
                onClick={() => navigate(`/organizer/activities/${record.id}/checkin`)}
                style={{ color: 'var(--success-color)' }}
              />
            </Tooltip>
          )
        }

        return <Space size="small">{actions}</Space>
      }
    }
  ]

  // 统计卡片数据
  const getStatCards = () => {
    const stats = {
      total: activities.length,
      draft: activities.filter(a => a.status === 0).length,
      pending: activities.filter(a => a.status === 1).length,
      published: activities.filter(a => a.status === 2).length,
      inProgress: activities.filter(a => a.status === 3).length,
      ended: activities.filter(a => a.status === 4).length
    }
    return stats
  }

  const stats = getStatCards()

  const tabItems = [
    { key: 'all', label: `全部 (${stats.total})` },
    { key: '0', label: `草稿 (${stats.draft})` },
    { key: '1', label: `待审核 (${stats.pending})` },
    { key: '2', label: `已发布 (${stats.published})` },
    { key: '3', label: `进行中 (${stats.inProgress})` },
    { key: '4', label: `已结束 (${stats.ended})` }
  ]

  return (
    <div className="my-activities-page">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            <CalendarOutlined className="title-icon" />
            我发布的活动
          </h1>
          <p className="page-subtitle">管理您创建的所有户外活动</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          className="create-btn"
          onClick={() => navigate('/organizer/activities/create')}
        >
          发布新活动
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="stats-row">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">全部活动</div>
          </div>
        </div>
        <div className="stat-card draft">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">草稿</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">待审核</div>
          </div>
        </div>
        <div className="stat-card published">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.published}</div>
            <div className="stat-label">已发布</div>
          </div>
        </div>
        <div className="stat-card progress">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">进行中</div>
          </div>
        </div>
        <div className="stat-card ended">
          <div className="stat-icon">🏁</div>
          <div className="stat-content">
            <div className="stat-value">{stats.ended}</div>
            <div className="stat-label">已结束</div>
          </div>
        </div>
      </div>

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
              onPressEnter={handleSearch}
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
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条活动`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无活动数据"
              >
                <Button type="primary" onClick={() => navigate('/organizer/activities/create')}>
                  发布第一个活动
                </Button>
              </Empty>
            )
          }}
        />
      </Card>
    </div>
  )
}

// 导入CalendarOutlined
import { CalendarOutlined } from '@ant-design/icons'

export default MyActivities

