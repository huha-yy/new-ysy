/**
 * 高德地图工具类
 * 提供地图初始化、路线绘制、定位等功能
 */

// 高德地图JS API密钥 - 需要替换为实际的Key
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
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Geolocation,AMap.Marker,AMap.Polyline,AMap.Polygon`
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
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
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
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
        resolve({
          latitude: result.position.lat,
          longitude: result.position.lng,
          accuracy: result.accuracy,
          address: result.formattedAddress,
          province: result.addressComponent?.province,
          city: result.addressComponent?.city,
          district: result.addressComponent?.district,
          street: result.addressComponent?.street
        })
      } else {
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

