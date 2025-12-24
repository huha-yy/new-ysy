import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Upload, message, Radio, DatePicker, Select, Space, Descriptions } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, ManOutlined, WomanOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../../../api/user'
import { getUser } from '../../../utils/storage'
import dayjs from 'dayjs'
import './ProfileEdit.css'

function ProfileEdit() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [avatar, setAvatar] = useState(null)
  const navigate = useNavigate()
  const user = getUser()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const result = await getProfile()
      form.setFieldsValue({
        nickname: result.nickname || '',
        realName: result.realName || '',
        gender: result.gender || '',
        birthday: result.birthday || null,
        phone: result.phone || '',
        email: result.email || '',
        experienceLevel: result.experienceLevel || 1,
        healthStatus: result.healthStatus || '',
        emergencyContact: result.emergencyContact || '',
        emergencyPhone: result.emergencyPhone || '',
        bio: result.bio || ''
      })
      if (result.avatar) {
        setAvatar(result.avatar)
      }
    } catch (error) {
      console.error('获取用户档案失败:', error)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await updateProfile(values)
      message.success('资料更新成功')
      
      // 更新本地存储的用户信息
      const updatedUser = { ...user, ...values }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      navigate('/user/profile')
    } catch (error) {
      console.error('更新资料失败:', error)
      // 错误已在 request.js 的响应拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      const reader = new FileReader()
      reader.readAsDataURL(info.file, (base64) => {
        setAvatar(base64)
      })
    }
  }

  const handleBack = () => {
    navigate('/user/profile')
  }

  return (
    <div className="profile-edit-page">
      <div className="container">
        <Card
          title="编辑资料"
          className="profile-edit-card"
          extra={
            <Button onClick={handleBack} icon={<UserOutlined />}>
              返回
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
          >
            {/* 头像上传 */}
            <div className="avatar-section">
              <h3>👤 头像</h3>
              <Form.Item label="头像上传" className="avatar-item">
                <Upload
                  name="avatar"
                  listType="picture"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleAvatarChange}
                  className="avatar-upload"
                >
                  {avatar ? (
                    <img src={avatar} alt="头像" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <UploadOutlined className="avatar-icon" />
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>

            {/* 基本信息 */}
            <div className="section">
              <h3>📝 基本信息</h3>
              <Form.Item
                label="昵称"
                name="nickname"
                rules={[
                  { required: true, message: '请输入昵称' },
                  { max: 20, message: '昵称最多20个字符' }
                ]}
              >
                <Input 
                  placeholder="请输入昵称" 
                  prefix={<UserOutlined />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="真实姓名"
                name="realName"
                rules={[
                  { max: 20, message: '真实姓名最多20个字符' }
                ]}
              >
                <Input 
                  placeholder="请输入真实姓名" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="性别"
                name="gender"
              >
                <Radio.Group>
                  <Radio value={0}><ManOutlined /> 男</Radio>
                  <Radio value={1}><WomanOutlined /> 女</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="出生日期"
                name="birthday"
              >
                <DatePicker 
                  placeholder="请选择出生日期"
                  size="large"
                  style={{ width: '100%' }}
                  disabledDate={dayjs().subtract(18, 'year')}
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>
            </div>

            {/* 联系方式 */}
            <div className="section">
              <h3>📱 联系方式</h3>
              <Form.Item
                label="手机号"
                name="phone"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input 
                  placeholder="请输入手机号"
                  prefix={<PhoneOutlined />}
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱地址' }
                ]}
              >
                <Input 
                  placeholder="请输入邮箱"
                  prefix={<MailOutlined />}
                  size="large"
                />
              </Form.Item>
            </div>

            {/* 徒步经验 */}
            <div className="section">
              <h3>🏔️ 徒步经验</h3>
              <Form.Item
                label="经验等级"
                name="experienceLevel"
              >
                <Select 
                  placeholder="请选择经验等级"
                  size="large"
                  suffixIcon={<ManOutlined />}
                >
                  <Select.Option value={1}>初级（1-10km）</Select.Option>
                  <Select.Option value={2}>中级（10-20km）</Select.Option>
                  <Select.Option value={3}>高级（20-30km）</Select.Option>
                  <Select.Option value={4}>专家（30km+）</Select.Option>
                </Select>
              </Form.Item>
            </div>

            {/* 健康状况 */}
            <div className="section">
              <h3>❤️ 健康状况</h3>
              <Form.Item
                label="健康状况"
                name="healthStatus"
                rules={[
                  { required: true, message: '请选择健康状况' }
                ]}
              >
                <Select 
                  placeholder="请选择健康状况"
                  size="large"
                >
                  <Select.Option value="良好">良好</Select.Option>
                  <Select.Option value="一般">一般</Select.Option>
                  <Select.Option value="较差">较差</Select.Option>
                  <Select.Option value="有疾病史">有疾病史</Select.Option>
                </Select>
              </Form.Item>
            </div>

            {/* 紧急联系人 */}
            <div className="section">
              <h3>🚑 紧急联系人</h3>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  label="联系人姓名"
                  name="emergencyContact"
                  rules={[
                    { required: true, message: '请输入紧急联系人姓名' },
                    { max: 20, message: '姓名最多20个字符' }
                  ]}
                >
                  <Input 
                    placeholder="请输入联系人姓名" 
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="关系"
                  name="emergencyRelation"
                  rules={[
                    { required: true, message: '请选择关系' }
                  ]}
                >
                  <Select placeholder="请选择关系" size="large">
                    <Select.Option value="家人">家人</Select.Option>
                    <Select.Option value="朋友">朋友</Select.Option>
                    <Select.Option value="同事">同事</Select.Option>
                    <Select.Option value="其他">其他</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            </div>

            <div className="section">
              <h3>📞 紧急联系电话</h3>
              <Form.Item
                label="联系电话"
                name="emergencyPhone"
                rules={[
                  { required: true, message: '请输入紧急联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input 
                  placeholder="请输入紧急联系电话" 
                  prefix={<PhoneOutlined />}
                  size="large"
                />
              </Form.Item>
            </div>

            {/* 个人简介 */}
            <div className="section">
              <h3>💬 个人简介</h3>
              <Form.Item
                label="个人简介"
                name="bio"
                rules={[
                  { max: 500, message: '个人简介最多500个字符' }
                ]}
              >
                <Input.TextArea
                  placeholder="请输入个人简介，介绍你的徒步经历和兴趣..."
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </div>

            {/* 当前信息展示 */}
            <div className="current-info">
              <h3>📊 当前信息</h3>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="当前昵称">
                  {user?.nickname || '未设置'}
                </Descriptions.Item>
                <Descriptions.Item label="当前手机">
                  {user?.phone || '未设置'}
                </Descriptions.Item>
                <Descriptions.Item label="当前邮箱">
                  {user?.email || '未设置'}
                </Descriptions.Item>
                <Descriptions.Item label="最后更新">
                  {user?.updateTime || '未更新'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Form.Item className="submit-section">
              <Space size="large">
                <Button 
                  size="large"
                  onClick={handleBack}
                  icon={<UserOutlined />}
                >
                  取消
                </Button>
                <Button 
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<UploadOutlined />}
                >
                  保存
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default ProfileEdit

