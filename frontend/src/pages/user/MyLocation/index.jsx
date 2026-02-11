import { useState, useEffect, useRef } from 'react'
import { Card, Button, Space, Tag, Alert, Descriptions, Spin, message, Modal } from 'antd'
import {
  EnvironmentOutlined,
  ReloadOutlined,
  AimOutlined,
  CompassOutlined,
  WarningOutlined
} from '@ant-design/icons'
import MapView from '../../../components/MapView/MapView'
import { getLocation, getBrowserLocation, forceGpsLocation } from '../../../utils/location'
import { getAmapLocation, calculateDistance } from '../../../utils/map'
import './MyLocation.css'

function MyLocation() {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [mapZoom, setMapZoom] = useState(15)
  const [compareResults, setCompareResults] = useState(null)
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    handleLocate()
  }, [])

  // 默认定位（高德优先）
  const handleLocate = async () => {
    try {
      setLocating(true)
      setLocationError(null)
      const location = await getLocation()
      setCurrentLocation(location)
    } catch (error) {
      setLocationError(error.message)
      setCurrentLocation(null)
    } finally {
      setLocating(false)
    }
  }

  // 强制GPS定位
  const handleForceGps = async () => {
    try {
      setLocating(true)
      setLocationError(null)
      const location = await forceGpsLocation()
      setCurrentLocation(location)
      message.success(`GPS定位成功，精度 ±${Math.round(location.accuracy)}米`)
    } catch (error) {
      setLocationError(error.message)
      message.error(error.message)
    } finally {
      setLocating(false)
    }
  }

  // 多种定位方式对比
  const handleCompare = async () => {
    setComparing(true)
    const results = []

    // 高德定位
    try {
      if (!window.AMap) {
        const { loadAmapScript } = await import('../../../utils/map')
        await loadAmapScript()
      }
      const amap = await getAmapLocation()
      results.push({ method: '高德定位', success: true, ...amap, coordinateSystem: 'GCJ02 (原生)' })
    } catch (e) {
      results.push({ method: '高德定位', success: false, error: e.message })
    }

    // 浏览器定位
    try {
      const browser = await getBrowserLocation()
      results.push({ method: '浏览器定位', success: true, ...browser })
    } catch (e) {
      results.push({ method: '浏览器定位', success: false, error: e.message })
    }

    // 强制GPS
    try {
      const gps = await forceGpsLocation()
      results.push({ method: '强制GPS', success: true, ...gps })
    } catch (e) {
      results.push({ method: '强制GPS', success: false, error: e.message })
    }

    // 计算各方式之间的偏差
    const successResults = results.filter(r => r.success)
    if (successResults.length >= 2) {
      for (let i = 0; i < successResults.length; i++) {
        for (let j = i + 1; j < successResults.length; j++) {
          const dist = calculateDistance(
            successResults[i].latitude, successResults[i].longitude,
            successResults[j].latitude, successResults[j].longitude
          )
          successResults[i].deviations = successResults[i].deviations || []
          successResults[i].deviations.push({
            target: successResults[j].method,
            distance: Math.round(dist)
          })
          successResults[j].deviations = successResults[j].deviations || []
          successResults[j].deviations.push({
            target: successResults[i].method,
            distance: Math.round(dist)
          })
        }
      }
    }

    setCompareResults(results)
    setComparing(false)
  }

  const getAccuracyTag = (accuracy) => {
    if (!accuracy) return <Tag>未知</Tag>
    if (accuracy <= 30) return <Tag color="success">极高 (±{Math.round(accuracy)}米)</Tag>
    if (accuracy <= 100) return <Tag color="processing">良好 (±{Math.round(accuracy)}米)</Tag>
    if (accuracy <= 500) return <Tag color="warning">较低 (±{Math.round(accuracy)}米)</Tag>
    return <Tag color="error">很差 (±{Math.round(accuracy)}米)</Tag>
  }

  return (
    <div className="my-location-page">
      <div className="container">
        <Card
          title={<span><EnvironmentOutlined /> 当前位置</span>}
          extra={
            <Space wrap>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleLocate}
                loading={locating}
              >
                重新定位
              </Button>
              <Button
                icon={<AimOutlined />}
                onClick={handleForceGps}
                loading={locating}
              >
                强制GPS
              </Button>
              <Button
                icon={<CompassOutlined />}
                onClick={handleCompare}
                loading={comparing}
              >
                定位对比
              </Button>
            </Space>
          }
        >
          {/* 地图 */}
          <div className="location-map-section">
            <MapView
              center={currentLocation ? {
                lng: currentLocation.longitude,
                lat: currentLocation.latitude
              } : undefined}
              zoom={mapZoom}
              height="450px"
              showCurrentLocation={true}
              markers={currentLocation ? [{
                lng: currentLocation.longitude,
                lat: currentLocation.latitude,
                title: '我的位置',
                content: '<div style="background:#1890ff;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;">我在这里</div>'
              }] : []}
            />
          </div>

          {/* 定位中 */}
          {locating && !currentLocation && (
            <div className="location-loading">
              <Spin tip="正在定位..." />
            </div>
          )}

          {/* 定位错误 */}
          {locationError && !currentLocation && (
            <Alert
              message="定位失败"
              description={locationError}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
              action={
                <Button size="small" onClick={handleLocate}>重试</Button>
              }
            />
          )}

          {/* 位置详情 */}
          {currentLocation && (
            <Card type="inner" title="位置详情" style={{ marginTop: 16 }}>
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item label="纬度">{currentLocation.latitude?.toFixed(6)}</Descriptions.Item>
                <Descriptions.Item label="经度">{currentLocation.longitude?.toFixed(6)}</Descriptions.Item>
                <Descriptions.Item label="定位方式">
                  <Tag color={currentLocation.method === 'amap' ? 'green' : currentLocation.method === 'force-gps' ? 'blue' : 'default'}>
                    {currentLocation.method === 'amap' ? '高德定位' :
                     currentLocation.method === 'force-gps' ? '强制GPS' :
                     currentLocation.method === 'browser' ? '浏览器定位' :
                     currentLocation.method || '未知'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="定位精度">
                  {getAccuracyTag(currentLocation.accuracy)}
                </Descriptions.Item>
                <Descriptions.Item label="坐标系">
                  {currentLocation.coordinateSystem || 'GCJ02'}
                </Descriptions.Item>
                {currentLocation.address && (
                  <Descriptions.Item label="地址" span={2}>
                    {currentLocation.address}
                  </Descriptions.Item>
                )}
                {currentLocation.originalLatitude && (
                  <Descriptions.Item label="原始坐标(WGS84)" span={2}>
                    {currentLocation.originalLatitude?.toFixed(6)}, {currentLocation.originalLongitude?.toFixed(6)}
                  </Descriptions.Item>
                )}
                {currentLocation.diagnostics && (
                  <>
                    <Descriptions.Item label="定位源">
                      {currentLocation.diagnostics.source}
                    </Descriptions.Item>
                    <Descriptions.Item label="响应时间">
                      {currentLocation.diagnostics.responseTime}ms
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>

              {currentLocation.accuracy && currentLocation.accuracy > 100 && (
                <Alert
                  message="定位精度较低"
                  description="当前定位精度较低，建议到空旷处或开启GPS后重新定位。签到时可能会因精度不足导致失败。"
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginTop: 12 }}
                />
              )}
            </Card>
          )}

          {/* 定位对比结果 */}
          {compareResults && (
            <Card type="inner" title="定位方式对比" style={{ marginTop: 16 }}>
              <div className="compare-results">
                {compareResults.map((result, index) => (
                  <div key={index} className="compare-item">
                    <div className="compare-header">
                      <span className="compare-method">{result.method}</span>
                      {result.success
                        ? <Tag color="success">成功</Tag>
                        : <Tag color="error">失败</Tag>
                      }
                    </div>
                    {result.success ? (
                      <div className="compare-body">
                        <div>坐标: {result.latitude?.toFixed(6)}, {result.longitude?.toFixed(6)}</div>
                        <div>精度: {getAccuracyTag(result.accuracy)}</div>
                        <div>坐标系: {result.coordinateSystem || 'GCJ02'}</div>
                        {result.address && <div>地址: {result.address}</div>}
                        {result.deviations && result.deviations.length > 0 && (
                          <div className="compare-deviations">
                            {result.deviations.map((d, i) => (
                              <Tag key={i} color={d.distance > 200 ? 'error' : d.distance > 50 ? 'warning' : 'success'}>
                                与{d.target}偏差: {d.distance}米
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="compare-error">{result.error}</div>
                    )}
                  </div>
                ))}
              </div>
              <Alert
                message="对比说明"
                description="各定位方式偏差 < 50米为正常；50-200米需注意；> 200米可能存在坐标系转换问题。签到时建议使用偏差最小的定位方式。"
                type="info"
                showIcon
                style={{ marginTop: 12 }}
              />
            </Card>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MyLocation
