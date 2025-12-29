import { useEffect, useRef, useState } from 'react'
import { loadAmapScript } from '../../utils/map'
import { Spin } from 'antd'
import './MapView.css'

/**
 * 高德地图基础组件
 * @param {Object} props
 * @param {number} props.center - 地图中心 {lng, lat}
 * @param {number} props.zoom - 缩放级别
 * @param {number} props.width - 宽度
 * @param {number} props.height - 高度
 * @param {Function} props.onMapLoad - 地图加载完成回调
 * @param {Array} props.markers - 标记点数组
 * @param {Array} props.routePoints - 路线点数组（用于绘制连线）
 * @param {boolean} props.showCurrentLocation - 是否显示当前位置
 * @param {Function} props.onMarkerClick - 标记点击回调
 */
const MapView = ({
  center = { lng: 116.397428, lat: 39.90923 },
  zoom = 13,
  width = '100%',
  height = '400px',
  onMapLoad,
  markers = [],
  routePoints = [],
  showCurrentLocation = false,
  onMarkerClick,
  children
}) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const routeLineRef = useRef(null)

  useEffect(() => {
    initMap()
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy()
        mapInstance.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setCenter([center.lng, center.lat])
    }
  }, [center])

  useEffect(() => {
    if (mapInstance.current && zoom) {
      mapInstance.current.setZoom(zoom)
    }
  }, [zoom])

  useEffect(() => {
    if (mapInstance.current) {
      renderMarkers() // 即使 markers 为空也要调用，以便清除旧标记
    }
  }, [markers])

  useEffect(() => {
    if (mapInstance.current && routePoints && routePoints.length > 0) {
      renderRouteLine()
    } else if (mapInstance.current && routePoints && routePoints.length === 0 && routeLineRef.current) {
      // 清除路线线
      routeLineRef.current.setMap(null)
      routeLineRef.current = null
    }
  }, [routePoints])

  useEffect(() => {
    if (showCurrentLocation && mapInstance.current) {
      showCurrentPosition()
    }
  }, [showCurrentLocation])

  const initMap = async () => {
    try {
      setLoading(true)
      await loadAmapScript()

      if (!mapRef.current) return

      // 创建地图实例
      mapInstance.current = new AMap.Map(mapRef.current, {
        zoom,
        center: [center.lng, center.lat],
        viewMode: '2D',
        mapStyle: 'amap://styles/normal'
      })

      // 添加控件
      mapInstance.current.addControl(new AMap.Scale())
      mapInstance.current.addControl(new AMap.ToolBar())

      setLoading(false)

      // 触发地图加载完成回调
      if (onMapLoad) {
        onMapLoad(mapInstance.current)
      }
    } catch (error) {
      console.error('地图初始化失败:', error)
      setLoading(false)
    }
  }

  const showCurrentPosition = async () => {
    try {
      const AMap = window.AMap
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        showButton: false,
        showMarker: true,
        showCircle: true,
        zoomToAccuracy: true
      })

      mapInstance.current.addControl(geolocation)
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          setCurrentLocation({
            lat: result.position.lat,
            lng: result.position.lng
          })
        }
      })
    } catch (error) {
      console.error('获取当前位置失败:', error)
    }
  }

  const renderMarkers = () => {
    if (!mapInstance.current) {
      console.log('⚠️ 地图实例不存在，无法渲染标记')
      return
    }

    const AMap = window.AMap
    console.log(`✓ 开始渲染 ${markers.length} 个标记点`)

    // 清除旧的标记点 - 使用正确的方法
    try {
      const allOverlays = mapInstance.current.getAllOverlays()
      if (allOverlays && allOverlays.length > 0) {
        allOverlays.forEach(overlay => {
          if (overlay instanceof AMap.Marker) {
            overlay.setMap(null)
          }
        })
        console.log('✓ 已清除旧的标记点')
      }
    } catch (error) {
      console.error('⚠️ 清除标记点时出错:', error)
    }

    // 渲染新的标记点
    markers.forEach((markerData, index) => {
      console.log(`✓ 渲染标记点 ${index + 1}:`, {
        position: [markerData.lng, markerData.lat],
        title: markerData.title
      })

      try {
        const marker = new AMap.Marker({
          position: [markerData.lng, markerData.lat],
          title: markerData.title || `标记${index + 1}`,
          content: markerData.content,
          offset: markerData.offset || new AMap.Pixel(-10, -10),
          icon: markerData.icon
        })

        if (onMarkerClick) {
          marker.on('click', () => {
            onMarkerClick(markerData, index)
          })
        }

        marker.setMap(mapInstance.current)
      } catch (error) {
        console.error(`⚠️ 渲染标记点 ${index + 1} 失败:`, error)
      }
    })

    console.log('✓ 所有标记点渲染完成')
  }

  const renderRouteLine = () => {
    if (!mapInstance.current) {
      console.log('⚠️ 地图实例不存在，无法绘制路线')
      return
    }

    const AMap = window.AMap
    console.log(`✓ 开始绘制路线，路线点数量: ${routePoints ? routePoints.length : 0}`)

    // 清除旧的路线线
    if (routeLineRef.current) {
      routeLineRef.current.setMap(null)
      routeLineRef.current = null
      console.log('✓ 已清除旧路线')
    }

    // 如果有路线点，绘制新的路线线
    if (routePoints && routePoints.length >= 2) {
      try {
        const path = routePoints.map(point => {
          console.log(`  路线点: [${point.lng}, ${point.lat}]`)
          return [point.lng, point.lat]
        })

        routeLineRef.current = new AMap.Polyline({
          path: path,
          strokeColor: '#1890ff',
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          showDir: true
        })

        routeLineRef.current.setMap(mapInstance.current)

        // 自动调整地图视野以显示完整路线
        const bounds = new AMap.Bounds()
        path.forEach(point => bounds.extend(point))
        mapInstance.current.setBounds(bounds)

        console.log('✓ 路线绘制成功')
      } catch (error) {
        console.error('⚠️ 绘制路线时出错:', error)
      }
    } else if (routePoints && routePoints.length === 1) {
      console.log('⚠️ 路线点只有1个，无法绘制路线线')
    }
  }

  return (
    <div className="map-view-wrapper" style={{ width, height }}>
      {loading && (
        <div className="map-loading">
          <Spin size="large" />
          <div className="loading-text">地图加载中...</div>
        </div>
      )}
      <div ref={mapRef} className="map-container" />
      {children}
    </div>
  )
}

export default MapView

