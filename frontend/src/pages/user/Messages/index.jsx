import { Card, List, Tag, Button, Empty } from 'antd'
import { useEffect, useState } from 'react'
import { getMyMessages } from '../../../api/message'
import './Messages.css'

function MyMessages() {
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const result = await getMyMessages({ pageNum: 1, pageSize: 20 })
      setMessages(result.records || [])
    } catch (error) {
      console.error('获取消息列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="messages-page">
      <div className="container">
        <Card
          title="我的消息"
          className="messages-card"
          extra={
            <Button type="primary" size="small">
              全部标记已读
            </Button>
          }
        >
          {messages.length === 0 ? (
            <Empty description="暂无消息" />
          ) : (
            <List
              loading={loading}
              dataSource={messages}
              renderItem={(item) => (
                <List.Item className={`message-item ${!item.read ? 'unread' : ''}`}>
                  <List.Item.Meta
                    title={
                      <div className="message-title">
                        {item.title}
                        {!item.read && <Tag color="red">未读</Tag>}
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
          )}
        </Card>
      </div>
    </div>
  )
}

export default MyMessages

