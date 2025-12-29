import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Card, Button, Space, Input, InputNumber, Tag, message, Modal } from 'antd'
import { PlusOutlined, MinusCircleOutlined, EnvironmentOutlined, FlagOutlined } from '@ant-design/icons'
import MapView from './MapView'
import { calculateRouteDistance, formatDistance } from '../../utils/map'
import './RouteEditor.css'

/**
 * 路线编辑地图组件
 * 支持在地图上绘制路线、添加签到点、途经点等
 */
const RouteEditor = ({
  initialRoute = [],
  initialCheckpoints = [],
  initialWaypoints = [],
  onRouteChange,
  onCheckpointsChange,
  onWaypointsChange,
  onStartPointChange,
  onEndPointChange,
  readOnly = false
}) => {
  const [map, setMap] = useState(null)
  const [routePoints, setRoutePoints] = useState(initialRoute) // 路线点（途经点）
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints)
  const [waypoints, setWaypoints] = useState(initialWaypoints)

  // 独立的起点和终点状态
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)

  const [editingMode, setEditingMode] = useState(null) // 'route' | 'checkpoint' | 'waypoint' | 'setStart' | 'setEnd' | null

  // 使用 ref 存储起点终点回调
  const onStartPointChangeRef = useRef(onStartPointChange)
  const onEndPointChangeRef = useRef(onEndPointChange)

  // 使用 ref 存储回调函数，避免依赖变化导致无限循环
  const onRouteChangeRef = useRef(onRouteChange)
  const onCheckpointsChangeRef = useRef(onCheckpointsChange)
  const onWaypointsChangeRef = useRef(onWaypointsChange)

  // 使用 ref 跟踪最新的 editingMode，解决闭包问题（必须在 useState 之后定义）
  const editingModeRef = useRef(null)

  useEffect(() => {
    console.log('✓ RouteEditor 渲染，当前 editingMode：', editingMode)
    // 同步 editingModeRef 的值
    editingModeRef.current = editingMode
  }, [editingMode])
  const [checkpointModalVisible, setCheckpointModalVisible] = useState(false)
  const [editingCheckpoint, setEditingCheckpoint] = useState(null)
  const [checkpointForm, setCheckpointForm] = useState({
    name: '',
    radius: 100,
    sequence: 1,
    isRequired: true,
    type: 2 // 2=途中点
  })

  // 使用 ref 存储初始值，避免空数组导致的无限循环
  const initialRouteRef = useRef(initialRoute)
  const initialCheckpointsRef = useRef(initialCheckpoints)
  const initialWaypointsRef = useRef(initialWaypoints)
  const isInitializedRef = useRef(false)

  // 更新 ref
  useEffect(() => {
    onRouteChangeRef.current = onRouteChange
    onCheckpointsChangeRef.current = onCheckpointsChange
    onWaypointsChangeRef.current = onWaypointsChange
    onStartPointChangeRef.current = onStartPointChange
    onEndPointChangeRef.current = onEndPointChange
  }, [onRouteChange, onCheckpointsChange, onWaypointsChange, onStartPointChange, onEndPointChange])

  // 初始化数据，只在真正有数据时更新
  useEffect(() => {
    if (!isInitializedRef.current) {
      setRoutePoints(initialRoute || [])
      setCheckpoints(initialCheckpoints || [])
      setWaypoints(initialWaypoints || [])
      isInitializedRef.current = true
    } else {
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
    }
  }, [initialRoute, initialCheckpoints, initialWaypoints])

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
          console.log('✓ 执行：添加途经点')
          addWaypoint(e.lnglat)
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

  const addRoutePoint = (lnglat) => {
    const newPoint = {
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    }
    setRoutePoints([...routePoints, newPoint])
  }

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

  const addWaypoint = (lnglat) => {
    const newWaypoint = {
      lng: lnglat.getLng(),
      lat: lnglat.getLat(),
      name: `途经点${waypoints.length + 1}`,
      pointType: 1, // 1=途经点
      sequence: waypoints.length + 1
    }
    setWaypoints([...waypoints, newWaypoint])
    message.success('已添加途经点')
  }

  const showCheckpointModal = (lnglat) => {
    setEditingCheckpoint({
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    })
    setCheckpointForm({
      ...checkpointForm,
      sequence: checkpoints.length + 1
    })
    setCheckpointModalVisible(true)
  }

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

  const clearStartPoint = () => {
    setStartPoint(null)
    message.success('已清空起点')
  }

  const clearEndPoint = () => {
    setEndPoint(null)
    message.success('已清空终点')
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
      }
    })
  }

  const totalDistance = calculateRouteDistance(routePoints)

  // 构建所有标记点（起点 + 终点 + 路线点 + 签到点 + 途经点）
  const allMarkers = useMemo(() => {
    console.log('✓ 重新构建 allMarkers')

    const markers = []

    // 起点
    if (startPoint && window.AMap) {
      console.log('✓ 添加起点标记:', startPoint)
      markers.push({
        ...startPoint,
        title: '起点',
        content: `<div style="padding: 5px;"><strong>起点</strong></div>`,
        offset: new window.AMap.Pixel(-10, -10),
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(25, 34),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png', // 起点图标（绿色）
          imageOffset: new window.AMap.Pixel(-12, -34),
          imageSize: new window.AMap.Size(25, 34)
        })
      })
    }

    // 终点
    if (endPoint && window.AMap) {
      console.log('✓ 添加终点标记:', endPoint)
      markers.push({
        ...endPoint,
        title: '终点',
        content: `<div style="padding: 5px;"><strong>终点</strong></div>`,
        offset: new window.AMap.Pixel(-10, -10),
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(25, 34),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png', // 终点图标（红色）
          imageOffset: new window.AMap.Pixel(-12, -34),
          imageSize: new window.AMap.Size(25, 34)
        })
      })
    }

    // 路线点（途经点）
    routePoints.forEach((point, index) => {
      if (window.AMap) {
        markers.push({
          ...point,
          title: `路线点${index + 1}`,
          content: `<div style="padding: 5px;"><strong>路线点${index + 1}</strong></div>`,
          offset: new window.AMap.Pixel(-10, -10),
          // 路线点使用蓝色图标
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(25, 34),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            imageOffset: new window.AMap.Pixel(-12, -34),
            imageSize: new window.AMap.Size(25, 34)
          })
        })
      }
    })

    // 签到点
    checkpoints.forEach((cp, index) => {
      if (window.AMap) {
        markers.push({
          ...cp,
          title: cp.name,
          content: `<div style="padding: 5px;"><strong>${cp.name}</strong><br/>半径${cp.radius}m</div>`,
          offset: new window.AMap.Pixel(-10, -10),
          // 签到点使用红色图标
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(25, 34),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
            imageOffset: new window.AMap.Pixel(-12, -34),
            imageSize: new window.AMap.Size(25, 34)
          })
        })
      }
    })

    // 途经点
    waypoints.forEach((wp, index) => {
      if (window.AMap) {
        markers.push({
          ...wp,
          title: wp.name,
          content: `<div style="padding: 5px;"><strong>${wp.name}</strong></div>`,
          offset: new window.AMap.Pixel(-10, -10),
          // 途经点使用蓝色图标
          icon: new window.AMap.Icon({
            size: new window.AMap.Size(25, 34),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            imageOffset: new window.AMap.Pixel(-12, -34),
            imageSize: new window.AMap.Size(25, 34)
          })
        })
      }
    })

    console.log('✓ allMarkers 构建完成，数量：', markers.length)
    return markers
  }, [startPoint, endPoint, routePoints, checkpoints, waypoints])

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
                console.log('✓ 将设置为：', editingMode === 'route' ? 'null' : 'route')
                setEditingMode(editingMode === 'route' ? null : 'route')
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
                setEditingMode(editingMode === 'checkpoint' ? null : 'checkpoint')
              }}
              disabled={readOnly}
            >
              添加签到点
            </Button>
            <Button
              type={editingMode === 'waypoint' ? 'primary' : 'default'}
              icon={<PlusOutlined />}
              onClick={() => {
                console.log('✓ 点击添加途经点按钮，当前editingMode：', editingMode)
                setEditingMode(editingMode === 'waypoint' ? null : 'waypoint')
              }}
              disabled={readOnly}
            >
              添加途经点
            </Button>
            {(routePoints.length > 0 || startPoint || endPoint) && !readOnly && (
              <Button danger onClick={clearRoute}>
                清空
              </Button>
            )}
          </div>

          {editingMode && (
            <div className="edit-tip">
              <Tag color="blue">
                {editingMode === 'route' && '点击地图添加路线点'}
                {editingMode === 'setStart' && '点击地图设置起点'}
                {editingMode === 'setEnd' && '点击地图设置终点'}
                {editingMode === 'checkpoint' && '点击地图添加签到点'}
                {editingMode === 'waypoint' && '点击地图添加途经点'}
              </Tag>
            </div>
          )}

          {editingMode && (
            <div className="edit-mode-debug">
              <Tag color="green">当前编辑模式：{editingMode}</Tag>
            </div>
          )}

          {routePoints.length > 0 && (
            <div className="route-stats">
              <Space>
                <span>路线点: <b>{routePoints.length}</b></span>
                <span>签到点: <b>{checkpoints.length}</b></span>
                <span>途经点: <b>{waypoints.length}</b></span>
                <span>总里程: <b>{formatDistance(totalDistance)}</b></span>
              </Space>
            </div>
          )}

          {/* 起点终点显示区域 */}
          {(startPoint || endPoint) && (
            <div className="start-end-points">
              <div className="section-title">起点与终点</div>
              {startPoint && (
                <div className="start-end-item">
                  <Space>
                    <Tag color="green">起点</Tag>
                    <span>{startPoint.name}</span>
                    <span className="coordinate">
                      ({startPoint.lng?.toFixed(4)}, {startPoint.lat?.toFixed(4)})
                    </span>
                    {!readOnly && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={clearStartPoint}
                      >
                        删除
                      </Button>
                    )}
                  </Space>
                </div>
              )}
              {endPoint && (
                <div className="start-end-item">
                  <Space>
                    <Tag color="red">终点</Tag>
                    <span>{endPoint.name}</span>
                    <span className="coordinate">
                      ({endPoint.lng?.toFixed(4)}, {endPoint.lat?.toFixed(4)})
                    </span>
                    {!readOnly && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={clearEndPoint}
                      >
                        删除
                      </Button>
                    )}
                  </Space>
                </div>
              )}
            </div>
          )}

          {checkpoints.length > 0 && (
            <div className="checkpoints-list">
              <div className="section-title">签到点列表</div>
              {checkpoints.map((cp, index) => (
                <div key={index} className="checkpoint-item">
                  <Space>
                    <Tag color="green">序号{cp.sequence}</Tag>
                    <span>{cp.name}</span>
                    <span className="checkpoint-radius">半径{cp.radius}m</span>
                    {!readOnly && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeCheckpoint(index)}
                      >
                        删除
                      </Button>
                    )}
                  </Space>
                </div>
              ))}
            </div>
          )}

          {waypoints.length > 0 && (
            <div className="waypoints-list">
              <div className="section-title">途经点列表</div>
              {waypoints.map((wp, index) => (
                <div key={index} className="waypoint-item">
                  <Space>
                    <span>{wp.name}</span>
                    {!readOnly && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeWaypoint(index)}
                      >
                        删除
                      </Button>
                    )}
                  </Space>
                </div>
              ))}
            </div>
          )}
        </Space>
      </Card>

      <MapView
        center={routePoints.length > 0 ? routePoints[0] : { lng: 116.397428, lat: 39.90923 }}
        height="500px"
        markers={allMarkers}
        routePoints={routePoints}
        onMapLoad={handleMapLoad}
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
    </div>
  )
}

export default RouteEditor

