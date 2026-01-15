import { useState, useCallback, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, Steps, message, Space, Alert } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import RouteEditor from '../../../components/MapView/RouteEditor'
import { getRouteDetail, updateRoute } from '../../../api/route'
import './RouteEdit.css'

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

function RouteEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [routePoints, setRoutePoints] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [waypoints, setWaypoints] = useState([])
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)
  const [routeData, setRouteData] = useState({
    difficultyLevel: 1,
    isPublic: true
  })

  // 加载路线数据
  useEffect(() => {
    fetchRouteData()
  }, [id])

  const fetchRouteData = async () => {
    try {
      setFetching(true)
      const data = await getRouteDetail(id)

      console.log('🔍 获取到的路线数据：', data)

      // 设置表单数据
      const formData = {
        name: data.name,
        description: data.description,
        region: data.region,
        difficultyLevel: data.difficultyLevel,
        estimatedHours: data.estimatedHours,
        maxElevation: data.maxElevation,
        elevationGain: data.elevationGain,
        elevationLoss: data.elevationLoss,
        isPublic: data.isPublic,
        totalDistance: data.totalDistance
      }
      form.setFieldsValue(formData)

      // 设置路线数据
      setRouteData(formData)

      // 转换路线点格式
      if (data.routePoints && data.routePoints.length > 0) {
        console.log('🔍 原始路线点数据：', data.routePoints)
        const points = data.routePoints.map(point => ({
          lat: point.latitude,
          lng: point.longitude
        }))
        console.log('🔍 转换后路线点：', points)
        setRoutePoints(points)
      }

      // 转换签到点格式
      if (data.checkpoints && data.checkpoints.length > 0) {
        console.log('🔍 原始签到点数据：', data.checkpoints)
        const cps = data.checkpoints.map(cp => ({
          lat: cp.latitude,
          lng: cp.longitude,
          name: cp.name,
          radius: cp.radius,
          sequence: cp.sequence,
          type: cp.type,
          isRequired: cp.isRequired
        }))
        console.log('🔍 转换后签到点：', cps)
        setCheckpoints(cps)
      }

      // 转换途经点格式
      if (data.waypoints && data.waypoints.length > 0) {
        console.log('🔍 原始途经点数据：', data.waypoints)
        const wps = data.waypoints.map(wp => ({
          lat: wp.latitude,
          lng: wp.longitude,
          name: wp.name,
          pointType: wp.pointType,
          sequence: wp.sequence
        }))
        console.log('🔍 转换后途经点：', wps)
        setWaypoints(wps)
      }

      // 设置起点
      if (data.startPoint) {
        console.log('🔍 原始起点数据：', data.startPoint)
        const startPt = {
          lat: data.startPoint.latitude,
          lng: data.startPoint.longitude,
          name: data.startPoint.name || '起点'
        }
        console.log('🔍 转换后起点：', startPt)
        setStartPoint(startPt)
      } else {
        console.log('🔍 没有起点数据')
      }

      // 设置终点
      if (data.endPoint) {
        console.log('🔍 原始终点数据：', data.endPoint)
        const endPt = {
          lat: data.endPoint.latitude,
          lng: data.endPoint.longitude,
          name: data.endPoint.name || '终点'
        }
        console.log('🔍 转换后终点：', endPt)
        setEndPoint(endPt)
      } else {
        console.log('🔍 没有终点数据')
      }
    } catch (error) {
      console.error('获取路线详情失败:', error)
      message.error('获取路线详情失败')
      navigate('/organizer/routes')
    } finally {
      setFetching(false)
    }
  }

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
        // 验证路线
        if (routePoints.length < 2) {
          message.warning('请至少绘制2个路线点（起点和终点）')
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
      const submitData = {
        ...routeData,
        ...await form.validateFields(),
        routePoints: routePoints.map(point => ({
          latitude: point.lat,
          longitude: point.lng
        })),
        startPoint: startPoint ? {
          latitude: startPoint.lat,
          longitude: startPoint.lng,
          name: startPoint.name
        } : null,
        endPoint: endPoint ? {
          latitude: endPoint.lat,
          longitude: endPoint.lng,
          name: endPoint.name
        } : null,
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

      console.log('🚀 提交的数据：', submitData)

      await updateRoute(id, submitData)
      message.success('路线更新成功！')
      navigate('/organizer/routes')
    } catch (error) {
      console.error('更新路线失败:', error)
      message.error('更新路线失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRouteChange = useCallback((points) => {
    setRoutePoints(points)

    // 自动计算总里程
    if (points.length >= 2) {
      const distance = calculateRouteDistance(points)
      form.setFieldValue('totalDistance', (distance / 1000).toFixed(2))
    }
  }, [])

  const handleCheckpointsChange = useCallback((checkpoints) => {
    setCheckpoints(checkpoints)
  }, [])

  const handleWaypointsChange = useCallback((waypoints) => {
    setWaypoints(waypoints)
  }, [])

  const handleStartPointChange = useCallback((startPoint) => {
    setStartPoint(startPoint)
  }, [])

  const handleEndPointChange = useCallback((endPoint) => {
    setEndPoint(endPoint)
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
                      <div className="difficulty-option">
                        <span className="difficulty-label">{option.label}</span>
                        <span className="difficulty-desc">{option.desc}</span>
                      </div>
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
                  <Option value={true}>公开（所有人可见）</Option>
                  <Option value={false}>私有（仅自己可见）</Option>
                </Select>
              </Form.Item>
            </Form>
          </div>
        )

      case 1:
        return (
          <div className="step-content">
            <Alert
              message="路线规划"
              description="点击地图添加路线点。请至少添加2个点（起点和终点）。可以添加签到点和途经点。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            {fetching ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <div>加载中...</div>
              </div>
            ) : (
              <>
                <RouteEditor
                  initialRoute={routePoints}
                  initialCheckpoints={checkpoints}
                  initialWaypoints={waypoints}
                  initialStartPoint={startPoint}
                  initialEndPoint={endPoint}
                  onRouteChange={handleRouteChange}
                  onCheckpointsChange={handleCheckpointsChange}
                  onWaypointsChange={handleWaypointsChange}
                  onStartPointChange={handleStartPointChange}
                  onEndPointChange={handleEndPointChange}
                />
                {/* 调试信息 */}
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
                  <strong>调试信息：</strong>
                  <div>routePoints: {JSON.stringify(routePoints)}</div>
                  <div>checkpoints: {JSON.stringify(checkpoints)}</div>
                  <div>waypoints: {JSON.stringify(waypoints)}</div>
                  <div>startPoint: {JSON.stringify(startPoint)}</div>
                  <div>endPoint: {JSON.stringify(endPoint)}</div>
                </div>
              </>
            )}
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

  if (fetching) {
    return (
      <div className="route-create-page">
        <div className="container">
          <Card loading={true} className="create-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="route-create-page">
      <div className="container">
        <Card
          title="编辑路线"
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
                  保存
                </Button>
              )}
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RouteEdit

