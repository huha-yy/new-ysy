import { useState } from 'react'
import { Card, Form, Input, Button, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../../../api/user'
import { setToken, setUser, setRememberMe, getRememberMe } from '../../../utils/storage'
import WeatherCard from '../../../components/WeatherCard'
import './Login.css'

function Login() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  // 初始化时获取记住我状态
  const remembered = getRememberMe()
  if (remembered) {
    form.setFieldsValue({
      username: remembered.username,
      remember: true
    })
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const result = await login(values)
      message.success('登录成功')
      
      // 存储token和用户信息
      setToken(result.token)
      setUser({
        userId: result.userId,
        username: result.username,
        nickname: result.nickname,
        avatar: result.avatar,
        role: result.role
      })

      // 处理记住我功能
      if (values.remember) {
        setRememberMe({
          username: values.username,
          remember: true
        })
      } else {
        localStorage.removeItem('rememberMe')
      }
      
      // 跳转到之前的页面或首页
      navigate(from, { replace: true })
    } catch (error) {
      // 错误已在 request.js 的响应拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    message.info('忘记密码功能开发中，请联系管理员重置密码')
  }

  return (
    <div className="login-page">
      {/* 天气卡片 */}
      <WeatherCard />

      <Card className="login-card" title="用户登录">
        {/* Logo 和品牌名称 */}
        <div className="login-logo-container">
          <span className="login-logo">🥾</span>
          <h2 className="login-brand-name">徒步者</h2>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          {/* 记住我 & 忘记密码 */}
          <div className="login-options">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <span className="forgot-password" onClick={handleForgotPassword}>
              忘记密码？
            </span>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登录
            </Button>
          </Form.Item>

          <div className="login-footer">
            还没有账号？
            <Button type="link" onClick={() => navigate('/register')}>
              立即注册
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login

