import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        extra={
          <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        }
      />
    </div>
  )
}

export default NotFound

