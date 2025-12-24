import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Card, Form, Input, InputNumber, Select, DatePicker, Upload, Button, 
  message, Space, Divider, Row, Col, Steps, Switch, Tooltip, Modal
} from 'antd'
import {
  SaveOutlined,
  SendOutlined,
  LeftOutlined,
  PictureOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import { createActivity, updateActivity, getActivityDetail, submitActivity } from '../../../api/activity'
import { DIFFICULTY_MAP } from '../../../utils/constants'
import dayjs from 'dayjs'
import './ActivityForm.css'

const { TextArea } = Input
const { RangePicker } = DatePicker
const { Option } = Select

function ActivityForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [coverImage, setCoverImage] = useState('')
  const [checkpoints, setCheckpoints] = useState([])

  // 加载活动详情（编辑模式）
  useEffect(() => {
    if (isEdit) {
      fetchActivityDetail()
    }
  }, [id])

  const fetchActivityDetail = async () => {
    setLoading(true)
    try {
      const res = await getActivityDetail(id)
      if (res) {
        form.setFieldsValue({
          ...res,
          timeRange: [dayjs(res.startTime), dayjs(res.endTime)],
          registrationDeadline: res.registrationDeadline ? dayjs(res.registrationDeadline) : null
        })
        setCoverImage(res.coverImage || '')
        setCheckpoints(res.checkpoints || [])
      }
    } catch (error) {
      message.error('获取活动信息失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields(['title', 'difficultyLevel'])
      const formData = form.getFieldsValue(true)
      
      const data = {
        ...formData,
        coverImage,
        checkpoints,
        startTime: formData.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: formData.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        registrationDeadline: formData.registrationDeadline?.format('YYYY-MM-DD HH:mm:ss'),
        status: 0 // 草稿状态
      }
      
      setSubmitting(true)
      if (isEdit) {
        await updateActivity(id, data)
        message.success('保存成功')
      } else {
        const res = await createActivity(data)
        message.success('创建成功')
        navigate(`/organizer/activities/${res.id || res}/edit`)
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('请填写必填字段')
      } else {
        message.error('保存失败')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 提交审核
  const handleSubmitForReview = async () => {
    try {
      await form.validateFields()
      const formData = form.getFieldsValue(true)
      
      const data = {
        ...formData,
        coverImage,
        checkpoints,
        startTime: formData.timeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
        endTime: formData.timeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
        registrationDeadline: formData.registrationDeadline?.format('YYYY-MM-DD HH:mm:ss')
      }

      Modal.confirm({
        title: '确认提交审核？',
        content: '提交后将进入管理员审核流程，审核通过后活动将自动发布。',
        okText: '确认提交',
        cancelText: '再检查一下',
        onOk: async () => {
          setSubmitting(true)
          try {
            if (isEdit) {
              await updateActivity(id, data)
              await submitActivity(id)
            } else {
              const res = await createActivity(data)
              await submitActivity(res.id || res)
            }
            message.success('已提交审核，请等待管理员审核')
            navigate('/organizer/activities')
          } catch (error) {
            message.error('提交失败')
          } finally {
            setSubmitting(false)
          }
        }
      })
    } catch (error) {
      message.error('请完善所有必填信息')
    }
  }

  // 图片上传处理
  const handleUploadChange = (info) => {
    if (info.file.status === 'done') {
      setCoverImage(info.file.response?.url || '')
      message.success('上传成功')
    } else if (info.file.status === 'error') {
      message.error('上传失败')
    }
  }

  // 模拟上传（实际项目应对接后端）
  const customUpload = async ({ file, onSuccess }) => {
    // 模拟上传
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file)
      setCoverImage(fakeUrl)
      onSuccess({ url: fakeUrl })
    }, 1000)
  }

  // 添加签到点
  const addCheckpoint = () => {
    setCheckpoints([...checkpoints, {
      id: Date.now(),
      name: '',
      latitude: '',
      longitude: '',
      radius: 50,
      order: checkpoints.length + 1
    }])
  }

  // 更新签到点
  const updateCheckpoint = (index, field, value) => {
    const newCheckpoints = [...checkpoints]
    newCheckpoints[index][field] = value
    setCheckpoints(newCheckpoints)
  }

  // 删除签到点
  const removeCheckpoint = (index) => {
    setCheckpoints(checkpoints.filter((_, i) => i !== index))
  }

  // 步骤配置
  const steps = [
    { title: '基本信息', icon: <FileTextOutlined /> },
    { title: '时间地点', icon: <EnvironmentOutlined /> },
    { title: '报名设置', icon: <TeamOutlined /> },
    { title: '路线签到', icon: <ClockCircleOutlined /> }
  ]

  return (
    <div className="activity-form-page">
      {/* 页面头部 */}
      <div className="form-header">
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={() => navigate('/organizer/activities')}
          className="back-btn"
        >
          返回
        </Button>
        <h1 className="form-title">
          {isEdit ? '编辑活动' : '发布新活动'}
        </h1>
        <Space>
          <Button 
            icon={<SaveOutlined />}
            onClick={handleSaveDraft}
            loading={submitting}
          >
            保存草稿
          </Button>
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmitForReview}
            loading={submitting}
          >
            提交审核
          </Button>
        </Space>
      </div>

      {/* 步骤条 */}
      <div className="steps-wrapper">
        <Steps 
          current={currentStep} 
          items={steps}
          onChange={setCurrentStep}
          className="form-steps"
        />
      </div>

      {/* 表单内容 */}
      <Form
        form={form}
        layout="vertical"
        className="activity-form"
        initialValues={{
          difficultyLevel: 2,
          maxParticipants: 20,
          minParticipants: 5,
          fee: 0,
          requireApproval: true
        }}
      >
        {/* 步骤1：基本信息 */}
        <Card 
          className={`form-card ${currentStep === 0 ? 'active' : ''}`}
          title={
            <span className="card-title">
              <FileTextOutlined /> 基本信息
            </span>
          }
        >
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="活动标题"
                rules={[
                  { required: true, message: '请输入活动标题' },
                  { max: 50, message: '标题最多50个字符' }
                ]}
              >
                <Input 
                  placeholder="请输入一个吸引人的活动标题" 
                  size="large"
                  showCount
                  maxLength={50}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="difficultyLevel"
                label={
                  <span>
                    难度等级
                    <Tooltip title="根据路线长度、海拔、地形等因素综合评估">
                      <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                    </Tooltip>
                  </span>
                }
                rules={[{ required: true, message: '请选择难度等级' }]}
              >
                <Select size="large">
                  {Object.entries(DIFFICULTY_MAP).map(([key, value]) => (
                    <Option key={key} value={parseInt(key)}>{value}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="活动封面"
          >
            <Upload
              listType="picture-card"
              showUploadList={false}
              customRequest={customUpload}
              onChange={handleUploadChange}
              accept="image/*"
              className="cover-upload"
            >
              {coverImage ? (
                <div className="cover-preview">
                  <img src={coverImage} alt="封面" />
                  <div className="cover-overlay">
                    <PictureOutlined /> 更换封面
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <PlusOutlined style={{ fontSize: 32 }} />
                  <div>上传封面图片</div>
                  <div className="upload-hint">建议尺寸 800×450，支持 JPG/PNG</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <TextArea 
              rows={6} 
              placeholder="详细描述活动内容、特色、注意事项等..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="highlights"
                label="活动亮点"
              >
                <TextArea 
                  rows={3} 
                  placeholder="例如：绝美日出、原始森林、高山草甸..."
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requirements"
                label="参与要求"
              >
                <TextArea 
                  rows={3} 
                  placeholder="例如：需有一定徒步经验、无高血压等..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 步骤2：时间地点 */}
        <Card 
          className={`form-card ${currentStep === 1 ? 'active' : ''}`}
          title={
            <span className="card-title">
              <EnvironmentOutlined /> 时间与地点
            </span>
          }
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="timeRange"
                label="活动时间"
                rules={[{ required: true, message: '请选择活动时间' }]}
              >
                <RangePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm"
                  size="large"
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="registrationDeadline"
                label="报名截止时间"
              >
                <DatePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm"
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="选择报名截止时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="startLocation"
                label="集合地点"
                rules={[{ required: true, message: '请输入集合地点' }]}
              >
                <Input 
                  prefix={<EnvironmentOutlined />}
                  placeholder="请输入详细集合地址"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endLocation"
                label="结束地点"
              >
                <Input 
                  prefix={<EnvironmentOutlined />}
                  placeholder="如与集合地点相同可不填"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="totalDistance"
                label="总里程（公里）"
              >
                <InputNumber 
                  min={0} 
                  max={1000} 
                  step={0.1}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="例如：15.5"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="elevationGain"
                label="累计爬升（米）"
              >
                <InputNumber 
                  min={0} 
                  max={10000} 
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="例如：800"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="estimatedDuration"
                label="预计时长（小时）"
              >
                <InputNumber 
                  min={0} 
                  max={72} 
                  step={0.5}
                  size="large"
                  style={{ width: '100%' }}
                  placeholder="例如：6"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 步骤3：报名设置 */}
        <Card 
          className={`form-card ${currentStep === 2 ? 'active' : ''}`}
          title={
            <span className="card-title">
              <TeamOutlined /> 报名设置
            </span>
          }
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="maxParticipants"
                label="人数上限"
                rules={[{ required: true, message: '请设置人数上限' }]}
              >
                <InputNumber 
                  min={1} 
                  max={500} 
                  size="large"
                  style={{ width: '100%' }}
                  addonAfter="人"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="minParticipants"
                label="成行人数"
              >
                <InputNumber 
                  min={1} 
                  max={100} 
                  size="large"
                  style={{ width: '100%' }}
                  addonAfter="人"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fee"
                label={
                  <span>
                    <DollarOutlined /> 活动费用
                  </span>
                }
                rules={[{ required: true, message: '请设置活动费用' }]}
              >
                <InputNumber 
                  min={0} 
                  max={99999} 
                  size="large"
                  style={{ width: '100%' }}
                  addonBefore="¥"
                  placeholder="0 表示免费"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="requireApproval"
                label="报名需审核"
                valuePropName="checked"
              >
                <Switch checkedChildren="需要" unCheckedChildren="不需要" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="feeDescription"
                label="费用说明"
              >
                <TextArea 
                  rows={2} 
                  placeholder="说明费用包含哪些内容，例如：包含交通、保险、午餐..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="equipmentList"
            label="装备清单"
          >
            <TextArea 
              rows={3} 
              placeholder="建议参与者携带的装备，例如：登山鞋、登山杖、头灯、雨衣..."
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="注意事项"
          >
            <TextArea 
              rows={3} 
              placeholder="其他需要提醒参与者的事项..."
            />
          </Form.Item>
        </Card>

        {/* 步骤4：路线签到 */}
        <Card 
          className={`form-card ${currentStep === 3 ? 'active' : ''}`}
          title={
            <span className="card-title">
              <ClockCircleOutlined /> 路线与签到点
            </span>
          }
        >
          <Form.Item
            name="routeDescription"
            label="路线描述"
          >
            <TextArea 
              rows={4} 
              placeholder="描述活动路线、途经景点、休息点等..."
            />
          </Form.Item>

          <Divider>签到点设置（可选）</Divider>

          <div className="checkpoints-section">
            {checkpoints.map((checkpoint, index) => (
              <div key={checkpoint.id} className="checkpoint-item">
                <div className="checkpoint-header">
                  <span className="checkpoint-number">签到点 {index + 1}</span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => removeCheckpoint(index)}
                  />
                </div>
                <Row gutter={16}>
                  <Col span={8}>
                    <Input
                      placeholder="签到点名称"
                      value={checkpoint.name}
                      onChange={e => updateCheckpoint(index, 'name', e.target.value)}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="纬度"
                      value={checkpoint.latitude}
                      onChange={e => updateCheckpoint(index, 'latitude', e.target.value)}
                    />
                  </Col>
                  <Col span={6}>
                    <Input
                      placeholder="经度"
                      value={checkpoint.longitude}
                      onChange={e => updateCheckpoint(index, 'longitude', e.target.value)}
                    />
                  </Col>
                  <Col span={4}>
                    <InputNumber
                      placeholder="半径(米)"
                      value={checkpoint.radius}
                      onChange={value => updateCheckpoint(index, 'radius', value)}
                      min={10}
                      max={500}
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              </div>
            ))}

            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={addCheckpoint}
              className="add-checkpoint-btn"
            >
              添加签到点
            </Button>

            <div className="checkpoint-tip">
              <InfoCircleOutlined /> 
              签到点用于活动进行时的GPS定位签到，参与者到达签到点附近时可进行打卡
            </div>
          </div>
        </Card>

        {/* 底部操作栏 */}
        <div className="form-footer">
          <div className="footer-left">
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                上一步
              </Button>
            )}
          </div>
          <div className="footer-center">
            <span className="step-indicator">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="footer-right">
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                下一步
              </Button>
            ) : (
              <Space>
                <Button onClick={handleSaveDraft} loading={submitting}>
                  保存草稿
                </Button>
                <Button type="primary" onClick={handleSubmitForReview} loading={submitting}>
                  提交审核
                </Button>
              </Space>
            )}
          </div>
        </div>
      </Form>
    </div>
  )
}

export default ActivityForm

