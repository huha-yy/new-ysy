import { Component } from 'react'
import { Result, Button } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('错误边界捕获到错误:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryContent error={this.state.error} />
      )
    }

    return this.props.children
  }
}

function ErrorBoundaryContent({ error }) {
  const navigate = useNavigate()

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="error-boundary-page">
      <Result
        status="error"
        title="应用出现错误"
        subTitle={
          <div>
            <p>很抱歉，应用遇到了一些问题。</p>
            {error && (
              <p style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>
                错误信息: {error.message}
              </p>
            )}
          </div>
        }
        extra={[
          <Button key="reload" icon={<ReloadOutlined />} onClick={handleReload}>
            刷新页面
          </Button>,
          <Button key="home" icon={<HomeOutlined />} onClick={handleGoHome}>
            返回首页
          </Button>
        ]}
      />
    </div>
  )
}

export default ErrorBoundary

