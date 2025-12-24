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
  showCurrentLocation = false,
  onMarkerClick,
  children
}) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [loading, setLoading] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(null)

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
    if (mapInstance.current && markers.length > 0) {
      renderMarkers()
    }
  }, [markers])

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
    const AMap = window.AMap
    const existingMarkers = mapInstance.current.getAllOverlays('marker')
    existingMarkers.forEach(marker => marker.setMap(null))

    markers.forEach((markerData, index) => {
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
    })
  }

  return (
    <div className="map-view-wrapper" style={{ width, height }}>
      {loading && (
        <div className="map-loading">
          <Spin tip="地图加载中..." size="large" />
        </div>
      )}
      <div ref={mapRef} className="map-container" />
      {children}
    </div>
  )
}

export default MapView

