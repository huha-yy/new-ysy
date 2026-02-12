import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, InputNumber, DatePicker, TimePicker, Button, Space, message, Modal, Tag, Alert, Divider, Tooltip, Switch, AutoComplete } from 'antd'
import { ArrowLeftOutlined, EnvironmentOutlined, PhoneOutlined, SaveOutlined, SendOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getGatheringPlan, createGatheringPlan, updateGatheringPlan, publishGatheringPlan } from '../../../api/activity'
import MapView from '../../../components/MapView/MapView'
import { generateLocationUrl, loadAmapScript } from '../../../utils/map'
import { DEFAULT_MAP_CENTER } from '../../../utils/constants'
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
  const [mapMode, setMapMode] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [map, setMap] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchMarkers, setSearchMarkers] = useState([])
  const [markers, setMarkers] = useState([])
  const [addressOptions, setAddressOptions] = useState([])
  const [addressPois, setAddressPois] = useState([])
  const searchTimerRef = useRef(null)

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
  }

  // 搜索地点
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setSearchResults([])
      return
    }

    const AMap = window.AMap
    if (!AMap) {
      message.error('地图未加载，请稍后重试')
      return
    }

    // 动态加载 PlaceSearch 插件
    AMap.plugin(['AMap.PlaceSearch'], () => {
      const placeSearch = new AMap.PlaceSearch({
        pageSize: 10
      })

      placeSearch.search(searchKeyword, (status, result) => {
        console.log('PlaceSearch status:', status, 'result:', result)
        if (status === 'complete') {
          // 兼容不同版本的返回结构
          const poiList = result.poiList?.pois || result.poiList || []
          if (poiList.length > 0) {
            const pois = poiList.map(poi => ({
              name: poi.name,
              address: poi.address || '',
              lng: typeof poi.location?.getLng === 'function' ? poi.location.getLng() : poi.location?.lng || poi.lng,
              lat: typeof poi.location?.getLat === 'function' ? poi.location.getLat() : poi.location?.lat || poi.lat,
              tel: poi.tel || ''
            }))
            setSearchResults(pois)
            setSearchMarkers(pois.map(p => ({
              lng: p.lng,
              lat: p.lat,
              title: p.name
            })))
            return
          }
        }
        setSearchResults([])
        message.info('未找到相关地点，请换个关键词试试')
      })
    })
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

  // 地址输入框搜索建议（防抖）
  const handleAddressSearch = (value) => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current)
    }
    if (!value || value.trim().length < 2) {
      setAddressOptions([])
      setAddressPois([])
      return
    }
    searchTimerRef.current = setTimeout(async () => {
      const AMap = window.AMap
      if (!AMap) {
        await loadAmapScript()
      }
      window.AMap.plugin(['AMap.PlaceSearch'], () => {
        const placeSearch = new window.AMap.PlaceSearch({ pageSize: 6 })
        placeSearch.search(value, (status, result) => {
          if (status === 'complete') {
            const poiList = result.poiList?.pois || result.poiList || []
            const pois = poiList.map(poi => ({
              name: poi.name,
              address: poi.address || '',
              lng: typeof poi.location?.getLng === 'function' ? poi.location.getLng() : poi.location?.lng || poi.lng,
              lat: typeof poi.location?.getLat === 'function' ? poi.location.getLat() : poi.location?.lat || poi.lat
            }))
            setAddressPois(pois)
            setAddressOptions(pois.map((poi, idx) => ({
              value: poi.address || poi.name,
              key: idx,
              label: (
                <div className="address-option-item">
                  <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  <div>
                    <div className="address-option-name">{poi.name}</div>
                    <div className="address-option-addr">{poi.address || '未知地址'}</div>
                  </div>
                </div>
              )
            })))
          } else {
            setAddressOptions([])
            setAddressPois([])
          }
        })
      })
    }, 400)
  }

  // 选择地址建议
  const handleAddressSelect = (value, option) => {
    const poi = addressPois[option.key]
    if (poi) {
      setSelectedLocation({
        lng: poi.lng,
        lat: poi.lat,
        address: value
      })
      form.setFieldValue('gatheringAddress', value)
    }
    setAddressOptions([])
    setAddressPois([])
  }

  const fetchGatheringData = async () => {
    try {
      setLoading(true)
      const result = await getGatheringPlan(id)
      console.log('获取集合方案结果:', result)
      setGathering(result)

      if (result) {
        form.setFieldsValue({
          gatheringTime: result.gatheringTime ? dayjs(result.gatheringTime) : null,
          gatheringAddress: result.gatheringAddress,
          organizerPhone: result.organizerPhone,
          transportGuide: result.transportGuide,
          itemsToBring: result.itemsToBring,
          notice: result.notice
        })

        if (result.gatheringLatitude && result.gatheringLongitude) {
          setSelectedLocation({
            lng: result.gatheringLongitude,
            lat: result.gatheringLatitude,
            address: result.gatheringAddress
          })
        }
      }
    } catch (error) {
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
    setSearchResults([])
    setSearchMarkers([])
    setSearchKeyword('')

    if (selectedLocation) {
      setSearchMarkers([{
        lng: selectedLocation.lng,
        lat: selectedLocation.lat,
        title: '当前选点',
        content: selectedLocation.address || form.getFieldValue('gatheringAddress'),
        offset: new window.AMap.Pixel(-10, -30),
        icon: new window.AMap.Icon({ type: 'success', size: 'md' })
      }])
    } else {
      setSearchMarkers([{
        lng: location.lng,
        lat: location.lat,
        title: '当前选点',
        content: location.address || form.getFieldValue('gatheringAddress'),
        offset: new window.AMap.Pixel(-10, -30),
        icon: new window.AMap.Icon({ type: 'success', size: 'md' })
      }])
    }

    setMapMode(false)
  }

  const handleMapClick = (e) => {
    if (!isPublished) {
      const lnglat = e.lnglat
      const lng = typeof lnglat.getLng === 'function' ? lnglat.getLng() : lnglat.lng
      const lat = typeof lnglat.getLat === 'function' ? lnglat.getLat() : lnglat.lat

      Modal.confirm({
        title: '确认选择此位置',
        content: `经度: ${lng.toFixed(6)}，纬度: ${lat.toFixed(6)}`,
        onOk: () => {
          const AMap = window.AMap
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

  // 构建提交数据
  const buildSubmitData = (values) => ({
    gatheringTime: values.gatheringTime ? values.gatheringTime.format('YYYY-MM-DDTHH:mm:ss') : null,
    gatheringAddress: values.gatheringAddress,
    gatheringLatitude: selectedLocation?.lat || null,
    gatheringLongitude: selectedLocation?.lng || null,
    transportGuide: values.transportGuide,
    itemsToBring: values.itemsToBring,
    notice: values.notice,
    organizerPhone: values.organizerPhone
  })

  const handleCreate = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      const data = buildSubmitData(values)
      console.log('创建集合方案，提交数据:', data)
      await createGatheringPlan(id, data)
      message.success('集合方案创建成功')
      await fetchGatheringData()
    } catch (error) {
      console.error('创建集合方案失败:', error)
      if (error.errorFields) return
      message.error(error.message || '创建失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      await updateGatheringPlan(id, buildSubmitData(values))
      message.success('保存草稿成功')
    } catch (error) {
      if (error.errorFields) return
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
      await fetchGatheringData()
    } catch (error) {
      if (error.errorFields) return
      message.error('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate('/organizer/activities')
  }

  const closeMapModal = () => {
    setMapMode(false)
    setSearchResults([])
    setSearchMarkers([])
    setSearchKeyword('')
  }

  const isPublished = gathering?.isPublished
  const isCreateMode = !gathering

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
              {isCreateMode ? (
                <Tag color="orange">新建</Tag>
              ) : isPublished ? (
                <Tag color="green">已发布</Tag>
              ) : (
                <Tag color="default">草稿</Tag>
              )}
            </Space>
          }
          extra={
            <Button onClick={handleBack} icon={<ArrowLeftOutlined />}>
              返回活动
            </Button>
          }
          className="gathering-plan-card"
        >
          {/* 顶部提示 */}
          {isCreateMode && (
            <Alert
              message="尚未创建集合方案"
              description="您还没有为此活动创建集合方案，请填写以下信息并保存。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}
          {!isCreateMode && isPublished && (
            <Alert
              message="集合方案已发布"
              description="已发布集合方案将通知到所有报名通过的参与者。如需修改，请联系平台管理员。"
              type="success"
              showIcon
              closable
              className="publish-alert"
            />
          )}

          {/* 统一表单（创建和编辑共用） */}
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
                  rules={[{ required: true, message: '请选择集合日期时间' }]}
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
                rules={[{ required: true, message: '请输入集合地点' }]}
              >
                <Space.Compact style={{ width: '100%' }}>
                  <AutoComplete
                    options={addressOptions}
                    onSearch={handleAddressSearch}
                    onSelect={handleAddressSelect}
                    disabled={isPublished}
                    style={{ flex: 1 }}
                  >
                    <Input
                      placeholder="输入地名搜索或点击右侧地图选点"
                      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                      readOnly={isPublished}
                    />
                  </AutoComplete>
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
                <div className="selected-location-card">
                  <div className="selected-location-map">
                    <MapView
                      center={{ lng: selectedLocation.lng, lat: selectedLocation.lat }}
                      zoom={15}
                      height="180px"
                      markers={[{
                        lng: selectedLocation.lng,
                        lat: selectedLocation.lat,
                        title: '集合地点'
                      }]}
                      allowCenterChange={true}
                    />
                  </div>
                  <div className="selected-location-info">
                    <div className="selected-location-address">
                      <EnvironmentOutlined />
                      <span>{selectedLocation.address}</span>
                    </div>
                    <div className="selected-location-coords">
                      经度 {selectedLocation.lng.toFixed(6)}，纬度 {selectedLocation.lat.toFixed(6)}
                    </div>
                  </div>
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
                rules={[{ required: true, message: '请填写交通指引' }]}
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
                rules={[{ required: true, message: '请填写携带物品清单' }]}
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
                rules={[{ required: true, message: '请填写注意事项' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="请填写活动当天��注意事项，如：天气情况、安全提示、集合地点特征等..."
                  maxLength={500}
                  showCount
                  readOnly={isPublished}
                />
              </Form.Item>
            </div>

            {/* 发布状态（仅编辑模式显示） */}
            {!isCreateMode && (
              <>
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
              </>
            )}
          </Form>

          {/* 操作按钮 */}
          <div className="form-actions">
            <Space size="large">
              {isCreateMode ? (
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleCreate}
                  loading={submitting}
                >
                  创建集合方案
                </Button>
              ) : (
                <>
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
                </>
              )}
              <Button size="large" onClick={handleBack}>
                返回
              </Button>
            </Space>
          </div>
        </Card>

        {/* 地图选择模态框（创建和编辑共用） */}
        <Modal
          title="选择集合地点"
          open={mapMode}
          onCancel={closeMapModal}
          width={1000}
          footer={[
            <Button key="cancel" onClick={closeMapModal}>
              取消
            </Button>,
            <Button
              key="confirm"
              type="primary"
              onClick={closeMapModal}
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
            <MapView
              center={selectedLocation ? {
                lng: selectedLocation.lng,
                lat: selectedLocation.lat
              } : DEFAULT_MAP_CENTER}
              zoom={13}
              height="500px"
              onMapLoad={handleMapLoad}
              onMapClick={handleMapClick}
              showCurrentLocation={true}
              markers={getAllMarkers()}
            />
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
      </div>
    </div>
  )
}

export default GatheringPlan
