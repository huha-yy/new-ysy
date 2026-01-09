import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, InputNumber, DatePicker, TimePicker, Button, Space, message, Modal, Tag, Alert, Divider, Tooltip, Switch } from 'antd'
import { ArrowLeftOutlined, EnvironmentOutlined, PhoneOutlined, SaveOutlined, SendOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getGatheringPlan, updateGatheringPlan, publishGatheringPlan } from '../../../api/activity'
import MapView from '../../../components/MapView/MapView'
import { generateLocationUrl } from '../../../utils/map'
import dayjs from 'dayjs'
import './GatheringPlan.css'

const { TextArea } = Input
const { RangePicker } = DatePicker

function GatheringPlan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [gathering, setGathering] = useState(null)
  const [form] = Form.useForm()
  const [mapMode, setMapMode] = useState(false) // 是否显示地图选择
  const [selectedLocation, setSelectedLocation] = useState(null) // 地图选中的位置
  const [map, setMap] = useState(null) // 地图实例
  const [searchKeyword, setSearchKeyword] = useState('') // 搜索关键词
  const [searchResults, setSearchResults] = useState([]) // 搜索结果
  const [searchMarkers, setSearchMarkers] = useState([]) // 搜索标记
  const [markers, setMarkers] = useState([]) // 地图标记（当前位置 + 已选位置）

  useEffect(() => {
    fetchGatheringData()
  }, [id])

  // 计算所有标记点
  const getAllMarkers = () => {
    const result = [...searchMarkers]
    if (selectedLocation) {
      result.push({
        lng: selectedLocation.lng,
        lat: selectedLocation.lat,
        title: '当前选点',
        content: selectedLocation.address || '集合地点',
        offset: new window.AMap.Pixel(-10, -35)
      })
    }
    return result
  }

  // 地图初始化
  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance)
    console.log('地图加载完成')
  }

  // 搜索地点
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([])
      return
    }

    try {
      // 使用高德地图搜索插件（需要AMAP_KEY已配置）
      const AMap = window.AMap
      if (!AMap) {
        message.error('地图未加载，请稍后重试')
        return
      }

      const placeSearch = new AMap.PlaceSearch({
        city: '北京', // 可以根据活动地区动态设置
        citylimit: true,
        pageSize: 10
      })

      placeSearch.search(searchKeyword, (status, result) => {
        if (status === 'complete' && result.poiList) {
          const pois = result.poiList.map(poi => ({
            name: poi.name,
            address: poi.address || '',
            lng: poi.location.getLng(),
            lat: poi.location.getLat(),
            tel: poi.tel || ''
          }))
          setSearchResults(pois)
          setSearchMarkers(pois.map(poi => ({
            lng: poi.location.getLng(),
            lat: poi.location.getLat(),
            title: poi.name
          })))
        }
      })
    } catch (error) {
      console.error('搜索失败:', error)
      message.error('搜索失败，请重试')
    }
  }

  // 选择搜索结果
  const handleSelectPoi = (poi) => {
    setSelectedLocation(poi)
    form.setFieldValue('gatheringAddress', poi.address)
    setSearchResults([])
    setSearchMarkers([])
    setSearchKeyword('')
  }

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('')
    setSearchResults([])
    setSearchMarkers([])
  }

  const fetchGatheringData = async () => {
    try {
      setLoading(true)
      const result = await getGatheringPlan(id)
      setGathering(result)
      
      // 设置表单初始值
      if (result) {
        form.setFieldsValue({
          gatheringTime: result.gatheringTime ? dayjs(result.gatheringTime) : null,
          gatheringAddress: result.gatheringAddress,
          organizerPhone: result.organizerPhone,
          transportGuide: result.transportGuide,
          itemsToBring: result.itemsToBring,
          notice: result.notice
        })
        
        // 如果有位置信息，设置选中位置
        if (result.gatheringLatitude && result.gatheringLongitude) {
          setSelectedLocation({
            lng: result.gatheringLongitude,
            lat: result.gatheringLatitude,
            address: result.gatheringAddress
          })
        }
      }
    } catch (error) {
      console.error('获取集合方案失败:', error)
      message.error('获取集合方案失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation({
      lng: location.lng,
      lat: location.lat,
      address: location.address || form.getFieldValue('gatheringAddress')
    })
    form.setFieldValue('gatheringAddress', location.address || form.getFieldValue('gatheringAddress'))
    
    // 清空搜索结果
    setSearchResults([])
    setSearchMarkers([])
    setSearchKeyword('')
    
    // 清空搜索标记（保留已选位置）
    if (selectedLocation) {
      setSearchMarkers([{
        lng: selectedLocation.lng,
        lat: selectedLocation.lat,
        title: '当前选点',
        content: selectedLocation.address || form.getFieldValue('gatheringAddress'),
        offset: new window.AMap.Pixel(-10, -30),
        icon: new window.AMap.Icon({
          type: 'success',
          size: 'md'
        })
      }])
    } else {
      setSearchMarkers([{
        lng: location.lng,
        lat: location.lat,
        title: '当前选点',
        content: location.address || form.getFieldValue('gatheringAddress'),
        offset: new window.AMap.Pixel(-10, -30),
        icon: new window.AMap.Icon({
          type: 'success',
          size: 'md'
        })
      }])
    }
    
    setMapMode(false)
  }

  const handleMapClick = (e) => {
    // 地图点击事件 - 可以在这里实现获取点击位置坐标
    if (map && !isPublished) {
      const { lnglat } = e
      const { lng, lat } = lnglat
      
      // 可以选择地图上的任意位置（可选功能）
      Modal.confirm({
        title: '确认选择此位置',
        content: `经度: ${lng.toFixed(6)}，纬度: ${lat.toFixed(6)}`,
        onOk: () => {
          // 使用高德地图逆地理编码获取地址
          const geocoder = new AMap.Geocoder()
          geocoder.getAddress([lng, lat], (status, result) => {
            if (status === 'complete') {
              setSelectedLocation({
                lng,
                lat,
                address: result.regeocode.formattedAddress
              })
              form.setFieldValue('gatheringAddress', result.regeocode.formattedAddress)
            }
          })
        },
        onCancel: () => {}
      })
    }
  }

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      
      const submitData = {
        gatheringTime: values.gatheringTime ? values.gatheringTime.format('YYYY-MM-DD HH:mm:ss') : null,
        gatheringAddress: values.gatheringAddress,
        gatheringLatitude: selectedLocation?.lat || null,
        gatheringLongitude: selectedLocation?.lng || null,
        transportGuide: values.transportGuide,
        itemsToBring: values.itemsToBring,
        notice: values.notice,
        organizerPhone: values.organizerPhone
      }

      await updateGatheringPlan(id, submitData)
      message.success('保存草稿成功')
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublish = async () => {
    try {
      await form.validateFields()
      setSubmitting(true)
      
      await publishGatheringPlan(id)
      message.success('集合方案发布成功！')
      
      // 刷新数据
      await fetchGatheringData()
    } catch (error) {
      console.error('发布失败:', error)
      message.error('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个集合方案吗？发布后将通知到所有参与者。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        message.info('删除功能待实现')
      }
    })
  }

  const handleBack = () => {
    navigate('/organizer/activities')
  }

  const isPublished = gathering?.isPublished

  if (loading) {
    return (
      <div className="gathering-plan-loading">
        <div className="loading-spinner">加载中...</div>
      </div>
    )
  }

  return (
    <div className="gathering-plan-page">
      <div className="container">
        <Card
          title={
            <Space>
              <span>集合方案管理</span>
              {isPublished && (
                <Tag color="green">已发布</Tag>
              )}
              {!isPublished && (
                <Tag color="default">草稿</Tag>
              )}
            </Space>
          }
          extra={
            <Button
              onClick={handleBack}
              icon={<ArrowLeftOutlined />}
            >
              返回活动
            </Button>
          }
          className="gathering-plan-card"
        >
          {!gathering ? (
            <div className="empty-state">
              <Alert
                message="尚未创建集合方案"
                description="您还没有为此活动创建集合方案，请点击下方按钮创建。"
                type="info"
                showIcon
              />
            </div>
          ) : (
            <>
              {/* 提示信息 */}
              {isPublished && (
                <Alert
                  message="集合方案已发布"
                  description="已发布集合方案将通知到所有报名通过的参与者。如需修改，请联系平台管理员。"
                  type="success"
                  showIcon
                  closable
                  className="publish-alert"
                />
              )}

              <Form
                form={form}
                layout="vertical"
                disabled={isPublished || submitting}
                scrollToFirstError
              >
                <Divider orientation="left">集合时间和地点</Divider>

                <div className="form-section">
                  <div className="form-row">
                    <Form.Item
                      label="集合日期时间"
                      name="gatheringTime"
                      rules={[
                        { required: true, message: '请选择集合日期时间' }
                      ]}
                    >
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        placeholder="请选择集合时间"
                        style={{ width: '100%' }}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        showNow={false}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label="集合地点"
                    name="gatheringAddress"
                    rules={[
                      { required: true, message: '请输入集合地点' }
                    ]}
                  >
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder="请输入集合地点详细地址"
                        readOnly={isPublished}
                      />
                      <Button
                        type="primary"
                        icon={<EnvironmentOutlined />}
                        onClick={() => setMapMode(true)}
                        disabled={isPublished}
                      >
                        地图选点
                      </Button>
                    </Space.Compact>
                  </Form.Item>
                  {selectedLocation && (
                    <div className="selected-location">
                      <Tag icon={<EnvironmentOutlined />} color="blue">
                        已选位置：{selectedLocation.address}
                      </Tag>
                      <Tag color="green">
                        纬度: {selectedLocation.lat.toFixed(6)}，经度: {selectedLocation.lng.toFixed(6)}
                      </Tag>
                    </div>
                  )}
                </div>

                <Form.Item
                  label="组织者联系电话"
                  name="organizerPhone"
                  rules={[
                    { required: true, message: '请输入组织者联系电话' },
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                  ]}
                >
                  <Input
                    placeholder="请输入组织者手机号码"
                    prefix={<PhoneOutlined />}
                    readOnly={isPublished}
                  />
                </Form.Item>

                <Divider orientation="left">活动指引</Divider>

                <div className="form-section">
                  <Form.Item
                    label="交通指引"
                    name="transportGuide"
                    rules={[
                      { required: true, message: '请填写交通指引' }
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请填写交通方式（如：公交、地铁、自驾）、线路说明等..."
                      maxLength={500}
                      showCount
                      readOnly={isPublished}
                    />
                  </Form.Item>
                </div>

                <div className="form-section">
                  <Form.Item
                    label="携带物品清单"
                    name="itemsToBring"
                    rules={[
                      { required: true, message: '请填写携带物品清单' }
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请列出参与者需要携带的物品，如：身份证、水、食物、防晒霜、雨具等..."
                      maxLength={500}
                      showCount
                      readOnly={isPublished}
                    />
                  </Form.Item>
                </div>

                <div className="form-section">
                  <Form.Item
                    label="注意事项"
                    name="notice"
                    rules={[
                      { required: true, message: '请填写注意事项' }
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="请填写活动当天的注意事项，如：天气情况、安全提示、集合地点特征等..."
                      maxLength={500}
                      showCount
                      readOnly={isPublished}
                    />
                  </Form.Item>
                </div>

                <Divider orientation="left">发布信息</Divider>

                <div className="form-section">
                  <Form.Item label="发布状态">
                    <Space>
                      <Tag color={isPublished ? 'green' : 'default'} icon={isPublished ? <SendOutlined /> : <EditOutlined />}>
                        {isPublished ? '已发布' : '草稿'}
                      </Tag>
                      {isPublished && gathering.publishTime && (
                        <span className="publish-time">
                          发布时间: {dayjs(gathering.publishTime).format('YYYY-MM-DD HH:mm')}
                        </span>
                      )}
                    </Space>
                  </Form.Item>
                </div>
              </Form>

              {/* 地图选择模态框 */}
              <Modal
                title="选择集合地点"
                open={mapMode}
                onCancel={() => {
                  setMapMode(false)
                  setSearchResults([])
                  setSearchMarkers([])
                  setSearchKeyword('')
                }}
                width={1000}
                footer={[
                  <Button onClick={() => {
                    setMapMode(false)
                    setSearchResults([])
                    setSearchMarkers([])
                    setSearchKeyword('')
                  }}>
                    取消
                  </Button>,
                  <Button
                    type="primary"
                    onClick={() => {
                      setMapMode(false)
                    }}
                    disabled={!selectedLocation}
                  >
                    确认选择
                  </Button>
                ]}
              >
                {/* 搜索栏 */}
                <div className="map-search">
                  <Space.Compact style={{ width: '100%' }}>
                    <Input
                      size="large"
                      placeholder="搜索地点（如：北京西站、颐和园）"
                      prefix={<SearchOutlined />}
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onPressEnter={handleSearch}
                      style={{ flex: 1 }}
                      allowClear
                    />
                    {searchResults.length > 0 && (
                      <Button
                        icon={<CloseCircleOutlined />}
                        onClick={handleClearSearch}
                      >
                        清空
                      </Button>
                    )}
                  </Space.Compact>
                </div>

                {/* 地图容器 */}
                <div className="map-selection-container">
                  {map ? (
                    <MapView
                      center={selectedLocation ? {
                        lng: selectedLocation.lng,
                        lat: selectedLocation.lat
                      } : {
                        lng: 116.397428,
                        lat: 39.90923
                      }}
                      zoom={13}
                      height="500px"
                      onMapLoad={handleMapLoad}
                      showCurrentLocation={true}
                      markers={getAllMarkers()}
                    />
                  ) : (
                    <div className="map-placeholder-loading">
                      <div className="loading-spinner">地图加载中...</div>
                    </div>
                  )}
                </div>

                {/* 搜索结果列表 */}
                {searchResults.length > 0 && (
                  <div className="search-results">
                    <div className="search-results-header">
                      <span>搜索结果（{searchResults.length}条）</span>
                      <Button type="text" size="small" onClick={handleClearSearch}>
                        清空
                      </Button>
                    </div>
                    <div className="search-results-list">
                      {searchResults.map((poi, index) => (
                        <div
                          key={index}
                          className={`search-result-item ${selectedLocation?.name === poi.name ? 'selected' : ''}`}
                          onClick={() => handleSelectPoi(poi)}
                        >
                          <div className="search-result-icon">
                            <EnvironmentOutlined />
                          </div>
                          <div className="search-result-info">
                            <div className="search-result-name">{poi.name}</div>
                            <div className="search-result-address">{poi.address || '未知地址'}</div>
                            {poi.tel && (
                              <div className="search-result-phone">
                                <PhoneOutlined /> {poi.tel}
                              </div>
                            )}
                          </div>
                          <div className="search-result-action">
                            {selectedLocation && selectedLocation.name === poi.name ? (
                              <Tooltip title="已选择">
                                <CheckCircleOutlined />
                              </Tooltip>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 提示信息 */}
                {searchResults.length === 0 && (
                  <div className="map-tips">
                    <div className="tip-item">
                      <EnvironmentOutlined />
                      <div>
                        <div className="tip-title">点击地图选择位置</div>
                        <div className="tip-desc">在地图上点击任意位置，系统会自动获取地址</div>
                      </div>
                    </div>
                    <div className="tip-item">
                      <SearchOutlined />
                      <div>
                        <div className="tip-title">搜索地点</div>
                        <div className="tip-desc">使用上方搜索框查找知名地点</div>
                      </div>
                    </div>
                  </div>
                )}
              </Modal>

              {/* 操作按钮 */}
              <div className="form-actions">
                <Space size="large">
                  {!isPublished && (
                    <Button
                      size="large"
                      icon={<SaveOutlined />}
                      onClick={handleSaveDraft}
                      loading={submitting}
                    >
                      保存草稿
                    </Button>
                  )}
                  
                  {!isPublished && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      onClick={handlePublish}
                      loading={submitting}
                    >
                      发布集合方案
                    </Button>
                  )}

                  <Button
                    size="large"
                    onClick={handleBack}
                  >
                    返回
                  </Button>
                </Space>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default GatheringPlan
