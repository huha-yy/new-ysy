import { useState, useEffect } from 'react'
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
  readOnly = false
}) => {
  const [map, setMap] = useState(null)
  const [routePoints, setRoutePoints] = useState(initialRoute)
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints)
  const [waypoints, setWaypoints] = useState(initialWaypoints)
  const [editingMode, setEditingMode] = useState(null) // 'route' | 'checkpoint' | 'waypoint' | null
  const [checkpointModalVisible, setCheckpointModalVisible] = useState(false)
  const [editingCheckpoint, setEditingCheckpoint] = useState(null)
  const [checkpointForm, setCheckpointForm] = useState({
    name: '',
    radius: 100,
    sequence: 1,
    isRequired: true,
    type: 2 // 2=途中点
  })

  useEffect(() => {
    setRoutePoints(initialRoute)
    setCheckpoints(initialCheckpoints)
    setWaypoints(initialWaypoints)
  }, [initialRoute, initialCheckpoints, initialWaypoints])

  useEffect(() => {
    if (onRouteChange) {
      onRouteChange(routePoints)
    }
  }, [routePoints])

  useEffect(() => {
    if (onCheckpointsChange) {
      onCheckpointsChange(checkpoints)
    }
  }, [checkpoints])

  useEffect(() => {
    if (onWaypointsChange) {
      onWaypointsChange(waypoints)
    }
  }, [waypoints])

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance)

    // 地图点击事件
    if (!readOnly) {
      mapInstance.on('click', (e) => {
        if (editingMode === 'route') {
          addRoutePoint(e.lnglat)
        } else if (editingMode === 'checkpoint') {
          showCheckpointModal(e.lnglat)
        } else if (editingMode === 'waypoint') {
          addWaypoint(e.lnglat)
        }
      })
    }
  }

  const addRoutePoint = (lnglat) => {
    const newPoint = {
      lng: lnglat.getLng(),
      lat: lnglat.getLat()
    }
    setRoutePoints([...routePoints, newPoint])
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

  const clearRoute = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有路线点吗？',
      onOk: () => {
        setRoutePoints([])
        setCheckpoints([])
        setWaypoints([])
      }
    })
  }

  const totalDistance = calculateRouteDistance(routePoints)

  return (
    <div className="route-editor">
      <Card className="editor-controls">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="edit-mode-buttons">
            <Button
              type={editingMode === 'route' ? 'primary' : 'default'}
              icon={<EnvironmentOutlined />}
              onClick={() => setEditingMode(editingMode === 'route' ? null : 'route')}
              disabled={readOnly}
            >
              绘制路线
            </Button>
            <Button
              type={editingMode === 'checkpoint' ? 'primary' : 'default'}
              icon={<FlagOutlined />}
              onClick={() => setEditingMode(editingMode === 'checkpoint' ? null : 'checkpoint')}
              disabled={readOnly}
            >
              添加签到点
            </Button>
            <Button
              type={editingMode === 'waypoint' ? 'primary' : 'default'}
              icon={<PlusOutlined />}
              onClick={() => setEditingMode(editingMode === 'waypoint' ? null : 'waypoint')}
              disabled={readOnly}
            >
              添加途经点
            </Button>
            {routePoints.length > 0 && !readOnly && (
              <Button danger onClick={clearRoute}>
                清空
              </Button>
            )}
          </div>

          {editingMode && (
            <div className="edit-tip">
              <Tag color="blue">
                {editingMode === 'route' && '点击地图添加路线点'}
                {editingMode === 'checkpoint' && '点击地图添加签到点'}
                {editingMode === 'waypoint' && '点击地图添加途经点'}
              </Tag>
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

