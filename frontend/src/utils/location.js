/**
 * GPS定位工具类
 * 封装浏览器原生定位API和高德地图定位插件
 */

import { getCurrentLocation, getAmapLocation, isInRadius, calculateDistance, wgs84ToGcj02 } from './map'

/**
 * 定位配置
 */
const LOCATION_CONFIG = {
  enableHighAccuracy: true,    // 启用高精度定位
  timeout: 15000,              // 15秒超时
  maximumAge: 60000            // 允许使用1分钟内的缓存
}

/**
 * 高精度定位配置（用于轨迹记录）
 */
const HIGH_ACCURACY_CONFIG = {
  enableHighAccuracy: true,    // 启用高精度定位
  timeout: 20000,              // 更长的超时时间
  maximumAge: 0                // 不使用缓存，强制获取最新位置
}

/**
 * 强制GPS定位配置（诊断用）
 */
const FORCE_GPS_CONFIG = {
  enableHighAccuracy: true,    // 强制启用GPS
  timeout: 30000,              // 30秒超时，给GPS更多时间
  maximumAge: 0                // 绝对不使用缓存
}

/**
 * 定位错误类型
 */
const LOCATION_ERROR = {
  PERMISSION_DENIED: '用户拒绝了定位请求',
  POSITION_UNAVAILABLE: '位置信息不可用',
  TIMEOUT: '定位请求超时',
  UNKNOWN: '未知错误'
}

/**
 * 使用浏览器原生API获取位置
 * @returns {Promise<{latitude, longitude, accuracy}>}
 */
export const getBrowserLocation = () => {
  return getCurrentLocation()
}

/**
 * 使用高德地图插件获取位置（更精确）
 * @returns {Promise<{latitude, longitude, address}>}
 */
export { getAmapLocation } from './map'

/**
 * 强制GPS定位（诊断用）
 * 强制使用GPS而非网络定位，用于诊断定位问题
 * @returns {Promise<{latitude, longitude, accuracy, method, diagnostics}>}
 */
export const forceGpsLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }

    console.log('开始强制GPS定位诊断...')
    const startTime = Date.now()

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const endTime = Date.now()
        const originalLat = position.coords.latitude
        const originalLng = position.coords.longitude

        // 进行坐标系转换
        const converted = wgs84ToGcj02(originalLng, originalLat)

        const diagnostics = {
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          responseTime: endTime - startTime,
          source: position.coords.accuracy < 100 ? 'GPS' : 'Network'
        }

        console.log('强制GPS定位完成:', {
          originalCoords: { lat: originalLat, lng: originalLng },
          convertedCoords: { lat: converted.lat, lng: converted.lng },
          diagnostics
        })

        resolve({
          latitude: converted.lat,
          longitude: converted.lng,
          accuracy: position.coords.accuracy,
          originalLatitude: originalLat,
          originalLongitude: originalLng,
          method: 'force-gps',
          coordinateSystem: 'GCJ02 (强制GPS)',
          diagnostics
        })
      },
      (error) => {
        console.error('强制GPS定位失败:', error)
        let errorMessage = '强制GPS定位失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'GPS定位权限被拒绝'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'GPS位置信息不可用，可能在室内或GPS信号弱'
            break
          case error.TIMEOUT:
            errorMessage = 'GPS定位超时，请确保在户外并等待更长时间'
            break
        }
        reject(new Error(errorMessage))
      },
      FORCE_GPS_CONFIG
    )
  })
}

/**
 * 定位诊断工具
 * 测试多种定位方式并比较结果
 * @returns {Promise<Array>} 多种定位方式的结果对比
 */
export const locationDiagnostics = async () => {
  const results = []

  try {
    console.log('开始定位诊断...')

    // 1. 普通浏览器定位
    try {
      const browserResult = await getBrowserLocation()
      results.push({
        method: '浏览器定位',
        ...browserResult,
        success: true
      })
    } catch (error) {
      results.push({
        method: '浏览器定位',
        success: false,
        error: error.message
      })
    }

    // 2. 强制GPS定位
    try {
      const gpsResult = await forceGpsLocation()
      results.push({
        method: '强制GPS定位',
        ...gpsResult,
        success: true
      })
    } catch (error) {
      results.push({
        method: '强制GPS定位',
        success: false,
        error: error.message
      })
    }

    // 3. 高德地图定位
    try {
      if (window.AMap) {
        const amapResult = await getAmapLocation()
        results.push({
          method: '高德地图定位',
          ...amapResult,
          success: true
        })
      }
    } catch (error) {
      results.push({
        method: '高德地图定位',
        success: false,
        error: error.message
      })
    }

    return results
  } catch (error) {
    console.error('定位诊断失败:', error)
    return results
  }
}
export const getLocation = async () => {
  try {
    // 优先使用浏览器原生定位（更稳定、兼容性更好）
    console.log('尝试使用浏览器原生定位...')
    const browserLocation = await getBrowserLocation()
    console.log('浏览器原生定位成功:', browserLocation)
    return {
      ...browserLocation,
      method: 'browser'
    }
  } catch (error) {
    console.warn('浏览器原生定位失败，尝试高德地图定位:', error.message)
    try {
      // 确保高德地图API已加载
      if (!window.AMap) {
        const { loadAmapScript } = await import('./map')
        await loadAmapScript()
      }

      const amapLocation = await getAmapLocation()
      console.log('高德地图定位成功:', amapLocation)
      return {
        ...amapLocation,
        method: 'amap'
      }
    } catch (amapError) {
      console.error('所有定位方式都失败了:', amapError.message)
      // 提供更详细的错误信息
      let errorMessage = '定位失败'
      if (error.message.includes('用户拒绝')) {
        errorMessage = '请允许浏览器获取您的位置信息，并确保设备GPS功能已开启'
      } else if (error.message.includes('超时')) {
        errorMessage = '定位超时，请检查GPS信号或网络连接'
      } else if (error.message.includes('不可用')) {
        errorMessage = '位置信息不可用，请检查设备GPS功能'
      }
      throw new Error(errorMessage)
    }
  }
}

