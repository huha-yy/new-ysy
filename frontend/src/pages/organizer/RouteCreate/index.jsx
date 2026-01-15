import { useState, useCallback, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, Steps, message, Space, Alert } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import RouteEditor from '../../../components/MapView/RouteEditor'
import { createRoute } from '../../../api/route'
import './RouteCreate.css'

const { TextArea } = Input
const { Option } = Select

// 步骤定义
const steps = [
  {
    title: '基本信息',
    description: '填写路线基本信息'
  },
  {
    title: '路线规划',
    description: '在地图上绘制路线'
  },
  {
    title: '确认提交',
    description: '确认信息并提交'
  }
]

// 难度等级选项
const difficultyOptions = [
  { value: 1, label: '休闲', desc: '适合所有人群' },
  { value: 2, label: '简单', desc: '适合初学者' },
  { value: 3, label: '中等', desc: '需要一定经验' },
  { value: 4, label: '困难', desc: '需要丰富经验' },
  { value: 5, label: '极限', desc: '需要专业装备和技能' }
]

function RouteCreate() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [routePoints, setRoutePoints] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [waypoints, setWaypoints] = useState([])
  const [startPoint, setStartPoint] = useState(null) // 起点
  const [endPoint, setEndPoint] = useState(null) // 终点
  const [routeData, setRouteData] = useState({
    difficultyLevel: 1,
    isPublic: 1
  })

  // 计算完整路线距离的函数
  const calculateTotalDistance = useCallback((startPt, endPt, routePts) => {
    // 构建完整路径：起点 → 途经点 → 终点
    const fullPath = []
    if (startPt) {
      fullPath.push(startPt)
    }
    if (routePts && routePts.length > 0) {
      fullPath.push(...routePts)
    }
    if (endPt) {
      fullPath.push(endPt)
    }

    // 如果至少有两个点，计算距离
    if (fullPath.length >= 2) {
      const distance = calculateRouteDistance(fullPath)
      const distanceInKm = (distance / 1000).toFixed(2)
      form.setFieldValue('totalDistance', distanceInKm)
      // 同步更新到 routeData 中，供确认页面显示
      setRouteData(prev => ({ ...prev, totalDistance: distanceInKm }))
      console.log('✓ 路线总距离更新:', distanceInKm, 'km')
      return distanceInKm
    }
    return '0.00'
  }, [form])

  // 当关键路线数据变化时自动重算总距离
  useEffect(() => {
    calculateTotalDistance(startPoint, endPoint, routePoints)
  }, [startPoint, endPoint, routePoints, calculateTotalDistance])

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // 验证基本信息
        const values = await form.validateFields()
        setRouteData({ ...routeData, ...values })
      }

      if (currentStep === 1) {
        // 验证路线 - 检查起点和终点是否已设置
        if (!startPoint || !endPoint) {
          message.warning('请先设置起点和终点')
          return
        }
      }

      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error('验证失败:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // 构建提交数据
      const formData = await form.validateFields()

      // 构建 routePoints 数组（起点 + 途经点 + 终点）
      const fullRoutePoints = []
      if (startPoint) {
        fullRoutePoints.push({
          lng: startPoint.lng,
          lat: startPoint.lat
        })
      }
      if (routePoints && routePoints.length > 0) {
        fullRoutePoints.push(...routePoints)
      }
      if (endPoint) {
        fullRoutePoints.push({
          lng: endPoint.lng,
          lat: endPoint.lat
        })
      }

      const submitData = {
        ...routeData,
        ...formData,
        // 直接使用 formData.isPublic（现在是数字类型）
        isPublic: formData.isPublic,
        // 起点信息
        startPointName: startPoint?.name || '起点',
        startLatitude: startPoint?.lat,
        startLongitude: startPoint?.lng,
        // 终点信息
        endPointName: endPoint?.name || '终点',
        endLatitude: endPoint?.lat,
        endLongitude: endPoint?.lng,
        // 完整路线点（起点 + 途经点 + 终点），满足后端 @Size(min = 2) 要求
        routePoints: fullRoutePoints,
        checkpoints: checkpoints.map((cp, index) => ({
          name: cp.name,
          latitude: cp.lat,
          longitude: cp.lng,
          radius: cp.radius,
          sequence: cp.sequence,
          type: cp.type,
          isRequired: cp.isRequired
        })),
        waypoints: waypoints.map((wp, index) => ({
          name: wp.name,
          latitude: wp.lat,
          longitude: wp.lng,
          pointType: wp.pointType,
          sequence: wp.sequence
        }))
      }

      console.log('✓ 提交路线数据：', JSON.stringify(submitData, null, 2))

      const routeId = await createRoute(submitData)
      message.success('路线创建成功！')
      navigate('/organizer/routes')
    } catch (error) {
      console.error('创建路线失败:', error)
      message.error('创建路线失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRouteChange = useCallback((points) => {
    console.log('✓ 路线点更新:', points?.length, '个点')
    setRoutePoints(points)
    // 删除立即调用 updateTotalDistance()，改由 useEffect 自动触发
  }, [])

  const handleCheckpointsChange = useCallback((checkpoints) => {
    setCheckpoints(checkpoints)
  }, [])

  const handleWaypointsChange = useCallback((waypoints) => {
    setWaypoints(waypoints)
  }, [])

  const handleStartPointChange = useCallback((point) => {
    console.log('✓ 起点更新:', point)
    setStartPoint(point)
    // 删除立即调用 updateTotalDistance()，改由 useEffect 自动触发
  }, [])

  const handleEndPointChange = useCallback((point) => {
    console.log('✓ 终点更新:', point)
    setEndPoint(point)
    // 删除立即调用 updateTotalDistance()，改由 useEffect 自动触发
  }, [])

  const calculateRouteDistance = (points) => {
    let totalDistance = 0
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(
        points[i].lat, points[i].lng,
        points[i + 1].lat, points[i + 1].lng
      )
    }
    return totalDistance
  }

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <Alert
              message="提示"
              description="请填写路线的基本信息，下一步将在地图上绘制路线"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                difficultyLevel: 1,
                isPublic: 1,
                totalDistance: '0.00'
              }}
            >
              <Form.Item
                label="路线名称"
                name="name"
                rules={[
                  { required: true, message: '请输入路线名称' },
                  { min: 2, message: '路线名称至少2个字' },
                  { max: 50, message: '路线名称最多50个字' }
                ]}
              >
                <Input placeholder="例如：香山红叶徒步路线" />
              </Form.Item>

              <Form.Item
                label="路线描述"
                name="description"
                rules={[
                  { required: true, message: '请输入路线描述' },
                  { max: 500, message: '路线描述最多500个字' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="描述路线的特色、风景、注意事项等"
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="所属地区"
                name="region"
                rules={[{ required: true, message: '请选择地区' }]}
              >
                <Select placeholder="请选择地区">
                  <Option value="北京">北京</Option>
                  <Option value="上海">上海</Option>
                  <Option value="广州">广州</Option>
                  <Option value="深圳">深圳</Option>
                  <Option value="杭州">杭州</Option>
                  <Option value="成都">成都</Option>
                  <Option value="重庆">重庆</Option>
                  <Option value="西安">西安</Option>
                  <Option value="武汉">武汉</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="难度等级"
                name="difficultyLevel"
                rules={[{ required: true, message: '请选择难度等级' }]}
              >
                <Select placeholder="请选择难度等级">
                  {difficultyOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <span className="difficulty-label">{option.label}</span>
                      <span className="difficulty-separator"> - </span>
                      <span className="difficulty-desc">{option.desc}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="form-row">
                <Form.Item
                  label="预计用时（小时）"
                  name="estimatedHours"
                  rules={[{ required: true, message: '请输入预计用时' }]}
                >
                  <InputNumber
                    min={0.5}
                    max={24}
                    step={0.5}
                    precision={1}
                    placeholder="例如：6"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label="最高海拔（米）"
                  name="maxElevation"
                >
                  <InputNumber
                    min={0}
                    max={8848}
                    placeholder="例如：1500"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <div className="form-row">
                <Form.Item
                  label="累计爬升（米）"
                  name="elevationGain"
                >
                  <InputNumber
                    min={0}
                    max={5000}
                    placeholder="例如：800"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  label="累计下降（米）"
                  name="elevationLoss"
                >
                  <InputNumber
                    min={0}
                    max={5000}
                    placeholder="例如：750"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="是否公开"
                name="isPublic"
              >
                <Select>
                  <Option value={1}>公开（所有人可见）</Option>
                  <Option value={0}>私有（仅自己可见）</Option>
                </Select>
              </Form.Item>

              {/* 隐藏的总里程字段，用于表单管理 */}
              <Form.Item
                name="totalDistance"
                hidden
              >
                <Input />
              </Form.Item>
            </Form>
          </div>
        )

      case 1:
        return (
          <div className="step-content">
            <Alert
              message="路线规划"
              description="请先设置起点和终点，然后可以添加途经点、签到点绘制完整路线。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <RouteEditor
              onRouteChange={handleRouteChange}
              onCheckpointsChange={handleCheckpointsChange}
              onWaypointsChange={handleWaypointsChange}
              onStartPointChange={handleStartPointChange}
              onEndPointChange={handleEndPointChange}
            />
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <Alert
              message="确认信息"
              description="请仔细核对路线信息，确认无误后点击提交"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <div className="confirm-content">
              <div className="confirm-section">
                <h3>基本信息</h3>
                <div className="confirm-grid">
                  <div className="confirm-item">
                    <label>路线名称：</label>
                    <span>{routeData.name}</span>
                  </div>
                  <div className="confirm-item">
                    <label>所属地区：</label>
                    <span>{routeData.region}</span>
                  </div>
                  <div className="confirm-item">
                    <label>难度等级：</label>
                    <span>{difficultyOptions.find(d => d.value === routeData.difficultyLevel)?.label}</span>
                  </div>
                  <div className="confirm-item">
                    <label>预计用时：</label>
                    <span>{routeData.estimatedHours}小时</span>
                  </div>
                  <div className="confirm-item">
                    <label>最高海拔：</label>
                    <span>{routeData.maxElevation || '-'}米</span>
                  </div>
                  <div className="confirm-item">
                    <label>累计爬升：</label>
                    <span>{routeData.elevationGain || '-'}米</span>
                  </div>
                </div>
                <div className="confirm-description">
                  <label>路线描述：</label>
                  <p>{routeData.description}</p>
                </div>
              </div>

              <div className="confirm-section">
                <h3>路线信息</h3>
                {/* 起点和终点显示 */}
                {(startPoint || endPoint) && (
                  <div className="route-stats">
                    {startPoint && (
                      <div className="stat-item">
                        <EnvironmentOutlined />
                        <span>起点：<b>{startPoint.name}</b> ({startPoint.lng?.toFixed(4)}, {startPoint.lat?.toFixed(4)})</span>
                      </div>
                    )}
                    {endPoint && (
                      <div className="stat-item">
                        <EnvironmentOutlined />
                        <span>终点：<b>{endPoint.name}</b> ({endPoint.lng?.toFixed(4)}, {endPoint.lat?.toFixed(4)})</span>
                      </div>
                    )}
                  </div>
                )}
                {/* 统计信息 */}
                <div className="route-stats">
                  <div className="stat-item">
                    <EnvironmentOutlined />
                    <span>路线点数：<b>{routePoints.length}</b></span>
                  </div>
                  <div className="stat-item">
                    <span>签到点数：<b>{checkpoints.length}</b></span>
                  </div>
                  <div className="stat-item">
                    <span>途经点数：<b>{waypoints.length}</b></span>
                  </div>
                  <div className="stat-item">
                    <span>总里程：<b>{routeData.totalDistance}km</b></span>
                  </div>
                </div>
              </div>

              {checkpoints.length > 0 && (
                <div className="confirm-section">
                  <h3>签到点列表</h3>
                  <div className="checkpoints-confirm">
                    {checkpoints.map((cp, index) => (
                      <div key={index} className="checkpoint-confirm-item">
                        <span className="checkpoint-seq">序号{cp.sequence}</span>
                        <span className="checkpoint-name">{cp.name}</span>
                        <span className="checkpoint-radius">半径{cp.radius}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="route-create-page">
      <div className="container">
        <Card
          title="创建路线"
          extra={
            <Button
              onClick={() => navigate('/organizer/routes')}
              icon={<ArrowLeftOutlined />}
            >
              返回
            </Button>
          }
          className="create-card"
        >
          <Steps current={currentStep} className="steps-nav">
            {steps.map((step, index) => (
              <Steps.Step
                key={index}
                title={step.title}
                description={step.description}
              />
            ))}
          </Steps>

          {renderStepContent()}

          <div className="step-actions">
            <Space>
              {currentStep > 0 && (
                <Button onClick={handlePrev}>
                  上一步
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  下一步
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  提交
                </Button>
              )}
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RouteCreate

