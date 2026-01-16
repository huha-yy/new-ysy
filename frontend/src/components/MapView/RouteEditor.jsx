import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, Button, Space, Input, InputNumber, Tag, message, Modal, Popconfirm, Badge, Divider, Select } from 'antd'
import { PlusOutlined, MinusCircleOutlined, EnvironmentOutlined, FlagOutlined, EyeOutlined, AimOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import MapView from './MapView'
import { calculateRouteDistance, formatDistance } from '../../utils/map'
import './RouteEditor.css'

/**
 * 路线编辑地图组件
 * 支持在地图上绘制路线、添加签到点、途经点、风险点、休息点、补给点等
 */
const RouteEditor = ({
  initialRoute = [],
  initialCheckpoints = [],
  initialWaypoints = [],
  initialRiskPoints = [],
  initialRestPoints = [],
  initialSupplyPoints = [],
  initialStartPoint = null,
  initialEndPoint = null,
  onRouteChange,
  onCheckpointsChange,
  onWaypointsChange,
  onRiskPointsChange,
  onRestPointsChange,
  onSupplyPointsChange,
  onStartPointChange,
  onEndPointChange,
  readOnly = false
}) => {
  const [map, setMap] = useState(null)
  const [routePoints, setRoutePoints] = useState(initialRoute) // 路线轨迹点
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints) // 签到点
  const [waypoints, setWaypoints] = useState(initialWaypoints) // 途经点
  const [riskPoints, setRiskPoints] = useState(initialRiskPoints) // 风险点
  const [restPoints, setRestPoints] = useState(initialRestPoints) // 休息点
  const [supplyPoints, setSupplyPoints] = useState(initialSupplyPoints) // 补给点

  // 独立的起点和终点状态
  const [startPoint, setStartPoint] = useState(initialStartPoint)
  const [endPoint, setEndPoint] = useState(initialEndPoint)

  const [editingMode, setEditingMode] = useState(null) // 'route' | 'checkpoint' | 'waypoint' | 'riskPoint' | 'restPoint' | 'supplyPoint' | 'setStart' | 'setEnd' | null

  // 使用 ref 存储起点终点回调
  const onStartPointChangeRef = useRef(onStartPointChange)
  const onEndPointChangeRef = useRef(onEndPointChange)

  // 使用 ref 存储回调函数，避免依赖变化导致无限循环
  const onRouteChangeRef = useRef(onRouteChange)
  const onCheckpointsChangeRef = useRef(onCheckpointsChange)
  const onWaypointsChangeRef = useRef(onWaypointsChange)
  const onRiskPointsChangeRef = useRef(onRiskPointsChange)
  const onRestPointsChangeRef = useRef(onRestPointsChange)
  const onSupplyPointsChangeRef = useRef(onSupplyPointsChange)

  // 使用 ref 跟踪最新的 editingMode，解决闭包问题（必须在 useState 之后定义）
  const editingModeRef = useRef(null)

  // 使用 ref 跟踪最新的状态，避免闭包问题
  const waypointsRef = useRef(waypoints)
  const routePointsRef = useRef(routePoints)
  const checkpointsRef = useRef(checkpoints)
  const riskPointsRef = useRef(riskPoints)
  const restPointsRef = useRef(restPoints)
  const supplyPointsRef = useRef(supplyPoints)

  useEffect(() => {
    console.log('✓ RouteEditor 渲染，当前 editingMode：', editingMode)
    // 同步 ref 的值
    editingModeRef.current = editingMode
    waypointsRef.current = waypoints
    routePointsRef.current = routePoints
    checkpointsRef.current = checkpoints
    riskPointsRef.current = riskPoints
    restPointsRef.current = restPoints
    supplyPointsRef.current = supplyPoints
  }, [editingMode, waypoints, routePoints, checkpoints, riskPoints, restPoints, supplyPoints])

  // 签到点Modal
  const [checkpointModalVisible, setCheckpointModalVisible] = useState(false)
  const [editingCheckpoint, setEditingCheckpoint] = useState(null)
  const [checkpointForm, setCheckpointForm] = useState({
    name: '',
    radius: 100,
    sequence: 1,
    isRequired: true,
    type: 2 // 2=途中点
  })

  // 风险点Modal
  const [riskPointModalVisible, setRiskPointModalVisible] = useState(false)
  const [editingRiskPoint, setEditingRiskPoint] = useState(null)
  const [riskPointForm, setRiskPointForm] = useState({
    name: '',
    description: '',
    riskLevel: 2, // 1低2中3高
    riskTip: '',
    sequence: 1
  })

  // 休息点Modal
  const [restPointModalVisible, setRestPointModalVisible] = useState(false)
  const [editingRestPoint, setEditingRestPoint] = useState(null)
  const [restPointForm, setRestPointForm] = useState({
    name: '',
    description: '',
    sequence: 1
  })

  // 补给点Modal
  const [supplyPointModalVisible, setSupplyPointModalVisible] = useState(false)
  const [editingSupplyPoint, setEditingSupplyPoint] = useState(null)
  const [supplyPointForm, setSupplyPointForm] = useState({
    name: '',
    description: '',
    sequence: 1
  })

  // 使用 ref 存储初始值，避免空数组导致的无限循环
  const initialRouteRef = useRef(initialRoute)
  const initialCheckpointsRef = useRef(initialCheckpoints)
  const initialWaypointsRef = useRef(initialWaypoints)
  const initialRiskPointsRef = useRef(initialRiskPoints)
  const initialRestPointsRef = useRef(initialRestPoints)
  const initialSupplyPointsRef = useRef(initialSupplyPoints)
  const initialStartPointRef = useRef(initialStartPoint)
  const initialEndPointRef = useRef(initialEndPoint)
  const isInitializedRef = useRef(false)

  // 更新 ref
  useEffect(() => {
    onRouteChangeRef.current = onRouteChange
    onCheckpointsChangeRef.current = onCheckpointsChange
    onWaypointsChangeRef.current = onWaypointsChange
    onRiskPointsChangeRef.current = onRiskPointsChange
    onRestPointsChangeRef.current = onRestPointsChange
    onSupplyPointsChangeRef.current = onSupplyPointsChange
    onStartPointChangeRef.current = onStartPointChange
    onEndPointChangeRef.current = onEndPointChange
  }, [onRouteChange, onCheckpointsChange, onWaypointsChange, onRiskPointsChange, onRestPointsChange, onSupplyPointsChange, onStartPointChange, onEndPointChange])

  // 初始化数据，只在真正有数据时更新
  useEffect(() => {
    console.log('🔄 RouteEditor useEffect 被触发')
    console.log('🔄 接收到的初始数据：', {
      initialRoute,
      initialCheckpoints,
      initialWaypoints,
      initialRiskPoints,
      initialRestPoints,
      initialSupplyPoints,
      initialStartPoint,
      initialEndPoint
    })

    if (!isInitializedRef.current) {
      console.log('🔄 首次初始化')
      setRoutePoints(initialRoute || [])
      setCheckpoints(initialCheckpoints || [])
      setWaypoints(initialWaypoints || [])
      setRiskPoints(initialRiskPoints || [])
      setRestPoints(initialRestPoints || [])
      setSupplyPoints(initialSupplyPoints || [])
      setStartPoint(initialStartPoint)
      setEndPoint(initialEndPoint)
      isInitializedRef.current = true
    } else {
      console.log('🔄 更新现有数据')
      // 已初始化后，只在外部数据真正变化时更新
      if (JSON.stringify(initialRoute) !== JSON.stringify(initialRouteRef.current)) {
        setRoutePoints(initialRoute || [])
        initialRouteRef.current = initialRoute
      }
      if (JSON.stringify(initialCheckpoints) !== JSON.stringify(initialCheckpointsRef.current)) {
        setCheckpoints(initialCheckpoints || [])
        initialCheckpointsRef.current = initialCheckpoints
      }
      if (JSON.stringify(initialWaypoints) !== JSON.stringify(initialWaypointsRef.current)) {
        setWaypoints(initialWaypoints || [])
        initialWaypointsRef.current = initialWaypoints
      }
      if (JSON.stringify(initialRiskPoints) !== JSON.stringify(initialRiskPointsRef.current)) {
        setRiskPoints(initialRiskPoints || [])
        initialRiskPointsRef.current = initialRiskPoints
      }
      if (JSON.stringify(initialRestPoints) !== JSON.stringify(initialRestPointsRef.current)) {
        setRestPoints(initialRestPoints || [])
        initialRestPointsRef.current = initialRestPoints
      }
      if (JSON.stringify(initialSupplyPoints) !== JSON.stringify(initialSupplyPointsRef.current)) {
        setSupplyPoints(initialSupplyPoints || [])
        initialSupplyPointsRef.current = initialSupplyPoints
      }
      if (JSON.stringify(initialStartPoint) !== JSON.stringify(initialStartPointRef.current)) {
        setStartPoint(initialStartPoint)
        initialStartPointRef.current = initialStartPoint
      }
      if (JSON.stringify(initialEndPoint) !== JSON.stringify(initialEndPointRef.current)) {
        setEndPoint(initialEndPoint)
        initialEndPointRef.current = initialEndPoint
      }
    }
  }, [initialRoute, initialCheckpoints, initialWaypoints, initialRiskPoints, initialRestPoints, initialSupplyPoints, initialStartPoint, initialEndPoint])

  useEffect(() => {
    console.log('✓ routePoints 更新，当前数量：', routePoints.length)
    if (onRouteChangeRef.current) {
      onRouteChangeRef.current(routePoints)
    }
  }, [routePoints])

  useEffect(() => {
    console.log('✓ checkpoints 更新，当前数量：', checkpoints.length)
    if (onCheckpointsChangeRef.current) {
      onCheckpointsChangeRef.current(checkpoints)
    }
  }, [checkpoints])

  useEffect(() => {
    console.log('✓ waypoints 更新，当前数量：', waypoints.length)
    if (onWaypointsChangeRef.current) {
      onWaypointsChangeRef.current(waypoints)
    }
  }, [waypoints])

  useEffect(() => {
    console.log('✓ riskPoints 更新，当前数量：', riskPoints.length)
    if (onRiskPointsChangeRef.current) {
      onRiskPointsChangeRef.current(riskPoints)
    }
  }, [riskPoints])

  useEffect(() => {
    console.log('✓ restPoints 更新，当前数量：', restPoints.length)
    if (onRestPointsChangeRef.current) {
      onRestPointsChangeRef.current(restPoints)
    }
  }, [restPoints])

  useEffect(() => {
    console.log('✓ supplyPoints 更新，当前数量：', supplyPoints.length)
    if (onSupplyPointsChangeRef.current) {
      onSupplyPointsChangeRef.current(supplyPoints)
    }
  }, [supplyPoints])

  useEffect(() => {
    console.log('✓ 起点更新:', startPoint)
    if (onStartPointChangeRef.current && startPoint) {
      onStartPointChangeRef.current(startPoint)
    }
  }, [startPoint])

  useEffect(() => {
    console.log('✓ 终点更新:', endPoint)
    if (onEndPointChangeRef.current && endPoint) {
      onEndPointChangeRef.current(endPoint)
    }
  }, [endPoint])

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
    console.log('✓ 地图加载完成 - editingMode:', editingMode)

    // 移除旧的点击事件监听器
    if (mapInstance.current && mapInstance.current !== mapInstance) {
      mapInstance.current.off('click')
      console.log('✓ 已移除旧的点击事件监听器')
    }

    // 绑定新的点击事件
    if (!readOnly) {
      mapInstance.on('click', (e) => {
        // 使用 ref 获取最新的 editingMode，避免闭包问题
        const currentMode = editingModeRef.current
        console.log('✓ 地图被点击 - editingModeRef:', currentMode, ' lnglat:', e.lnglat)

        if (currentMode === 'route') {
          console.log('✓ 执行：添加路线点')
          addRoutePoint(e.lnglat)
        } else if (currentMode === 'checkpoint') {
          console.log('✓ 执行：打开签到点对话框')
          showCheckpointModal(e.lnglat)
        } else if (currentMode === 'waypoint') {
          console.log('🎯 执行：添加途经点')
          addWaypoint(e.lnglat)
        } else if (currentMode === 'riskPoint') {
          console.log('⚠️ 执行：打开风险点对话框')
          showRiskPointModal(e.lnglat)
        } else if (currentMode === 'restPoint') {
          console.log('☕ 执行：打开休息点对话框')
          showRestPointModal(e.lnglat)
        } else if (currentMode === 'supplyPoint') {
          console.log('🏪 执行：打开补给点对话框')
          showSupplyPointModal(e.lnglat)
        } else if (currentMode === 'setStart') {
          console.log('✓ 执行：设置起点')
          setStartPointHandler(e.lnglat)
        } else if (currentMode === 'setEnd') {
          console.log('✓ 执行：设置终点')
          setEndPointHandler(e.lnglat)
        } else {
          console.log('✓ 警告：未选择编辑模式，当前 editingMode =', currentMode)
        }
      })
    }
  }, [readOnly]) // 移除 editingMode 依赖，因为使用了 editingModeRef

  const addRoutePoint = useCallback((lnglat) => {
    const newPoint = {
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    }
    const updatedRoutePoints = [...routePointsRef.current, newPoint]
    setRoutePoints(updatedRoutePoints)
  }, [])

  const setStartPointHandler = (lnglat) => {
    const point = {
      lng: lnglat.getLng(),
      lat: lnglat.getLat(),
      name: '起点'
    }
    setStartPoint(point)
    setEditingMode(null) // 设置完自动退出模式
    message.success('起点设置成功')
  }

  const setEndPointHandler = (lnglat) => {
    const point = {
      lng: lnglat.getLng(),
      lat: lnglat.getLat(),
      name: '终点'
    }
    setEndPoint(point)
    setEditingMode(null) // 设置完自动退出模式
    message.success('终点设置成功')
  }

  const addWaypoint = useCallback((lnglat) => {
    console.log('🎯 addWaypoint 被调用，当前 waypoints 数量：', waypointsRef.current.length)
    console.log('🎯 新的坐标：', lnglat.getLng(), lnglat.getLat())

    const newWaypoint = {
      lng: lnglat.getLng(),
      lat: lnglat.getLat(),
      name: `途经点${waypointsRef.current.length + 1}`,
      pointType: 1, // 1=途经点
      sequence: waypointsRef.current.length + 1
    }

    console.log('🎯 准备添加的途经点：', newWaypoint)

    const updatedWaypoints = [...waypointsRef.current, newWaypoint]
    console.log('🎯 更新后的 waypoints 数组：', updatedWaypoints)

    setWaypoints(updatedWaypoints)
    message.success(`已添加途经点${waypointsRef.current.length + 1}`)
  }, [])

  const showCheckpointModal = useCallback((lnglat) => {
    setEditingCheckpoint({
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    })
    setCheckpointForm({
      ...checkpointForm,
      sequence: checkpointsRef.current.length + 1
    })
    setCheckpointModalVisible(true)
  }, [checkpointForm])

  const handleAddCheckpoint = () => {
    if (!checkpointForm.name) {
      message.warning('请输入签到点名称')
      return
    }

    const newCheckpoint = {
      lng: editingCheckpoint.lng,
      lat: editingCheckpoint.lat,
      ...checkpointForm
    }

    setCheckpoints([...checkpoints, newCheckpoint])
    setCheckpointModalVisible(false)
    message.success('签到点添加成功')
  }

  // 风险点相关处理
  const showRiskPointModal = useCallback((lnglat) => {
    setEditingRiskPoint({
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    })
    setRiskPointForm({
      ...riskPointForm,
      sequence: riskPointsRef.current.length + 1
    })
    setRiskPointModalVisible(true)
  }, [riskPointForm])

  const handleAddRiskPoint = () => {
    if (!riskPointForm.name) {
      message.warning('请输入风险点名称')
      return
    }

    const newRiskPoint = {
      lng: editingRiskPoint.lng,
      lat: editingRiskPoint.lat,
      ...riskPointForm,
      pointType: 2 // 风险点类型
    }

    setRiskPoints([...riskPoints, newRiskPoint])
    setRiskPointModalVisible(false)
    message.success('风险点添加成功')
  }

  // 休息点相关处理
  const showRestPointModal = useCallback((lnglat) => {
    setEditingRestPoint({
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    })
    setRestPointForm({
      ...restPointForm,
      sequence: restPointsRef.current.length + 1
    })
    setRestPointModalVisible(true)
  }, [restPointForm])

  const handleAddRestPoint = () => {
    if (!restPointForm.name) {
      message.warning('请输入休息点名称')
      return
    }

    const newRestPoint = {
      lng: editingRestPoint.lng,
      lat: editingRestPoint.lat,
      ...restPointForm,
      pointType: 3 // 休息点类型
    }

    setRestPoints([...restPoints, newRestPoint])
    setRestPointModalVisible(false)
    message.success('休息点添加成功')
  }

  // 补给点相关处理
  const showSupplyPointModal = useCallback((lnglat) => {
    setEditingSupplyPoint({
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    })
    setSupplyPointForm({
      ...supplyPointForm,
      sequence: supplyPointsRef.current.length + 1
    })
    setSupplyPointModalVisible(true)
  }, [supplyPointForm])

  const handleAddSupplyPoint = () => {
    if (!supplyPointForm.name) {
      message.warning('请输入补给点名称')
      return
    }

    const newSupplyPoint = {
      lng: editingSupplyPoint.lng,
      lat: editingSupplyPoint.lat,
      ...supplyPointForm,
      pointType: 4 // 补给点类型
    }

    setSupplyPoints([...supplyPoints, newSupplyPoint])
    setSupplyPointModalVisible(false)
    message.success('补给点添加成功')
  }

  const removeRoutePoint = (index) => {
    const newPoints = routePoints.filter((_, i) => i !== index)
    setRoutePoints(newPoints)
  }

  const removeCheckpoint = (index) => {
    const newCheckpoints = checkpoints.filter((_, i) => i !== index)
    setCheckpoints(newCheckpoints)
  }

  const removeWaypoint = (index) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index)
    setWaypoints(newWaypoints)
  }

  const removeRiskPoint = (index) => {
    const newPoints = riskPoints.filter((_, i) => i !== index)
    setRiskPoints(newPoints)
  }

  const removeRestPoint = (index) => {
    const newPoints = restPoints.filter((_, i) => i !== index)
    setRestPoints(newPoints)
  }

  const removeSupplyPoint = (index) => {
    const newPoints = supplyPoints.filter((_, i) => i !== index)
    setSupplyPoints(newPoints)
  }

  const clearStartPoint = () => {
    setStartPoint(null)
    message.success('已清空起点')
  }

  const clearEndPoint = () => {
    setEndPoint(null)
    message.success('已清空终点')
  }

  const fitMapToRoute = () => {
    if (!map || routePoints.length === 0) {
      message.warning('暂无路线点可以适应')
      return
    }

    try {
      const AMap = window.AMap
      const bounds = new AMap.Bounds()

      // 添加所有有效的路线点到边界
      routePoints.forEach(point => {
        const lng = parseFloat(point.lng)
        const lat = parseFloat(point.lat)
        if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
          bounds.extend([lng, lat])
        }
      })

      // 如果有起点和终点，也添加到边界
      if (startPoint) {
        bounds.extend([startPoint.lng, startPoint.lat])
      }
      if (endPoint) {
        bounds.extend([endPoint.lng, endPoint.lat])
      }

      // 调整地图视野
      map.setBounds(bounds, false, [20, 20, 20, 20]) // 添加一些边距
      message.success('已调整地图视野')
    } catch (error) {
      console.error('调整地图视野失败:', error)
      message.error('调整地图视野失败')
    }
  }

  const clearRoute = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有路线信息吗？',
      onOk: () => {
        setRoutePoints([])
        setStartPoint(null)
        setEndPoint(null)
        setCheckpoints([])
        setWaypoints([])
        setRiskPoints([])
        setRestPoints([])
        setSupplyPoints([])
      }
    })
  }

  const totalDistance = calculateRouteDistance(routePoints)

  // 创建自定义标记HTML内容的工具函数
  const createCustomMarkerContent = (type, data, index) => {
    const baseStyle = `
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      box-shadow: 0 3px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.2);
      border: 2px solid rgba(255,255,255,0.9);
      min-width: 24px;
      height: 28px;
      position: relative;
      transition: all 0.2s ease;
      cursor: pointer;
      backdrop-filter: blur(10px);
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `

    const hoverStyle = `
      :hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 5px 20px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.3);
      }
    `

    // 添加小三角形指示器
    const triangleStyle = `
      ::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
      }
    `

    switch (type) {
      case 'start':
        return `
          <div class="custom-marker start-marker" style="${baseStyle} background: linear-gradient(135deg, #52c41a 0%, #389e0d 50%, #73d13d 100%);">
            <span style="margin-right: 4px;">🎯</span>起点
          </div>
          <style>
            .start-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #52c41a; }
            .start-marker${hoverStyle}
          </style>
        `
      case 'end':
        return `
          <div class="custom-marker end-marker" style="${baseStyle} background: linear-gradient(135deg, #f5222d 0%, #cf1322 50%, #ff4d4f 100%);">
            <span style="margin-right: 4px;">🏁</span>终点
          </div>
          <style>
            .end-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #f5222d; }
            .end-marker${hoverStyle}
          </style>
        `
      case 'route':
        return `
          <div class="custom-marker route-marker" style="${baseStyle} background: linear-gradient(135deg, #1890ff 0%, #096dd9 50%, #40a9ff 100%);">
            <span style="margin-right: 3px;">📍</span>${index + 1}
          </div>
          <style>
            .route-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #1890ff; }
            .route-marker${hoverStyle}
          </style>
        `
      case 'checkpoint':
        const shortName = data.name.length > 6 ? data.name.substring(0, 6) + '…' : data.name
        return `
          <div class="custom-marker checkpoint-marker" style="${baseStyle} background: linear-gradient(135deg, #fa541c 0%, #d4380d 50%, #ff7a45 100%); max-width: 120px;">
            <span style="margin-right: 3px;">🚩</span><span style="overflow: hidden; text-overflow: ellipsis;">${shortName}</span>
          </div>
          <style>
            .checkpoint-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #fa541c; }
            .checkpoint-marker${hoverStyle}
          </style>
        `
      case 'waypoint':
        const shortWpName = data.name.length > 8 ? data.name.substring(0, 8) + '…' : data.name
        return `
          <div class="custom-marker waypoint-marker" style="${baseStyle} background: linear-gradient(135deg, #13c2c2 0%, #08979c 50%, #36cfc9 100%); max-width: 100px;">
            <span style="margin-right: 3px;">➕</span><span style="overflow: hidden; text-overflow: ellipsis;">${shortWpName}</span>
          </div>
          <style>
            .waypoint-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #13c2c2; }
            .waypoint-marker${hoverStyle}
          </style>
        `
      case 'riskPoint':
        const shortRiskName = data.name.length > 8 ? data.name.substring(0, 8) + '…' : data.name
        return `
          <div class="custom-marker riskpoint-marker" style="${baseStyle} background: linear-gradient(135deg, #faad14 0%, #d48806 50%, #ffc53d 100%); max-width: 120px;">
            <span style="margin-right: 3px;">⚠️</span><span style="overflow: hidden; text-overflow: ellipsis;">${shortRiskName}</span>
          </div>
          <style>
            .riskpoint-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #faad14; }
            .riskpoint-marker${hoverStyle}
          </style>
        `
      case 'restPoint':
        const shortRestName = data.name.length > 8 ? data.name.substring(0, 8) + '…' : data.name
        return `
          <div class="custom-marker restpoint-marker" style="${baseStyle} background: linear-gradient(135deg, #722ed1 0%, #531dab 50%, #9254de 100%); max-width: 120px;">
            <span style="margin-right: 3px;">☕</span><span style="overflow: hidden; text-overflow: ellipsis;">${shortRestName}</span>
          </div>
          <style>
            .restpoint-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #722ed1; }
            .restpoint-marker${hoverStyle}
          </style>
        `
      case 'supplyPoint':
        const shortSupplyName = data.name.length > 8 ? data.name.substring(0, 8) + '…' : data.name
        return `
          <div class="custom-marker supplypoint-marker" style="${baseStyle} background: linear-gradient(135deg, #52c41a 0%, #389e0d 50%, #73d13d 100%); max-width: 120px;">
            <span style="margin-right: 3px;">🏪</span><span style="overflow: hidden; text-overflow: ellipsis;">${shortSupplyName}</span>
          </div>
          <style>
            .supplypoint-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #52c41a; }
            .supplypoint-marker${hoverStyle}
          </style>
        `
      default:
        return `
          <div class="custom-marker default-marker" style="${baseStyle} background: linear-gradient(135deg, #666 0%, #999 100%);">
            <span>📌</span>
          </div>
          <style>
            .default-marker${triangleStyle.replace('::after', '::after')} { border-top: 8px solid #666; }
            .default-marker${hoverStyle}
          </style>
        `
    }
  }

  // 构建所有标记点（起点 + 终点 + 路线点 + 签到点 + 途经点）
  const allMarkers = useMemo(() => {
    console.log('🏗️ 重新构建 allMarkers')
    console.log('🏗️ 当前状态 - routePoints:', routePoints.length, 'checkpoints:', checkpoints.length, 'waypoints:', waypoints.length)

    const markers = []

    // 起点
    if (startPoint && window.AMap) {
      console.log('✓ 添加起点标记:', startPoint)
      markers.push({
        ...startPoint,
        title: '起点',
        content: createCustomMarkerContent('start', startPoint),
        offset: new window.AMap.Pixel(-35, -40),
        anchor: 'bottom-center'
      })
    }

    // 终点
    if (endPoint && window.AMap) {
      console.log('✓ 添加终点标记:', endPoint)
      markers.push({
        ...endPoint,
        title: '终点',
        content: createCustomMarkerContent('end', endPoint),
        offset: new window.AMap.Pixel(-35, -40),
        anchor: 'bottom-center'
      })
    }

    // 路线点（途经点）
    routePoints.forEach((point, index) => {
      if (window.AMap) {
        markers.push({
          ...point,
          title: `路线点${index + 1}`,
          content: createCustomMarkerContent('route', point, index),
          offset: new window.AMap.Pixel(-25, -40),
          anchor: 'bottom-center'
        })
      }
    })

    // 签到点
    checkpoints.forEach((cp, index) => {
      if (window.AMap) {
        markers.push({
          ...cp,
          title: cp.name,
          content: createCustomMarkerContent('checkpoint', cp, index),
          offset: new window.AMap.Pixel(-60, -40),
          anchor: 'bottom-center'
        })
      }
    })

    // 途经点
    console.log('🏗️ 开始构建途经点标记，waypoints:', waypoints)
    waypoints.forEach((wp, index) => {
      if (window.AMap) {
        console.log(`🏗️ 添加途经点 ${index + 1}:`, wp)
        markers.push({
          ...wp,
          title: wp.name,
          content: createCustomMarkerContent('waypoint', wp, index),
          offset: new window.AMap.Pixel(-50, -40),
          anchor: 'bottom-center'
        })
      }
    })

    // 风险点
    console.log('🏗️ 开始构建风险点标记，riskPoints:', riskPoints)
    riskPoints.forEach((rp, index) => {
      if (window.AMap) {
        console.log(`🏗️ 添加风险点 ${index + 1}:`, rp)
        markers.push({
          ...rp,
          title: rp.name,
          content: createCustomMarkerContent('riskPoint', rp, index),
          offset: new window.AMap.Pixel(-60, -40),
          anchor: 'bottom-center'
        })
      }
    })

    // 休息点
    console.log('🏗️ 开始构建休息点标记，restPoints:', restPoints)
    restPoints.forEach((rp, index) => {
      if (window.AMap) {
        console.log(`🏗️ 添加休息点 ${index + 1}:`, rp)
        markers.push({
          ...rp,
          title: rp.name,
          content: createCustomMarkerContent('restPoint', rp, index),
          offset: new window.AMap.Pixel(-60, -40),
          anchor: 'bottom-center'
        })
      }
    })

    // 补给点
    console.log('🏗️ 开始构建补给点标记，supplyPoints:', supplyPoints)
    supplyPoints.forEach((sp, index) => {
      if (window.AMap) {
        console.log(`🏗️ 添加补给点 ${index + 1}:`, sp)
        markers.push({
          ...sp,
          title: sp.name,
          content: createCustomMarkerContent('supplyPoint', sp, index),
          offset: new window.AMap.Pixel(-60, -40),
          anchor: 'bottom-center'
        })
      }
    })

    console.log('🏗️ allMarkers 构建完成，数量：', markers.length)
    console.log('🏗️ 最终 markers 数组：', markers)
    return markers
  }, [startPoint, endPoint, routePoints, checkpoints, waypoints, riskPoints, restPoints, supplyPoints])

  return (
    <div className="route-editor">
      <Card className="editor-controls">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="edit-mode-buttons">
            <Button
              type={editingMode === 'route' ? 'primary' : 'default'}
              icon={<EnvironmentOutlined />}
              onClick={() => {
                console.log('✓ 点击绘制路线按钮，当前editingMode：', editingMode)
                if (editingMode !== 'route') {
                  setEditingMode('route')
                }
              }}
              disabled={readOnly}
            >
              绘制路线
            </Button>
            <Button
              type={editingMode === 'setStart' ? 'primary' : 'default'}
              icon={<EnvironmentOutlined />}
              onClick={() => {
                console.log('✓ 点击设置起点按钮，当前editingMode：', editingMode)
                setEditingMode(editingMode === 'setStart' ? null : 'setStart')
              }}
              disabled={readOnly}
            >
              设置起点
            </Button>
            <Button
              type={editingMode === 'setEnd' ? 'primary' : 'default'}
              icon={<EnvironmentOutlined />}
              onClick={() => {
                console.log('✓ 点击设置终点按钮，当前editingMode：', editingMode)
                setEditingMode(editingMode === 'setEnd' ? null : 'setEnd')
              }}
              disabled={readOnly}
            >
              设置终点
            </Button>
            <Button
              type={editingMode === 'checkpoint' ? 'primary' : 'default'}
              icon={<FlagOutlined />}
              onClick={() => {
                console.log('✓ 点击添加签到点按钮，当前editingMode：', editingMode)
                if (editingMode !== 'checkpoint') {
                  setEditingMode('checkpoint')
                }
              }}
              disabled={readOnly}
            >
              添加签到点
            </Button>
            <Button
              type={editingMode === 'waypoint' ? 'primary' : 'default'}
              icon={<PlusOutlined />}
              onClick={() => {
                console.log('🔵 点击添加途经点按钮，当前editingMode：', editingMode)
                console.log('🔵 当前 waypoints 数量：', waypoints.length)
                // 如果不是waypoint模式，就进入waypoint模式；如果已经是waypoint模式，保持不变
                if (editingMode !== 'waypoint') {
                  console.log('🔵 进入 waypoint 编辑模式')
                  setEditingMode('waypoint')
                } else {
                  console.log('🔵 已经在 waypoint 编辑模式中，保持模式')
                }
                // 如果已经是waypoint模式，不做任何改变，让用户可以连续添加
              }}
              disabled={readOnly}
            >
              添加途经点
            </Button>

            <Button
              type={editingMode === 'riskPoint' ? 'primary' : 'default'}
              icon={<EnvironmentOutlined />}
              onClick={() => {
                console.log('⚠️ 点击添加风险点按钮')
                if (editingMode !== 'riskPoint') {
                  setEditingMode('riskPoint')
                }
              }}
              disabled={readOnly}
            >
              添加风险点
            </Button>

            <Button
              type={editingMode === 'restPoint' ? 'primary' : 'default'}
              icon={<PlusOutlined />}
              onClick={() => {
                console.log('☕ 点击添加休息点按钮')
                if (editingMode !== 'restPoint') {
                  setEditingMode('restPoint')
                }
              }}
              disabled={readOnly}
            >
              添加休息点
            </Button>

            <Button
              type={editingMode === 'supplyPoint' ? 'primary' : 'default'}
              icon={<PlusOutlined />}
              onClick={() => {
                console.log('🏪 点击添加补给点按钮')
                if (editingMode !== 'supplyPoint') {
                  setEditingMode('supplyPoint')
                }
              }}
              disabled={readOnly}
            >
              添加补给点
            </Button>

            {/* 退出编辑模式按钮 */}
            {editingMode && editingMode !== 'setStart' && editingMode !== 'setEnd' && (
              <Button
                type="default"
                danger
                onClick={() => {
                  console.log('✓ 退出编辑模式')
                  setEditingMode(null)
                }}
                disabled={readOnly}
              >
                完成编辑
              </Button>
            )}

            {(routePoints.length > 0 || startPoint || endPoint) && (
              <Button
                icon={<AimOutlined />}
                onClick={fitMapToRoute}
                title="调整地图视野以显示全部路线"
              >
                适应视野
              </Button>
            )}
            {(routePoints.length > 0 || startPoint || endPoint) && !readOnly && (
              <Button danger onClick={clearRoute}>
                清空
              </Button>
            )}
          </div>

          {editingMode && (
            <div className="edit-tip">
              <Tag color="blue">
                {editingMode === 'route' && '点击地图连续添加路线点，完成后点击"完成编辑"'}
                {editingMode === 'setStart' && '点击地图设置起点'}
                {editingMode === 'setEnd' && '点击地图设置终点'}
                {editingMode === 'checkpoint' && '点击地图连续添加签到点，完成后点击"完成编辑"'}
                {editingMode === 'waypoint' && '点击地图连续添加途经点，完成后点击"完成编辑"'}
                {editingMode === 'riskPoint' && '点击地图连续添加风险点，完成后点击"完成编辑"'}
                {editingMode === 'restPoint' && '点击地图连续添加休息点，完成后点击"完成编辑"'}
                {editingMode === 'supplyPoint' && '点击地图连续添加补给点，完成后点击"完成编辑"'}
              </Tag>
            </div>
          )}

          {editingMode && (
            <div className="edit-mode-debug">
              <Tag color="green">当前编辑模式：{editingMode}</Tag>
            </div>
          )}

          {(routePoints.length > 0 || checkpoints.length > 0 || waypoints.length > 0) && (
            <Card size="small" className="route-stats-card">
              <div className="route-stats">
                <Space size={16}>
                  <div className="stat-item">
                    <Badge count={routePoints.length} color="#1890ff">
                      <EnvironmentOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                    </Badge>
                    <span className="stat-label">路线点</span>
                  </div>
                  <div className="stat-item">
                    <Badge count={checkpoints.length} color="#f5222d">
                      <FlagOutlined style={{ fontSize: '16px', color: '#f5222d' }} />
                    </Badge>
                    <span className="stat-label">签到点</span>
                  </div>
                  <div className="stat-item">
                    <Badge count={waypoints.length} color="#52c41a">
                      <PlusOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                    </Badge>
                    <span className="stat-label">途经点</span>
                  </div>
                  <div className="stat-item">
                    <Badge count={riskPoints.length} color="#faad14">
                      <EnvironmentOutlined style={{ fontSize: '16px', color: '#faad14' }} />
                    </Badge>
                    <span className="stat-label">风险点</span>
                  </div>
                  <div className="stat-item">
                    <Badge count={restPoints.length} color="#722ed1">
                      <PlusOutlined style={{ fontSize: '16px', color: '#722ed1' }} />
                    </Badge>
                    <span className="stat-label">休息点</span>
                  </div>
                  <div className="stat-item">
                    <Badge count={supplyPoints.length} color="#52c41a">
                      <PlusOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                    </Badge>
                    <span className="stat-label">补给点</span>
                  </div>
                  {routePoints.length > 1 && (
                    <div className="stat-item total-distance">
                      <span className="distance-icon">📏</span>
                      <span className="distance-value">{formatDistance(totalDistance)}</span>
                      <span className="stat-label">总里程</span>
                    </div>
                  )}
                </Space>
              </div>
            </Card>
          )}

          {/* 起点终点显示区域 */}
          {(startPoint || endPoint) && (
            <Card size="small" title={
              <Space>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <span>路线起终点</span>
              </Space>
            } className="start-end-card">
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {startPoint && (
                  <div className="point-item start-point">
                    <div className="point-content">
                      <div className="point-header">
                        <Space>
                          <div className="point-icon start-icon">🎯</div>
                          <div className="point-info">
                            <div className="point-title">起点</div>
                            <div className="point-coordinates">
                              {startPoint.lng?.toFixed(6)}, {startPoint.lat?.toFixed(6)}
                            </div>
                          </div>
                        </Space>
                      </div>
                      {!readOnly && (
                        <Popconfirm
                          title="确认删除起点？"
                          onConfirm={clearStartPoint}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="point-action"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                )}
                {endPoint && (
                  <div className="point-item end-point">
                    <div className="point-content">
                      <div className="point-header">
                        <Space>
                          <div className="point-icon end-icon">🏁</div>
                          <div className="point-info">
                            <div className="point-title">终点</div>
                            <div className="point-coordinates">
                              {endPoint.lng?.toFixed(6)}, {endPoint.lat?.toFixed(6)}
                            </div>
                          </div>
                        </Space>
                      </div>
                      {!readOnly && (
                        <Popconfirm
                          title="确认删除终点？"
                          onConfirm={clearEndPoint}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="point-action"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {checkpoints.length > 0 && (
            <Card size="small" title={
              <Space>
                <FlagOutlined style={{ color: '#f5222d' }} />
                <span>签到点列表</span>
                <Badge count={checkpoints.length} color="#f5222d" />
              </Space>
            } className="checkpoints-card">
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {checkpoints.map((cp, index) => (
                  <div key={index} className="checkpoint-item">
                    <div className="checkpoint-content">
                      <div className="checkpoint-header">
                        <Space>
                          <div className="checkpoint-badge">
                            <Badge count={cp.sequence} color="#f5222d" size="small" />
                            <FlagOutlined style={{ fontSize: '14px', color: '#f5222d' }} />
                          </div>
                          <div className="checkpoint-info">
                            <div className="checkpoint-name">{cp.name}</div>
                            <div className="checkpoint-details">
                              <Tag size="small" color="orange">半径 {cp.radius}m</Tag>
                              {cp.isRequired && <Tag size="small" color="red">必达</Tag>}
                            </div>
                          </div>
                        </Space>
                      </div>
                      {!readOnly && (
                        <Popconfirm
                          title="确认删除该签到点？"
                          onConfirm={() => removeCheckpoint(index)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="checkpoint-action"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {waypoints.length > 0 && (
            <Card size="small" title={
              <Space>
                <PlusOutlined style={{ color: '#52c41a' }} />
                <span>途经点列表</span>
                <Badge count={waypoints.length} color="#52c41a" />
              </Space>
            } className="waypoints-card">
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {waypoints.map((wp, index) => (
                  <div key={index} className="waypoint-item">
                    <div className="waypoint-content">
                      <div className="waypoint-header">
                        <Space>
                          <div className="waypoint-icon">
                            <PlusOutlined style={{ fontSize: '14px', color: '#52c41a' }} />
                          </div>
                          <div className="waypoint-info">
                            <div className="waypoint-name">{wp.name}</div>
                            <div className="waypoint-details">
                              <Tag size="small" color="green">序号 {wp.sequence}</Tag>
                            </div>
                          </div>
                        </Space>
                      </div>
                      {!readOnly && (
                        <Popconfirm
                          title="确认删除该途经点？"
                          onConfirm={() => removeWaypoint(index)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="waypoint-action"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {/* 风险点列表 */}
          {riskPoints.length > 0 && (
            <Card size="small" title={
              <Space>
                <EnvironmentOutlined style={{ color: '#faad14' }} />
                <span>风险点列表</span>
                <Badge count={riskPoints.length} color="#faad14" />
              </Space>
            } className="riskpoints-card">
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {riskPoints.map((rp, index) => (
                  <div key={index} className="riskpoint-item">
                    <div className="point-content">
                      <div className="point-header">
                        <Space>
                          <div className="point-icon">
                            <EnvironmentOutlined style={{ fontSize: '14px', color: '#faad14' }} />
                          </div>
                          <div className="point-info">
                            <div className="point-name">{rp.name}</div>
                            <div className="point-details">
                              <Tag size="small" color="orange">
                                {rp.riskLevel === 1 ? '低风险' : rp.riskLevel === 2 ? '中风险' : '高风险'}
                              </Tag>
                              {rp.riskTip && <Tag size="small" color="red">{rp.riskTip}</Tag>}
                            </div>
                          </div>
                        </Space>
                      </div>
                      {!readOnly && (
                        <Popconfirm
                          title="确认删除该风险点？"
                          onConfirm={() => removeRiskPoint(index)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="point-action"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {/* 休息点列表 */}
          {restPoints.length > 0 && (
            <Card size="small" title={
              <Space>
                <PlusOutlined style={{ color: '#722ed1' }} />
                <span>休息点列表</span>
                <Badge count={restPoints.length} color="#722ed1" />
              </Space>
            } className="restpoints-card">
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {restPoints.map((rp, index) => (
                  <div key={index} className="restpoint-item">
                    <div className="point-content">
                      <div className="point-header">
                        <Space>
                          <div className="point-icon">
                            <PlusOutlined style={{ fontSize: '14px', color: '#722ed1' }} />
                          </div>
                          <div className="point-info">
                            <div className="point-name">{rp.name}</div>
                            {rp.description && (
                              <div className="point-desc">{rp.description}</div>
                            )}
                          </div>
                        </Space>
                      </div>
                      {!readOnly && (
                        <Popconfirm
                          title="确认删除该休息点？"
                          onConfirm={() => removeRestPoint(index)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="point-action"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {/* 补给点列表 */}
          {supplyPoints.length > 0 && (
            <Card size="small" title={
              <Space>
                <PlusOutlined style={{ color: '#52c41a' }} />
                <span>补给点列表</span>
                <Badge count={supplyPoints.length} color="#52c41a" />
              </Space>
            } className="supplypoints-card">
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {supplyPoints.map((sp, index) => (
                  <div key={index} className="supplypoint-item">
                    <div className="point-content">
                      <div className="point-header">
                        <Space>
                          <div className="point-icon">
                            <PlusOutlined style={{ fontSize: '14px', color: '#52c41a' }} />
                          </div>
                          <div className="point-info">
                            <div className="point-name">{sp.name}</div>
                            {sp.description && (
                              <div className="point-desc">{sp.description}</div>
                            )}
                          </div>
                        </Space>
                      </div>
                      {!readOnly && (
                        <Popconfirm
                          title="确认删除该补给点？"
                          onConfirm={() => removeSupplyPoint(index)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            className="point-action"
                          />
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        </Space>
      </Card>

      <MapView
        center={{ lng: 116.397428, lat: 39.90923 }}
        height="500px"
        markers={allMarkers}
        routePoints={routePoints}
        onMapLoad={handleMapLoad}
        allowCenterChange={false}
      />

      <Modal
        title="添加签到点"
        open={checkpointModalVisible}
        onOk={handleAddCheckpoint}
        onCancel={() => setCheckpointModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>签到点名称：</label>
            <Input
              value={checkpointForm.name}
              onChange={(e) => setCheckpointForm({ ...checkpointForm, name: e.target.value })}
              placeholder="请输入签到点名称"
            />
          </div>
          <div>
            <label>签到半径（米）：</label>
            <InputNumber
              value={checkpointForm.radius}
              onChange={(value) => setCheckpointForm({ ...checkpointForm, radius: value })}
              min={10}
              max={500}
              defaultValue={100}
            />
          </div>
          <div>
            <label>序号：</label>
            <InputNumber
              value={checkpointForm.sequence}
              onChange={(value) => setCheckpointForm({ ...checkpointForm, sequence: value })}
              min={1}
            />
          </div>
        </Space>
      </Modal>

      {/* 风险点Modal */}
      <Modal
        title="添加风险点"
        open={riskPointModalVisible}
        onOk={handleAddRiskPoint}
        onCancel={() => setRiskPointModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>风险点名称：</label>
            <Input
              value={riskPointForm.name}
              onChange={(e) => setRiskPointForm({ ...riskPointForm, name: e.target.value })}
              placeholder="请输入风险点名称"
            />
          </div>
          <div>
            <label>风险描述：</label>
            <Input.TextArea
              value={riskPointForm.description}
              onChange={(e) => setRiskPointForm({ ...riskPointForm, description: e.target.value })}
              placeholder="请输入风险描述"
              rows={3}
            />
          </div>
          <div>
            <label>风险等级：</label>
            <Select
              value={riskPointForm.riskLevel}
              onChange={(value) => setRiskPointForm({ ...riskPointForm, riskLevel: value })}
              style={{ width: '100%' }}
            >
              <Select.Option value={1}>低风险</Select.Option>
              <Select.Option value={2}>中风险</Select.Option>
              <Select.Option value={3}>高风险</Select.Option>
            </Select>
          </div>
          <div>
            <label>风险提示：</label>
            <Input.TextArea
              value={riskPointForm.riskTip}
              onChange={(e) => setRiskPointForm({ ...riskPointForm, riskTip: e.target.value })}
              placeholder="请输入风险提示"
              rows={2}
            />
          </div>
          <div>
            <label>序号：</label>
            <InputNumber
              value={riskPointForm.sequence}
              onChange={(value) => setRiskPointForm({ ...riskPointForm, sequence: value })}
              min={1}
            />
          </div>
        </Space>
      </Modal>

      {/* 休息点Modal */}
      <Modal
        title="添加休息点"
        open={restPointModalVisible}
        onOk={handleAddRestPoint}
        onCancel={() => setRestPointModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>休息点名称：</label>
            <Input
              value={restPointForm.name}
              onChange={(e) => setRestPointForm({ ...restPointForm, name: e.target.value })}
              placeholder="请输入休息点名称"
            />
          </div>
          <div>
            <label>休息点描述：</label>
            <Input.TextArea
              value={restPointForm.description}
              onChange={(e) => setRestPointForm({ ...restPointForm, description: e.target.value })}
              placeholder="请输入休息点描述"
              rows={3}
            />
          </div>
          <div>
            <label>序号：</label>
            <InputNumber
              value={restPointForm.sequence}
              onChange={(value) => setRestPointForm({ ...restPointForm, sequence: value })}
              min={1}
            />
          </div>
        </Space>
      </Modal>

      {/* 补给点Modal */}
      <Modal
        title="添加补给点"
        open={supplyPointModalVisible}
        onOk={handleAddSupplyPoint}
        onCancel={() => setSupplyPointModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label>补给点名称：</label>
            <Input
              value={supplyPointForm.name}
              onChange={(e) => setSupplyPointForm({ ...supplyPointForm, name: e.target.value })}
              placeholder="请输入补给点名称"
            />
          </div>
          <div>
            <label>补给点描述：</label>
            <Input.TextArea
              value={supplyPointForm.description}
              onChange={(e) => setSupplyPointForm({ ...supplyPointForm, description: e.target.value })}
              placeholder="请输入补给点描述（如：可补充水、食物等）"
              rows={3}
            />
          </div>
          <div>
            <label>序号：</label>
            <InputNumber
              value={supplyPointForm.sequence}
              onChange={(value) => setSupplyPointForm({ ...supplyPointForm, sequence: value })}
              min={1}
            />
          </div>
        </Space>
      </Modal>
    </div>
  )
}

export default RouteEditor

