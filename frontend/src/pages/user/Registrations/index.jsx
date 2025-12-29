import { Card, Tabs, List, Tag, Button, Empty, Modal, message } from 'antd'
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

  const handleCancel = async (id) => {
    Modal.confirm({
      title: '确认取消报名?',
      content: '取消后需要重新报名才能参加该活动',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '再想想',
      onOk: async () => {
        try {
          const { cancelRegistration } = await import('../../../api/registration')
          await cancelRegistration(id)
          message.success('取消报名成功')
          fetchRegistrations()
        } catch (error) {
          console.error('取消报名失败:', error)
          message.error(error.response?.data?.message || '取消报名失败')
        }
      }
    })
  }

  const getStatusTag = (status) => {
    const statusMap = {
      [REGISTRATION_STATUS.PENDING]: { text: '待审核', color: 'orange' },
      [REGISTRATION_STATUS.APPROVED]: { text: '已通过', color: 'green' },
      [REGISTRATION_STATUS.REJECTED]: { text: '已拒绝', color: 'red' },
      [REGISTRATION_STATUS.WAITING]: { text: '候补中', color: 'warning' },
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
                children: <RegistrationList registrations={registrations} loading={loading} getStatusTag={getStatusTag} onCancel={handleCancel} navigate={navigate} />
              },
              {
                key: 'pending',
                label: '待审核',
                children: <RegistrationList registrations={registrations.filter(r => r.status === REGISTRATION_STATUS.PENDING)} loading={loading} getStatusTag={getStatusTag} onCancel={handleCancel} navigate={navigate} />
              },
              {
                key: 'approved',
                label: '已通过',
                children: <RegistrationList registrations={registrations.filter(r => r.status === REGISTRATION_STATUS.APPROVED)} loading={loading} getStatusTag={getStatusTag} onCancel={handleCancel} navigate={navigate} />
              },
              {
                key: 'waiting',
                label: '候补中',
                children: <RegistrationList registrations={registrations.filter(r => r.status === REGISTRATION_STATUS.WAITING)} loading={loading} getStatusTag={getStatusTag} onCancel={handleCancel} navigate={navigate} />
              }
            ]}
          />
        </Card>
      </div>
    </div>
  )
}

function RegistrationList({ registrations, loading, getStatusTag, onCancel, navigate }) {
  if (registrations.length === 0) {
    return <Empty description="暂无报名记录" />
  }

  return (
    <List
      loading={loading}
      dataSource={registrations}
      renderItem={(item) => {
        // 可取消的状态：待审核、已通过、候补中
        const canCancel = [
          REGISTRATION_STATUS.PENDING,
          REGISTRATION_STATUS.APPROVED,
          REGISTRATION_STATUS.WAITING
        ].includes(item.status)

        return (
          <List.Item
            actions={canCancel ? [
              <Button 
                danger 
                size="small" 
                onClick={() => onCancel(item.id)}
              >
                取消报名
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
          /        >
          <div className="registration-status">
            {getStatusTag(item.status)}
          </div>
        </List.Item>
        )
      }}
    />
  )
}

export default MyRegistrations