/**
 * 持续监听位置变化
 * @param {Function} callback - 回调函数，参数为位置信息
 * @returns {Function} 停止监听的函数
 */
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    throw new Error('浏览器不支持地理定位')
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      }
      callback(null, location)
    },
    (error) => {
      let errorMessage = LOCATION_ERROR.UNKNOWN
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = LOCATION_ERROR.PERMISSION_DENIED
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = LOCATION_ERROR.POSITION_UNAVAILABLE
          break
        case error.TIMEOUT:
          errorMessage = LOCATION_ERROR.TIMEOUT
          break
      }
      callback(new Error(errorMessage), null)
    },
    LOCATION_CONFIG
  )

  // 返回停止监听的函数
  return () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }
  }
}

/**
 * 检查位置权限
 * @returns {Promise<string>} 'granted' | 'denied' | 'prompt'
 */
export const checkLocationPermission = () => {
  return new Promise((resolve) => {
    if (!navigator.permissions) {
      resolve('prompt')
      return
    }

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      resolve(result.state)
    })
  })
}

/**
 * 请求位置权限
 * @returns {Promise<boolean>}
 */
export const requestLocationPermission = () => {
  return new Promise(async (resolve) => {
    try {
      await getLocation()
      resolve(true)
    } catch (error) {
      resolve(false)
    }
  })
}

/**
 * 签到检查
 * 检查用户是否在签到点有效范围内
 * @param {number} userLat - 用户纬度
 * @param {number} userLng - 用户经度
 * @param {number} checkpointLat - 签到点纬度
 * @param {number} checkpointLng - 签到点经度
 * @param {number} radius - 签到半径（米）
 * @returns {{inRange: boolean, distance: number}}
 */
export const checkIn = (userLat, userLng, checkpointLat, checkpointLng, radius) => {
  const distance = calculateDistance(userLat, userLng, checkpointLat, checkpointLng)
  return {
    inRange: distance <= radius,
    distance: Math.round(distance)
  }
}

/**
 * 轨迹记录管理类
 * 用于收集和上报用户GPS轨迹
 */
export class TrackRecorder {
  constructor() {
    this.tracks = []
    this.isRecording = false
    this.watchId = null
    this.maxTracks = 1000 // 最多保留1000个轨迹点
    this.uploadInterval = 30000 // 每30秒上报一次
    this.uploadTimer = null
  }

  /**
   * 开始记录轨迹
   * @param {Function} onTrack - 轨迹回调函数
   * @param {Function} onError - 错误回调函数
   */
  start(onTrack, onError) {
    if (this.isRecording) {
      console.warn('轨迹记录已在进行中')
      return
    }

    this.isRecording = true
    this.tracks = []

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const originalLat = position.coords.latitude
        const originalLng = position.coords.longitude

        // 转换坐标系
        const converted = wgs84ToGcj02(originalLng, originalLat)

        const track = {
          latitude: converted.lat,
          longitude: converted.lng,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          originalLatitude: originalLat,
          originalLongitude: originalLng
        }

        // 添加到轨迹数组
        this.tracks.push(track)

        // 限制轨迹点数量
        if (this.tracks.length > this.maxTracks) {
          this.tracks.shift()
        }

        // 触发回调
        if (onTrack) {
          onTrack(track)
        }
      },
      (error) => {
        console.error('轨迹记录错误:', error)
        if (onError) {
          onError(error)
        }
      },
      HIGH_ACCURACY_CONFIG
    )

    // 启动自动上传
    this.uploadTimer = setInterval(() => {
      this.upload()
    }, this.uploadInterval)
  }

  /**
   * 停止记录轨迹
   */
  stop() {
    if (!this.isRecording) {
      return
    }

    this.isRecording = false

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }

    if (this.uploadTimer) {
      clearInterval(this.uploadTimer)
      this.uploadTimer = null
    }

    // 上传剩余轨迹
    this.upload()
  }

  /**
   * 获取当前轨迹
   * @returns {Array}
   */
  getTracks() {
    return [...this.tracks]
  }

  /**
   * 清空轨迹
   */
  clear() {
    this.tracks = []
  }

  /**
   * 上报轨迹（需要在上传回调中实现）
   */
  async upload(uploadCallback) {
    if (this.tracks.length === 0) {
      return
    }

    if (uploadCallback) {
      try {
        await uploadCallback([...this.tracks])
        // 上传成功后清空已上传的轨迹
        this.tracks = []
      } catch (error) {
        console.error('轨迹上传失败:', error)
      }
    }
  }

  /**
   * 计算轨迹总距离
   * @returns {number} 距离（米）
   */
  getTotalDistance() {
    if (this.tracks.length < 2) {
      return 0
    }

    let totalDistance = 0
    for (let i = 0; i < this.tracks.length - 1; i++) {
      totalDistance += calculateDistance(
        this.tracks[i].latitude,
        this.tracks[i].longitude,
        this.tracks[i + 1].latitude,
        this.tracks[i + 1].longitude
      )
    }

    return totalDistance
  }
}

export default {
  getLocation,
  getBrowserLocation,
  getAmapLocation,
  forceGpsLocation,
  locationDiagnostics,
  watchLocation,
  checkLocationPermission,
  requestLocationPermission,
  checkIn,
  TrackRecorder,
  isInRadius,
  calculateDistance
}

