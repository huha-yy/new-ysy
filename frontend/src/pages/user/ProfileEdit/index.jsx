import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Upload, message, Radio, DatePicker, Select, Space, Descriptions, Skeleton } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, ManOutlined, WomanOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../../../api/user'
import { uploadImage } from '../../../api/file'
import { getImageUrl } from '../../../utils/imageUrl'
import { getUser } from '../../../utils/storage'
import dayjs from 'dayjs'
import './ProfileEdit.css'

function ProfileEdit() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [form] = Form.useForm()
  const [avatar, setAvatar] = useState(null)
  const navigate = useNavigate()
  const user = getUser()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setFetchLoading(true)
    try {
      const result = await getProfile()
      form.setFieldsValue({
        nickname: result.nickname || '',
        realName: result.realName || '',
        gender: result.gender,
        birthDate: result.birthDate ? dayjs(result.birthDate) : null,
        phone: result.phone || '',
        email: result.email || '',
        experienceLevel: result.experienceLevel || 1,
        healthStatus: result.healthStatus || '',
        medicalHistory: result.medicalHistory || '',
        emergencyContact: result.emergencyContact || '',
        emergencyPhone: result.emergencyPhone || '',
        equipmentList: result.equipmentList || '',
        preferenceIntensity: result.preferenceIntensity,
        preferenceDistance: result.preferenceDistance,
        preferenceRegion: result.preferenceRegion || '',
        bio: result.bio || ''
      })
      if (result.avatar) {
        setAvatar(result.avatar)
      }
    } catch (error) {
      console.error('获取用户档案失败:', error)
      message.error('获取用户档案失败，请刷新页面重试')
    } finally {
      setFetchLoading(false)
    }
  }

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // 处理日期格式并添加头像URL
      const submitData = {
        ...values,
        avatar,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null
      }
      await updateProfile(submitData)
      message.success('资料更新成功')

      // 更新本地存储的用户信息
      const updatedUser = { ...user, nickname: values.nickname, avatar }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      navigate('/user/profile')
    } catch (error) {
      console.error('更新资料失败:', error)
      // 错误已在 request.js 的响应拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      return
    }
    // 使用真实上传
    try {
      const result = await uploadImage(info.file.originFileObj || info.file)
      setAvatar(result.url)
      message.success('头像上传成功')
    } catch (error) {
      console.error('头像上传失败:', error)
      message.error('头像上传失败')
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
          {fetchLoading ? (
            <Skeleton active paragraph={{ rows: 20 }} />
          ) : (
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
                    <img src={getImageUrl(avatar)} alt="头像" className="avatar-preview" />
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
                name="birthDate"
              >
                <DatePicker
                  placeholder="请选择出生日期"
                  size="large"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current > dayjs().subtract(18, 'year')}
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

              <Form.Item
                label="病史/过敏史"
                name="medicalHistory"
                rules={[
                  { max: 512, message: '病史描述最多512个字符' }
                ]}
              >
                <Input.TextArea
                  placeholder="请描述您的病史、过敏史或其他需要注意的健康问题..."
                  rows={3}
                  maxLength={512}
                  showCount
                />
              </Form.Item>
            </div>

            {/* 常用装备 */}
            <div className="section">
              <h3>🎒 常用装备</h3>
              <Form.Item
                label="装备清单"
                name="equipmentList"
                rules={[
                  { max: 512, message: '装备清单最多512个字符' }
                ]}
              >
                <Input.TextArea
                  placeholder="请列出您常用的徒步装备，如：登山鞋、背包、登山杖、水壶等..."
                  rows={3}
                  maxLength={512}
                  showCount
                />
              </Form.Item>
            </div>

            {/* 徒步偏好 */}
            <div className="section">
              <h3>⚙️ 徒步偏好</h3>
              <Form.Item
                label="偏好强度"
                name="preferenceIntensity"
              >
                <Select
                  placeholder="请选择偏好强度"
                  size="large"
                >
                  <Select.Option value={1}>低强度（休闲徒步）</Select.Option>
                  <Select.Option value={2}>中强度（常规徒步）</Select.Option>
                  <Select.Option value={3}>高强度（挑战徒步）</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="偏好里程"
                name="preferenceDistance"
              >
                <Select
                  placeholder="请选择偏好里程"
                  size="large"
                >
                  <Select.Option value={1}>短途（&lt;10km）</Select.Option>
                  <Select.Option value={2}>中途（10-20km）</Select.Option>
                  <Select.Option value={3}>长途（&gt;20km）</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="偏好地区"
                name="preferenceRegion"
                rules={[
                  { max: 128, message: '偏好地区最多128个字符' }
                ]}
              >
                <Input
                  placeholder="请输入您偏好的徒步地区，多个地区用逗号分隔，如：浙江,江苏,安徽"
                  size="large"
                />
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
          )}
        </Card>
      </div>
    </div>
  )
}

export default ProfileEdit

