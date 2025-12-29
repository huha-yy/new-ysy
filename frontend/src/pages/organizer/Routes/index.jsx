import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Input, Select, message, Modal, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getRouteList, deleteRoute } from '../../../api/route'
import dayjs from 'dayjs'
import './Routes.css'

const { Search } = Input
const { Option } = Select

// 难度等级映射
const difficultyMap = {
  1: { text: '休闲', color: 'green' },
  2: { text: '简单', color: 'cyan' },
  3: { text: '中等', color: 'blue' },
  4: { text: '困难', color: 'orange' },
  5: { text: '极限', color: 'red' }
}

// 路线状态映射
const statusMap = {
  0: { text: '禁用', color: 'default' },
  1: { text: '正常', color: 'success' }
}

function Routes() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [filters, setFilters] = useState({
    name: '',
    region: '',
    difficultyLevel: null
  })

  useEffect(() => {
    fetchRoutes()
  }, [pagination.current, pagination.pageSize, filters])

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const params = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        ...filters
      }

      const result = await getRouteList(params)
      setRoutes(result.records || [])
      setPagination({
        ...pagination,
        total: result.total || 0
      })
    } catch (error) {
      console.error('获取路线列表失败:', error)
      message.error('获取路线列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (name) => {
    setFilters({ ...filters, name })
    setPagination({ ...pagination, current: 1 })
  }

  const handleDifficultyChange = (value) => {
    setFilters({ ...filters, difficultyLevel: value })
    setPagination({ ...pagination, current: 1 })
  }

  const handleRegionChange = (value) => {
    setFilters({ ...filters, region: value })
    setPagination({ ...pagination, current: 1 })
  }

  const handleCreate = () => {
    navigate('/organizer/route/create')
  }

  const handleEdit = (route) => {
    navigate(`/organizer/route/${route.id}/edit`)
  }

  const handleDelete = async (id) => {
    try {
      await deleteRoute(id)
      message.success('删除成功')
      fetchRoutes()
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败')
    }
  }

  const handleView = (route) => {
    // 查看路线详情
    Modal.info({
      title: route.name,
      width: 600,
      content: (
        <div className="route-detail-modal">
          <p><b>描述：</b>{route.description || '暂无描述'}</p>
          <p><b>地区：</b>{route.region || '未知'}</p>
          <p><b>总里程：</b>{route.totalDistance ? `${route.totalDistance}km` : '未知'}</p>
          <p><b>累计爬升：</b>{route.elevationGain ? `${route.elevationGain}m` : '未知'}</p>
          <p><b>预计用时：</b>{route.estimatedHours ? `${route.estimatedHours}小时` : '未知'}</p>
          <p><b>使用次数：</b>{route.useCount || 0}</p>
          <p><b>创建时间：</b>{dayjs(route.createTime).format('YYYY-MM-DD HH:mm')}</p>
        </div>
      )
    })
  }

  const columns = [
    {
      title: '路线名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <Space>
          <span className="route-name">{text}</span>
        </Space>
      )
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 120
    },
    {
      title: '难度',
      dataIndex: 'difficultyLevel',
      key: 'difficultyLevel',
      width: 100,
      render: (level) => {
        const config = difficultyMap[level] || difficultyMap[1]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '总里程',
      dataIndex: 'totalDistance',
      key: 'totalDistance',
      width: 100,
      render: (distance) => (distance ? `${distance}km` : '-')
    },
    {
      title: '累计爬升',
      dataIndex: 'elevationGain',
      key: 'elevationGain',
      width: 100,
      render: (gain) => (gain ? `${gain}m` : '-')
    },
    {
      title: '预计用时',
      dataIndex: 'estimatedHours',
      key: 'estimatedHours',
      width: 100,
      render: (hours) => (hours ? `${hours}小时` : '-')
    },
    {
      title: '使用次数',
      dataIndex: 'useCount',
      key: 'useCount',
      width: 100,
      render: (count) => <span className="use-count">{count || 0}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = statusMap[status] || statusMap[0]
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条路线吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="routes-page">
      <div className="container">
        <Card
          title="路线管理"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建路线
            </Button>
          }
          className="routes-card"
        >
          {/* 搜索和筛选 */}
          <div className="filters-section">
            <Space size="middle" wrap>
              <Search
                placeholder="搜索路线名称"
                allowClear
                style={{ width: 250 }}
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
              />
              <Select
                placeholder="选择地区"
                allowClear
                style={{ width: 150 }}
                onChange={handleRegionChange}
                value={filters.region || undefined}
              >
                <Option value="北京">北京</Option>
                <Option value="上海">上海</Option>
                <Option value="广州">广州</Option>
                <Option value="深圳">深圳</Option>
                <Option value="杭州">杭州</Option>
                <Option value="成都">成都</Option>
                <Option value="重庆">重庆</Option>
              </Select>
              <Select
                placeholder="选择难度"
                allowClear
                style={{ width: 150 }}
                onChange={handleDifficultyChange}
                value={filters.difficultyLevel || undefined}
              >
                <Option value={1}>休闲</Option>
                <Option value={2}>简单</Option>
                <Option value={3}>中等</Option>
                <Option value={4}>困难</Option>
                <Option value={5}>极限</Option>
              </Select>
              <Button onClick={() => setFilters({ name: '', region: '', difficultyLevel: null })}>
                重置
              </Button>
            </Space>
          </div>

          {/* 路线列表 */}
          <Table
            columns={columns}
            dataSource={routes}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`
            }}
            onChange={(pag) => {
              setPagination({
                ...pagination,
                current: pag.current,
                pageSize: pag.pageSize
              })
            }}
            scroll={{ x: 1400 }}
          />
        </Card>
      </div>
    </div>
  )
}

export default Routes

