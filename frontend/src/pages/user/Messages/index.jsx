import { Card, List, Tag, Button, Empty, message, Pagination, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyMessages, markMessageAsRead, markAllAsRead } from '../../../api/message'
import './Messages.css'

const MESSAGE_TYPE_MAP = {
  1: { text: '系统通知', color: 'blue' },
  2: { text: '报名通知', color: 'green' },
  3: { text: '活动通知', color: 'orange' },
  4: { text: '预警通知', color: 'red' }
}

function MyMessages() {
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [markingAll, setMarkingAll] = useState(false)
  const navigate = useNavigate()
  const pageSize = 20

  useEffect(() => {
    fetchMessages()
  }, [pageNum])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const result = await getMyMessages({ pageNum, pageSize })
      setMessages(result.records || [])
      setTotal(result.total || 0)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (item) => {
    if (item.isRead === 1) return
    try {
      await markMessageAsRead(item.id)
      setMessages(prev => prev.map(m => m.id === item.id ? { ...m, isRead: 1 } : m))
    } catch (error) {
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await markAllAsRead()
      setMessages(prev => prev.map(m => ({ ...m, isRead: 1 })))
      message.success('已全部标记为已读')
    } catch (error) {
      message.error('操作失败，请重试')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleClickMessage = (item) => {
    handleMarkAsRead(item)
    // 如果关联了活动，跳转到活动详情
    if (item.relatedType === 'activity' && item.relatedId) {
      navigate(`/activities/${item.relatedId}`)
    }
  }

  const unreadCount = messages.filter(m => m.isRead === 0).length

  return (
    <div className="messages-page">
      <div className="container">
        <Card
          title={`我的消息${total > 0 ? ` (${total})` : ''}`}
          className="messages-card"
          extra={
            <Button
              type="primary"
              size="small"
              onClick={handleMarkAllAsRead}
              loading={markingAll}
              disabled={unreadCount === 0}
            >
              全部标记已读
            </Button>
          }
        >
          {loading && messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
          ) : messages.length === 0 ? (
            <Empty description="暂无消息" />
          ) : (
            <>
              <List
                loading={loading}
                dataSource={messages}
                renderItem={(item) => (
                  <List.Item
                    className={`message-item ${item.isRead === 0 ? 'unread' : ''}`}
                    onClick={() => handleClickMessage(item)}
                    style={{ cursor: item.relatedId ? 'pointer' : 'default' }}
                  >
                    <List.Item.Meta
                      title={
                        <div className="message-title">
                          <span>{item.title}</span>
                          <span className="message-tags">
                            {item.messageType && MESSAGE_TYPE_MAP[item.messageType] && (
                              <Tag color={MESSAGE_TYPE_MAP[item.messageType].color}>
                                {MESSAGE_TYPE_MAP[item.messageType].text}
                              </Tag>
                            )}
                            {item.isRead === 0 && <Tag color="red">未读</Tag>}
                          </span>
                        </div>
                      }
                      description={
                        <div className="message-content">
                          <p className="message-preview">{item.content}</p>
                          <span className="message-time">{item.createTime}</span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
              {total > pageSize && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Pagination
                    current={pageNum}
                    total={total}
                    pageSize={pageSize}
                    onChange={setPageNum}
                    showTotal={(t) => `共 ${t} 条消息`}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MyMessages
