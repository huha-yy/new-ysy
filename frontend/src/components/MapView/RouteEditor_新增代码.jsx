/**
 * RouteEditor组件新增功能代码片段
 * 需要插入到RouteEditor.jsx的相应位置
 */

// ========================================
// 1. 新的处理函数（插入到showCheckpointModal函数后）
// ========================================

// 显示风险点Modal
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

// 添加风险点
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

// 显示休息点Modal
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

// 添加休息点
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

// 显示补给点Modal
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

// 添加补给点
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

// 删除函数
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

// ========================================
// 2. 新的标记样式（添加到createCustomMarkerContent函数中的switch语句）
// ========================================

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

// ========================================
// 3. 在allMarkers的useMemo中添加（在waypoints.forEach后面）
// ========================================

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

// ========================================
// 4. 更新allMarkers的依赖项数组
// ========================================
}, [startPoint, endPoint, routePoints, checkpoints, waypoints, riskPoints, restPoints, supplyPoints])

// ========================================
// 5. 新的UI按钮（添加到"添加途经点"按钮后面）
// ========================================

<Button
  type={editingMode === 'riskPoint' ? 'primary' : 'default'}
  icon={<EnvironmentOutlined />}
  onClick={() => {
    console.log('🔵 点击添加风险点按钮')
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
    console.log('🔵 点击添加休息点按钮')
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
    console.log('🔵 点击添加补给点按钮')
    if (editingMode !== 'supplyPoint') {
      setEditingMode('supplyPoint')
    }
  }}
  disabled={readOnly}
>
  添加补给点
</Button>

// ========================================
// 6. 新的编辑提示（添加到editingMode提示中）
// ========================================

{editingMode === 'riskPoint' && '点击地图连续添加风险点，完成后点击"完成编辑"'}
{editingMode === 'restPoint' && '点击地图连续添加休息点，完成后点击"完成编辑"'}
{editingMode === 'supplyPoint' && '点击地图连续添加补给点，完成后点击"完成编辑"'}

// ========================================
// 7. 新的统计显示（添加到route-stats-card中）
// ========================================

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

// ========================================
// 8. 新的Modal对话框（添加到签到点Modal后面）
// ========================================

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

// ========================================
// 9. 新的点位列表Card（添加到waypoints-card后面）
// ========================================

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

// ========================================
// 10. 需要导入的组件（在文件顶部）
// ========================================
import { Select } from 'antd'
