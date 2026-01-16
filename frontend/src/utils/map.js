/**
 * 坐标系转换工具
 * 解决GPS定位偏差问题
 */

// 常量定义
const X_PI = 3.14159265358979324 * 3000.0 / 180.0
const PI = 3.1415926535897932384626
const A = 6378245.0
const EE = 0.00669342162296594323

/**
 * WGS84转GCJ02坐标系
 * GPS坐标转换为中国标准坐标
 * @param {number} lng WGS84经度
 * @param {number} lat WGS84纬度
 * @returns {{lng: number, lat: number}}
 */
export const wgs84ToGcj02 = (lng, lat) => {
  if (outOfChina(lng, lat)) {
    return { lng, lat }
  }

  let dlat = transformLat(lng - 105.0, lat - 35.0)
  let dlng = transformLng(lng - 105.0, lat - 35.0)
  const radlat = lat / 180.0 * PI
  let magic = Math.sin(radlat)
  magic = 1 - EE * magic * magic
  const sqrtmagic = Math.sqrt(magic)
  dlat = (dlat * 180.0) / ((A * (1 - EE)) / (magic * sqrtmagic) * PI)
  dlng = (dlng * 180.0) / (A / sqrtmagic * Math.cos(radlat) * PI)
  const mglat = lat + dlat
  const mglng = lng + dlng

  return { lng: mglng, lat: mglat }
}

/**
 * GCJ02转BD09坐标系
 * @param {number} lng GCJ02经度
 * @param {number} lat GCJ02纬度
 * @returns {{lng: number, lat: number}}
 */
export const gcj02ToBd09 = (lng, lat) => {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI)
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI)
  const bd_lng = z * Math.cos(theta) + 0.0065
  const bd_lat = z * Math.sin(theta) + 0.006
  return { lng: bd_lng, lat: bd_lat }
}

/**
 * WGS84直接转BD09坐标系
 * @param {number} lng WGS84经度
 * @param {number} lat WGS84纬度
 * @returns {{lng: number, lat: number}}
 */
export const wgs84ToBd09 = (lng, lat) => {
  const gcj = wgs84ToGcj02(lng, lat)
  return gcj02ToBd09(gcj.lng, gcj.lat)
}

/**
 * 判断是否在中国境外
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @returns {boolean}
 */
function outOfChina(lng, lat) {
  return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false)
}

/**
 * 纬度转换
 */
function transformLat(lng, lat) {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0
  return ret
}

/**
 * 经度转换
 */
function transformLng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
  return ret
}

/**
 * 高德地图JS API密钥 - 需要替换为实际的Key
 */
const AMAP_KEY = '4e498e7dde5c0916ebd506fb723f1706'

/**
 * 动态加载高德地图JS API
 * @returns {Promise}
 */
export const loadAmapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geolocation,AMap.Marker,AMap.Polyline,AMap.Polygon,AMap.Scale,AMap.ToolBar`
    script.onload = () => resolve(window.AMap)
    script.onerror = () => reject(new Error('加载高德地图脚本失败'))
    document.head.appendChild(script)
  })
}

/**
 * 获取用户当前位置
 * @returns {Promise<{latitude, longitude, accuracy}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }

    // 更宽松的定位配置，提高成功率
    const options = {
      enableHighAccuracy: true,  // 启用高精度定位
      timeout: 15000,            // 增加超时时间到15秒
      maximumAge: 60000          // 允许使用1分钟内的缓存位置
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const originalLat = position.coords.latitude
        const originalLng = position.coords.longitude

        // 进行坐标系转换（WGS84转GCJ02）
        const converted = wgs84ToGcj02(originalLng, originalLat)

        console.log('浏览器定位成功:')
        console.log('原始坐标(WGS84):', { latitude: originalLat, longitude: originalLng })
        console.log('转换坐标(GCJ02):', { latitude: converted.lat, longitude: converted.lng })
        console.log('精度:', position.coords.accuracy + '米')

        resolve({
          latitude: converted.lat,
          longitude: converted.lng,
          accuracy: position.coords.accuracy,
          originalLatitude: originalLat,
          originalLongitude: originalLng,
          coordinateSystem: 'GCJ02 (已转换)'
        })
      },
      (error) => {
        let errorMessage = '获取位置失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了定位请求'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用'
            break
          case error.TIMEOUT:
            errorMessage = '定位请求超时'
            break
        }
        console.error('浏览器定位失败:', error)
        reject(new Error(errorMessage))
      },
      options
    )
  })
}

/**
 * 使用高德地图定位插件获取位置
 * @returns {Promise<{latitude, longitude, address}>}
 */
export const getAmapLocation = () => {
  return new Promise((resolve, reject) => {
    if (!window.AMap) {
      reject(new Error('高德地图API未加载'))
      return
    }

    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      needAddress: true
    })

    geolocation.getCurrentPosition((status, result) => {
      if (status === 'complete') {
        console.log('高德地图定位成功:', {
          latitude: result.position.lat,
          longitude: result.position.lng,
          accuracy: result.accuracy,
          address: result.formattedAddress
        })
        resolve({
          latitude: result.position.lat,
          longitude: result.position.lng,
          accuracy: result.accuracy,
          address: result.formattedAddress,
          province: result.addressComponent?.province,
          city: result.addressComponent?.city,
          district: result.addressComponent?.district,
          street: result.addressComponent?.street,
          coordinateSystem: 'GCJ02 (高德原生)'
        })
      } else {
        console.error('高德地图定位失败:', result.message)
        reject(new Error('定位失败: ' + result.message))
      }
    })
  })
}

/**
 * 计算两点之间的距离（米）
 * 使用Haversine公式
 * @param {number} lat1 - 第一点纬度
 * @param {number} lng1 - 第一点经度
 * @param {number} lat2 - 第二点纬度
 * @param {number} lng2 - 第二点经度
 * @returns {number} 距离（米）
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000 // 地球半径（米）
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * 检查点是否在范围内
 * @param {number} lat1 - 用户纬度
 * @param {number} lng1 - 用户经度
 * @param {number} lat2 - 目标点纬度
 * @param {number} lng2 - 目标点经度
 * @param {number} radius - 半径（米）
 * @returns {boolean}
 */
export const isInRadius = (lat1, lng1, lat2, lng2, radius) => {
  const distance = calculateDistance(lat1, lng1, lat2, lng2)
  return distance <= radius
}

/**
 * 将经纬度转换为高德地图坐标字符串
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @returns {string}
 */
export const formatCoordinate = (lng, lat) => {
  return `${lng.toFixed(7)},${lat.toFixed(7)}`
}

/**
 * 生成高德地图地点分享链接
 * @param {number} lng - 经度
 * @param {number} lat - 纬度
 * @param {string} name - 地点名称
 * @returns {string}
 */
export const generateLocationUrl = (lng, lat, name) => {
  const encodedName = encodeURIComponent(name || '目的地')
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodedName}`
}

/**
 * 计算路线的总距离
 * @param {Array<{lng, lat}>} points - 路线点数组
 * @returns {number} 总距离（米）
 */
export const calculateRouteDistance = (points) => {
  if (!points || points.length < 2) return 0

  let totalDistance = 0
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    )
  }

  return totalDistance
}

/**
 * 格式化距离显示
 * @param {number} meters - 距离（米）
 * @returns {string}
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

