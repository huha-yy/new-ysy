import { Card, Tabs, List, Tag, Button, Empty } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyRegistrations } from '../../../api/registration'
import { REGISTRATION_STATUS } from '../../../utils/constants'
import './Registrations.css'

function MyRegistrations() {
  const [loading, setLoading] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const result = await getMyRegistrations({ pageNum: 1, pageSize: 20 })
      setRegistrations(result.records || [])
    } catch (error) {
      console.error('获取报名列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (id) => {
    // TODO: 实现取消报名
    console.log('取消报名:', id)
  }

  const getStatusTag = (status) => {
    const statusMap = {
      [REGISTRATION_STATUS.PENDING]: { text: '待审核', color: 'orange' },
      [REGISTRATION_STATUS.APPROVED]: { text: '已通过', color: 'green' },
      [REGISTRATION_STATUS.REJECTED]: { text: '已拒绝', color: 'red' },
      [REGISTRATION_STATUS.CANCELLED]: { text: '已取消', color: 'default' }
    }
    const config = statusMap[status] || { text: '未知', color: 'default' }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  return (
    <div className="registrations-page">
      <div className="container">
        <Card title="我的报名" className="registrations-card">
          <Tabs
            defaultActiveKey="all"
            items={[
              {
                key: 'all',
                label: '全部',
                children: <RegistrationList registrations={registrations} onCancel={handleCancel} navigate={navigate} />
              },
              {
                key: 'pending',
                label: '待审核',
                children: <RegistrationList registrations={registrations.filter(r => r.status === REGISTRATION_STATUS.PENDING)} onCancel={handleCancel} navigate={navigate} />
              },
              {
                key: 'approved',
                label: '已通过',
                children: <RegistrationList registrations={registrations.filter(r => r.status === REGISTRATION_STATUS.APPROVED)} onCancel={handleCancel} navigate={navigate} />
              }
            ]}
          />
        </Card>
      </div>
    </div>
  )
}

function RegistrationList({ registrations, onCancel, navigate }) {
  if (registrations.length === 0) {
    return <Empty description="暂无报名记录" />
  }

  return (
    <List
      loading={loading}
      dataSource={registrations}
      renderItem={(item) => (
        <List.Item
          actions={item.status === REGISTRATION_STATUS.PENDING ? [
            <Button danger size="small" onClick={() => onCancel(item.id)}>
              取消
            </Button>
          ] : []}
        >
          <List.Item.Meta
            title={
              <div className="registration-title" onClick={() => navigate(`/activities/${item.activityId}`)}>
                {item.activityTitle}
              </div>
            }
            description={
              <div className="registration-info">
                <span>活动日期: {item.activityDate}</span>
                {item.remark && <span>备注: {item.remark}</span>}
              </div>
            }
          />
          <div className="registration-status">
            {getStatusTag(item.status)}
          </div>
        </List.Item>
      )}
    />
  )
}

export default MyRegistrations

