import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Rate, Input, Button, Upload, Switch, message, Modal, Space, Avatar, Checkbox, Divider, Descriptions, Tag, Badge, Spin, Tabs } from 'antd'
import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  StarOutlined,
  SettingOutlined,
  LoadingOutlined,
  PictureOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { getActivityDetail, registerActivity } from '../../../api/activity'
import { getActivityRegistrations, cancelRegistration } from '../../../api/registration'
import { DIFFICULTY_MAP, REGISTRATION_STATUS } from '../../../utils/constants'
import { getImageUrl } from '../../../utils/imageUrl'
import './Detail.css'

function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [activity, setActivity] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  
  // 报名弹窗相关状态
  const [registerVisible, setRegisterVisible] = useState(false)
  const [registerForm] = Form.useForm()
  const [registerLoading, setRegisterLoading] = useState(false)
  
  // 报名记录状态
  const [myRegistration, setMyRegistration] = useState(null)

  useEffect(() => {
    fetchActivityDetail()
  }, [id])
  
  useEffect(() => {
    if (activity) {
      fetchMyRegistration()
    }
  }, [activity])

  const fetchActivityDetail = async () => {
    setLoading(true)
    setImageLoading(true)
    setImageError(false)
    try {
      const result = await getActivityDetail(id)
      setActivity(result)
    } catch (error) {
      console.error('获取活动详情失败:', error)
      message.error('获取活动详情失败')
    } finally {
      setLoading(false)
      setTimeout(() => {
        setImageLoading(false)
        setImageError(false)
      }, 500)
    }
  }

  // 查询用户报名记录
  const fetchMyRegistration = async () => {
    if (!activity) return
    
    try {
      const result = await getActivityRegistrations(id, {
        pageNum: 1,
        pageSize: 100
      })
      
      // 找到当前用户的报名记录
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const myReg = result.records?.find(r => r.userId === currentUser.id)
      setMyRegistration(myReg || null)
    } catch (error) {
      console.error('查询报名记录失败:', error)
      setMyRegistration(null)
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  // 打开报名弹窗
  const handleRegister = () => {
    if (!activity) return

    // 如果已经报名，不显示报名弹窗
    if (myRegistration) {
      message.info('您已经报名该活动')
      return
    }

    // 检查活动状态
    if (activity.status !== 2 && activity.status !== 3) {
      message.warning('该活动尚未开始报名，敬请期待')
      return
    }

    // 检查是否已满员
    if (activity.isFull) {
      message.warning('该活动已满员')
      return
    }

    // 打开报名弹窗
    setRegisterVisible(true)
    registerForm.resetFields()
    registerForm.setFieldsValue({
      remark: '',
      emergencyContact: '',
      emergencyPhone: '',
      equipmentConfirm: false,
      healthConfirm: false
    })
  }

  // 处理表单提交
  const handleConfirmRegister = async (values) => {
    if (!activity) return

    // 验证必填字段
    if (!values.emergencyContact || !values.emergencyContact.trim()) {
      message.error('请填写紧急联系人')
      return
    }
    if (!values.emergencyPhone || !values.emergencyPhone.trim()) {
      message.error('请填写紧急联系电话')
      return
    }

    // 验证手机号格式
    if (values.emergencyPhone && !/^1[3-9]\d{9}$/.test(values.emergencyPhone.trim())) {
      message.error('请输入正确的手机号')
      return
    }

    setRegisterLoading(true)
    
    try {
      await registerActivity(id, {
        remark: values.remark || '',
        emergencyContact: values.emergencyContact,
        emergencyPhone: values.emergencyPhone,
        equipmentConfirm: values.equipmentConfirm || false,
        healthConfirm: values.healthConfirm || false
      })
      
      message.success('报名申请已提交，等待审核！即将跳转到我的报名列表')
      setRegisterVisible(false)
      registerForm.resetFields()
      
      // 延迟跳转
      setTimeout(() => {
        navigate('/user/registrations')
      }, 1500)
    } catch (error) {
      console.error('报名失败:', error)
      setRegisterLoading(false)
      message.error(error.response?.data?.message || '报名失败，请重试')
    }
  }

  // 关闭报名弹窗
  const handleRegisterCancel = () => {
    setRegisterVisible(false)
    registerForm.resetFields()
  }

  // 取消报名
  const handleCancelRegistration = () => {
    if (!myRegistration) return

    Modal.confirm({
      title: '确认取消报名?',
      content: '取消后需要重新报名才能参加该活动',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '再想想',
      onOk: async () => {
        try {
          await cancelRegistration(myRegistration.id)
          message.success('取消报名成功')
          fetchMyRegistration() // 重新获取报名状态
        } catch (error) {
          console.error('取消报名失败:', error)
          message.error(error.response?.data?.message || '取消报名失败')
        }
      }
    })
  }

  const handleGathering = () => {
    window.location.href = `/activities/${id}/gathering`
  }

  const handleReview = () => {
    window.location.href = `/activities/${id}/review`
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="empty-state">
        活动不存在或已被删除
      </div>
    )
  }

  return (
    <div className="activity-detail-page">
      <div className="container">
        {/* 活动封面 */}
        <div className="activity-cover">
          {imageLoading && (
            <div className="image-loading-overlay">
              <Spin size="large" />
            </div>
          )}
          {imageError && (
            <div className="image-error-overlay">
              <PictureOutlined />
              <span>图片加载失败</span>
            </div>
          )}
          {activity.coverImage ? (
            <img
              src={getImageUrl(activity.coverImage)}
              alt={activity.title}
              className={`cover-image ${imageLoading ? 'loading' : ''} ${imageError ? 'error' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className="cover-placeholder">
              <PictureOutlined />
              <span>暂无封面图片</span>
            </div>
          )}
        </div>

        {/* 活动标题和基本信息 */}
        <div className="activity-header">
          <h1 className="activity-title">{activity.title}</h1>
          <Space className="activity-tags" size="middle">
            <Tag color={getDifficultyColor(activity.difficultyLevel)}>
              {activity.difficultyText}
            </Tag>
            <Tag icon={<CalendarOutlined />}>
              {activity.activityDate}
            </Tag>
            <Tag icon={<TeamOutlined />}>
              <Badge count={activity.currentParticipants} showZero>
                {activity.currentParticipants}/{activity.maxParticipants}人
              </Badge>
            </Tag>
            {activity.registrationDeadline && (
              <Tag icon={<ClockCircleOutlined />} color="blue">
                报名截止: {activity.registrationDeadline}
              </Tag>
            )}
          </Space>
        </div>

        {/* 活动详细描述 */}
        <Descriptions bordered column={1} className="activity-description">
          <Descriptions.Item label="活动描述">
            <div className="description-content">
              {activity.description}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="预计时长">
            {activity.durationHours}小时
          </Descriptions.Item>
          <Descriptions.Item label="费用">
            <div>
              ¥{activity.fee}
              {activity.fee > 0 && <span className="fee-note">（{activity.feeDescription}）</span>}
            </div>
          </Descriptions.Item>
          {activity.registrationDeadline && (
            <Descriptions.Item label="报名截止时间">
              <Tag icon={<ClockCircleOutlined />} color="blue">
                {activity.registrationDeadline}
              </Tag>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="活动状态">
            <div>
              <Tag color={getStatusColor(activity.status)}>
                {activity.statusText}
              </Tag>
              {activity.status === 4 && (
                <span className="status-note">已结束活动可以评价</span>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>

        {/* 组织者信息 */}
        <Card className="organizer-card" title={<><UserOutlined /> 组织者信息</>}>
          <Space size="large" align="center">
            {activity.organizerAvatar && (
              <Avatar src={activity.organizerAvatar} size={64} className="organizer-avatar" />
            )}
            <div className="organizer-details">
              <div className="organizer-name">{activity.organizerNickname}</div>
              <div className="organizer-role">
                {activity.organizerRole === 1 ? '组织者' : activity.organizerRole === 2 ? '管理员' : '用户'}
              </div>
            </div>
          </Space>
        </Card>

        {/* 路线信息 */}
        <Card 
          title={<><EnvironmentOutlined /> 路线信息</>}
          extra={
            activity.routeDifficultyLevel >= 3 && (
              <Tag color="orange" icon={<CheckCircleOutlined />}>
                需准备完整装备
              </Tag>
            )
          }
        >
          <Descriptions bordered column={2} className="route-info">
            <Descriptions.Item label="路线名称">
              {activity.routeName}
            </Descriptions.Item>
            <Descriptions.Item label="所属地区">
              {activity.routeRegion}
            </Descriptions.Item>
            <Descriptions.Item label="总里程">
              {activity.routeTotalDistance}公里
            </Descriptions.Item>
            <Descriptions.Item label="累计爬升">
              {activity.routeElevationGain}米
            </Descriptions.Item>
            <Descriptions.Item label="累计下降">
              {activity.routeElevationLoss}米
            </Descriptions.Item>
            <Descriptions.Item label="最高海拔">
              {activity.routeMaxElevation}米
            </Descriptions.Item>
            <Descriptions.Item label="最低海拔">
              {activity.routeMinElevation}米
            </Descriptions.Item>
            <Descriptions.Item label="预计用时">
              {activity.routeEstimatedHours}小时
            </Descriptions.Item>
            <Descriptions.Item label="难度">
              <Tag color={getDifficultyColor(activity.routeDifficultyLevel)}>
                {activity.routeDifficultyText}
              </Tag>
              <span className="route-note">
                {getRouteDifficultyNote(activity.routeDifficultyLevel)}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 装备要求 */}
        <Card title={<><SettingOutlined /> 装备要求</>}>
          <div className="equipment-content">
            <pre className="equipment-text">
              {activity.equipmentRequirement || '无特殊装备要求'}
            </pre>
          </div>
        </Card>

        {/* 体能要求 */}
        <Card title={<><TeamOutlined /> 体能要求</>}>
          <div className="fitness-content">
            {activity.fitnessRequirement || '无特殊体能要求，适合大多数人参加'}
          </div>
        </Card>

        {/* Tab 内容 */}
        <Card className="tabs-card">
          <Tabs
            defaultActiveKey="detail"
            className="activity-tabs"
            items={[
              {
                key: 'reviews',
                label: '活动评价',
                children: (
                  <div className="tab-content reviews-content">
                    {activity.status === 4 ? (
                      <div className="review-action">
                        <Button 
                          type="primary" 
                          size="large" 
                          icon={<StarOutlined />}
                          onClick={handleReview}
                        >
                          <StarOutlined /> 评价
                        </Button>
                        <div className="review-tip">
                          活动已结束，期待您的精彩评价！
                        </div>
                      </div>
                    ) : (
                      <div className="review-awaiting">
                        <CloseCircleOutlined />
                        <span>活动结束后方可评价</span>
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'gathering',
                label: '集合信息',
                children: (
                  <div className="tab-content gathering-content">
                    <Button 
                      type="default" 
                      size="large" 
                      icon={<SettingOutlined />}
                      onClick={handleGathering}
                    >
                      查看集合方案
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </Card>

        {/* 底部操作栏 */}
        <div className="activity-footer">
          <div className="organizer-info">
            {activity.organizerAvatar && (
              <img src={activity.organizerAvatar} alt="" className="organizer-avatar" />
            )}
            <div className="organizer-name">
              {activity.organizerNickname}
            </div>
          </div>
          <Space size="middle" className="footer-actions">
            <Button 
              size="large"
              onClick={handleGathering}
              icon={<SettingOutlined />}
              key="gathering"
            >
              集合信息
            </Button>
            {activity.status === 4 && (
              <Button
                size="large"
                onClick={handleReview}
                icon={<StarOutlined />}
                key="review"
              >
                活动评价
              </Button>
            )}
            {myRegistration ? (
              // 已报名，显示取消报名按钮
              <Button
                danger
                size="large"
                onClick={handleCancelRegistration}
                icon={<CloseOutlined />}
                key="cancel"
              >
                取消报名
              </Button>
            ) : (
              // 未报名，显示立即报名按钮
              <Button
                type="primary"
                size="large"
                onClick={handleRegister}
                disabled={activity.isFull || ![2, 3].includes(activity.status)}
                loading={registerLoading}
                key="register"
              >
                {activity.isFull ? '已报满' : '立即报名'}
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* 报名弹窗 */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            <span>活动报名</span>
          </Space>
        }
        open={registerVisible}
        onCancel={handleRegisterCancel}
        footer={[
          <Button onClick={handleRegisterCancel}>
            取消
          </Button>,
          <Button 
            type="primary" 
            onClick={() => registerForm.submit()}
            loading={registerLoading}
          >
            确认报名
          </Button>
        ]}
        width={600}
      >
        <div className="register-modal">
          {/* 活动简要信息 */}
          <div className="register-activity-info">
            <div className="register-activity-title">{activity.title}</div>
            <div className="register-activity-meta">
              <Space size="middle">
                <Tag icon={<CalendarOutlined />}>{activity.activityDate}</Tag>
                <Tag icon={<EnvironmentOutlined />}>{activity.routeName}</Tag>
                <Tag color={getDifficultyColor(activity.difficultyLevel)}>
                  {activity.difficultyText}
                </Tag>
                {activity.registrationDeadline && (
                  <Tag icon={<ClockCircleOutlined />} color="blue">
                    报名截止: {activity.registrationDeadline}
                  </Tag>
                )}
              </Space>
            </div>
          </div>

          <Divider />

          {/* 报名表单 */}
          <Form
            form={registerForm}
            layout="vertical"
            onFinish={handleConfirmRegister}
          >
            <Form.Item
              label="报名备注"
              name="remark"
              help="选填，可填写您对活动的要求或特殊需求"
            >
              <Input.TextArea
                placeholder="请输入备注信息..."
                rows={3}
                maxLength={256}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="紧急联系人"
              name="emergencyContact"
              rules={[
                { required: true, message: '请填写紧急联系人' },
                { max: 50, message: '联系人姓名不能超过50个字' }
              ]}
              help="活动中紧急情况时的联系人"
            >
              <Input 
                placeholder="请输入联系人姓名"
                prefix={<UserOutlined />}
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              label="紧急联系电话"
              name="emergencyPhone"
              rules={[
                { required: true, message: '请填写紧急联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                { max: 11, message: '手机号不能超过11位' }
              ]}
              help="活动中的紧急联系电话"
            >
              <Input
                placeholder="请输入手机号码"
                prefix={<PhoneOutlined />}
                maxLength={11}
              />
            </Form.Item>

            <Divider>装备与健康确认</Divider>

            <Form.Item
              name="equipmentConfirm"
              valuePropName="checked"
            >
              <Checkbox>
                我已准备好以下装备：
                {activity.equipmentRequirement || '无特殊装备要求'}
              </Checkbox>
            </Form.Item>

            <Form.Item
              name="healthConfirm"
              valuePropName="checked"
            >
              <Checkbox>
                我的健康状况良好，适合参加此强度的活动
              </Checkbox>
            </Form.Item>

          </Form>

          {/* 报名须知 */}
          <div className="register-notice">
            <Space direction="vertical" size="small" className="notice-space">
              <div className="notice-item">
                <Tag color="blue">须知</Tag>
                <span>报名成功后，请准时到达集合地点</span>
              </div>
              <div className="notice-item">
                <Tag color="orange">提醒</Tag>
                <span>请携带活动要求的装备，确保安全</span>
              </div>
              <div className="notice-item">
                <Tag color="red">注意</Tag>
                <span>如有疑问，请提前联系活动组织者</span>
              </div>
            </Space>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// 获取难度对应的颜色
const getDifficultyColor = (level) => {
  const colors = {
    1: 'green',
    2: 'blue',
    3: 'orange',
    4: 'red',
    5: 'magenta'
  }
  return colors[level] || 'default'
}

// 获取状态对应的颜色
const getStatusColor = (status) => {
  const colors = {
    0: 'default',
    1: 'orange',
    2: 'green',
    3: 'blue',
    4: 'default',
    5: 'red',
    6: 'red'
  }
  return colors[status] || 'default'
}

// 获取路线难度说明
const getRouteDifficultyNote = (level) => {
  const notes = {
    1: '适合初学者，路线平坦',
    2: '需要一定体能，适合有经验的人',
    3: '需要较好体能，可能有挑战',
    4: '需要强健的体能和丰富的户外经验',
    5: '极限挑战，仅适合专业户外爱好者'
  }
  return notes[level] || ''
}

export default ActivityDetail
