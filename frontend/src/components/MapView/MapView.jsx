import { useEffect, useRef, useState } from 'react'
import { loadAmapScript } from '../../utils/map'
import { DEFAULT_MAP_CENTER } from '../../utils/constants'
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
 * @param {boolean} props.autoFitView - 是否在绘制路线时自动调整视野（默认false，避免打断用户操作）
 * @param {boolean} props.allowCenterChange - 是否允许动态改变地图中心（默认true）
 */
const MapView = ({
  center = DEFAULT_MAP_CENTER,
  zoom = 13,
  width = '100%',
  height = '400px',
  onMapLoad,
  markers = [],
  routePoints = [],
  showCurrentLocation = false,
  onMarkerClick,
  autoFitView = false,
  allowCenterChange = true,
  children
}) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)
  const routeLineRef = useRef(null)
  // 用 ref 保存最新的 markers 和 routePoints，解决 initMap 异步闭包拿不到最新值的问题
  const markersRef = useRef(markers)
  const routePointsRef = useRef(routePoints)
  const onMarkerClickRef = useRef(onMarkerClick)

  // 同步 ref 到最新值
  useEffect(() => {
    markersRef.current = markers
  }, [markers])
  useEffect(() => {
    routePointsRef.current = routePoints
  }, [routePoints])
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
  }, [onMarkerClick])

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
    if (mapInstance.current && center && allowCenterChange) {
      const lng = parseFloat(center.lng)
      const lat = parseFloat(center.lat)
      if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
        mapInstance.current.setCenter([lng, lat])
      }
    }
  }, [center, allowCenterChange])

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

      // 验证并设置地图中心
      const lng = parseFloat(center.lng)
      const lat = parseFloat(center.lat)
      const mapCenter = (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0)
        ? [lng, lat]
        : [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat] // 默认坐标

      // 创建地图实例
      mapInstance.current = new AMap.Map(mapRef.current, {
        zoom,
        center: mapCenter,
        viewMode: '2D',
        mapStyle: 'amap://styles/normal'
      })

      // 添加控件
      mapInstance.current.addControl(new AMap.Scale())
      mapInstance.current.addControl(new AMap.ToolBar())

      setLoading(false)

      // 地图加载完成后，渲染已有的标记点和路线（解决编辑模式下初始数据不渲染的问题）
      // 使用 ref 获取最新数据，避免闭包捕获旧值
      renderMarkersFromData(markersRef.current)
      renderRouteLineFromData(routePointsRef.current)

      // 触发地图加载完成回调
      if (onMapLoad) {
        onMapLoad(mapInstance.current)
      }
    } catch (error) {
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
    }
  }

  const renderMarkers = () => {
    renderMarkersFromData(markers)
  }

  const renderMarkersFromData = (markerList) => {
    if (!mapInstance.current) {
      return
    }

    const AMap = window.AMap

    // 清除旧的标记点 - 使用正确的方法
    try {
      const allOverlays = mapInstance.current.getAllOverlays()
      if (allOverlays && allOverlays.length > 0) {
        allOverlays.forEach(overlay => {
          if (overlay instanceof AMap.Marker) {
            overlay.setMap(null)
          }
        })
      }
    } catch (error) {
    }

    // 渲染新的标记点
    markerList.forEach((markerData, index) => {
      // 验证坐标有效性
      const lng = parseFloat(markerData.lng)
      const lat = parseFloat(markerData.lat)

      if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
        return
      }

      try {
        // 构建标记配置对象
        const markerConfig = {
          position: [lng, lat],
          title: markerData.title || `标记${index + 1}`,
          offset: markerData.offset || new AMap.Pixel(-10, -10)
        }

        // 如果有自定义content，使用content；否则使用icon
        if (markerData.content) {
          markerConfig.content = markerData.content
        } else if (markerData.icon) {
          markerConfig.icon = markerData.icon
        }

        const marker = new AMap.Marker(markerConfig)

        const clickHandler = onMarkerClickRef.current
        if (clickHandler) {
          marker.on('click', () => {
            clickHandler(markerData, index)
          })
        }

        marker.setMap(mapInstance.current)
      } catch (error) {
      }
    })

  }

  const renderRouteLine = () => {
    renderRouteLineFromData(routePoints)
  }

  const renderRouteLineFromData = (points) => {
    if (!mapInstance.current) {
      return
    }

    const AMap = window.AMap

    // 清除旧的路线线
    if (routeLineRef.current) {
      routeLineRef.current.setMap(null)
      routeLineRef.current = null
    }

    // 如果有路线点，绘制新的路线线
    if (points && points.length >= 2) {
      try {
        const path = points.map(point => {
          const lng = parseFloat(point.lng)
          const lat = parseFloat(point.lat)
          if (isNaN(lng) || isNaN(lat) || lng === 0 || lat === 0) {
            return null
          }
          return [lng, lat]
        }).filter(point => point !== null)

        if (path.length < 2) {
          return
        }

        routeLineRef.current = new AMap.Polyline({
          path: path,
          strokeColor: '#1890ff',
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          showDir: true
        })

        routeLineRef.current.setMap(mapInstance.current)

        // 只在启用自动适应视野时才调整地图视野
        if (autoFitView) {
          const bounds = new AMap.Bounds()
          path.forEach(point => bounds.extend(point))
          mapInstance.current.setBounds(bounds)
        }

      } catch (error) {
      }
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

