/**
 * GPS定位工具类
 * 封装浏览器原生定位API和高德地图定位插件
 */

import { getCurrentLocation, getAmapLocation, isInRadius, calculateDistance } from './map'

/**
 * 定位配置
 */
const LOCATION_CONFIG = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
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
export const getAmapLocation = getAmapLocation

/**
 * 获取位置（自动选择最佳方案）
 * 优先使用高德地图插件，如果失败则使用浏览器原生API
 * @returns {Promise<{latitude, longitude, accuracy, address}>}
 */
export const getLocation = async () => {
  try {
    // 尝试使用高德地图定位
    const amapLocation = await getAmapLocation()
    return {
      ...amapLocation,
      method: 'amap'
    }
  } catch (error) {
    console.warn('高德地图定位失败，使用浏览器原生定位:', error)
    try {
      const browserLocation = await getBrowserLocation()
      return {
        ...browserLocation,
        method: 'browser'
      }
    } catch (browserError) {
      throw new Error('定位失败: ' + browserError.message)
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
        const track = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          timestamp: position.timestamp
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
      LOCATION_CONFIG
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
  watchLocation,
  checkLocationPermission,
  requestLocationPermission,
  checkIn,
  TrackRecorder,
  isInRadius,
  calculateDistance
}

