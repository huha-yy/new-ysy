/**
 * 天气API模块
 * 使用Open-Meteo免费API（无需API Key，支持中文）
 */

const WEATHER_API_BASE = 'https://api.open-meteo.com/v1'

/**
 * 天气图标映射
 */
export const WEATHER_ICONS = {
  0: '☀️', // 晴天
  1: '🌤️', // 主要晴天
  2: '⛅', // 多云
  3: '☁️', // 阴天
  45: '🌫️', // 雾
  48: '🌫️', // 雾凇
  51: '🌧️', // 毛毛雨
  53: '🌧️', // 中等毛毛雨
  55: '🌧️', // 密集毛毛雨
  61: '🌧️', // 小雨
  63: '🌧️', // 中雨
  65: '🌧️', // 大雨
  71: '❄️', // 小雪
  73: '❄️', // 中雪
  75: '❄️', // 大雪
  80: '🌦️', // 小阵雨
  81: '🌦️', // 中阵雨
  82: '🌦️', // 暴雨
  95: '⛈️', // 雷暴
  96: '⛈️', // 雷暴伴冰雹
  99: '⛈️',  // 雷暴伴大雨
}

/**
 * 天气描述映射
 */
export const WEATHER_DESCRIPTIONS = {
  0: '晴朗',
  1: '主要晴朗',
  2: '多云',
  3: '阴天',
  45: '有雾',
  48: '雾凇',
  51: '毛毛雨',
  53: '中毛毛雨',
  55: '密毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  80: '小阵雨',
  81: '中阵雨',
  82: '暴雨',
  95: '雷暴',
  96: '雷暴伴冰雹',
  99: '雷暴伴大雨',
}

/**
 * 根据天气代码获取徒步建议
 */
export const getHikingSuggestion = (weatherCode, temperature) => {
  // 温度过低
  if (temperature < -5) {
    return {
      level: 'danger',
      text: '温度过低，不建议徒步'
    }
  }
  
  // 温度过高
  if (temperature > 35) {
    return {
      level: 'warning',
      text: '温度过高，注意防暑'
    }
  }
  
  // 恶劣天气
  if ([65, 75, 82, 95, 96, 99].includes(weatherCode)) {
    return {
      level: 'danger',
      text: '天气恶劣，不建议徒步'
    }
  }
  
  // 不太适合的天气
  if ([45, 48, 51, 55].includes(weatherCode)) {
    return {
      level: 'warning',
      text: '能见度较低，注意安全'
    }
  }
  
  if ([61, 63, 71, 73, 80, 81].includes(weatherCode)) {
    return {
      level: 'warning',
      text: '有雨雪，建议携带雨具'
    }
  }
  
  // 适宜天气
  return {
    level: 'good',
    text: '天气适宜，适合徒步活动'
  }
}

/**
 * 获取用户当前位置
 * 优化版：支持降级方案和更好的错误处理
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('您的浏览器不支持地理位置功能'))
      return
    }

    // 检查当前协议
    const isSecureContext = window.isSecureContext || 
                          window.location.protocol === 'https:' ||
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1'

    if (!isSecureContext) {
      console.warn('当前不是安全上下文，地理定位可能受限')
    }

    // 首先尝试高精度定位
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let errorMessage = '定位失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了定位请求，将使用默认位置'
            console.warn('定位权限被拒绝')
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '无法获取位置信息，将使用默认位置'
            console.warn('位置信息不可用')
            break
          case error.TIMEOUT:
            errorMessage = '定位请求超时，将使用默认位置'
            console.warn('定位超时')
            break
          default:
            errorMessage = '定位失败，将使用默认位置'
        }
        
        // 返回默认位置（北京）
        console.log('使用默认位置：北京')
        resolve({
          latitude: 39.9042,  // 北京纬度
          longitude: 116.4074, // 北京经度
          accuracy: 0,
          isDefault: true
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,  // 8秒超时
        maximumAge: 300000 // 5分钟缓存
      }
    )
  })
}

/**
 * 获取位置名称（反向地理编码）
 * 使用Nominatim免费API
 * 添加缓存和超时处理
 */
export const getLocationName = async (latitude, longitude) => {
  try {
    // 设置超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh-CN`,
      {
        headers: {
          'User-Agent': 'HikingSystem/1.0'
        },
        signal: controller.signal
      }
    )

    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error('获取位置名称失败')
    }
    
    const data = await response.json()
    
    // 优先显示城市，没有则显示区县
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.district || 
                 data.address?.county ||
                 data.display_name?.split(',')[0] ||
                 '当前位置'
    
    return city
  } catch (error) {
    console.error('获取位置名称失败:', error)
    
    // 如果是北京坐标，直接返回
    if (Math.abs(latitude - 39.9042) < 0.01 && Math.abs(longitude - 116.4074) < 0.01) {
      return '北京'
    }
    
    return '当前位置'
  }
}

/**
 * 获取天气数据
 */
export const getWeatherData = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `${WEATHER_API_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
    )
    
    if (!response.ok) {
      throw new Error('获取天气数据失败')
    }
    
    const data = await response.json()
    
    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        icon: WEATHER_ICONS[data.current.weather_code] || '🌤️',
        description: WEATHER_DESCRIPTIONS[data.current.weather_code] || '未知'
      },
      suggestion: getHikingSuggestion(
        data.current.weather_code,
        data.current.temperature_2m
      ),
      daily: data.daily.time.slice(0, 7).map((date, index) => ({
        date: date,
        temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
        temperatureMin: Math.round(data.daily.temperature_2m_min[index]),
        weatherCode: data.daily.weather_code[index],
        icon: WEATHER_ICONS[data.daily.weather_code[index]] || '🌤️'
      }))
    }
  } catch (error) {
    console.error('获取天气数据失败:', error)
    throw error
  }
}

/**
 * 获取当前位置的完整天气信息
 */
export const getCurrentLocationWeather = async () => {
  try {
    // 获取位置
    const position = await getCurrentPosition()
    
    // 获取位置名称
    const cityName = await getLocationName(position.latitude, position.longitude)
    
    // 获取天气数据
    const weatherData = await getWeatherData(position.latitude, position.longitude)
    
    return {
      cityName,
      ...weatherData
    }
  } catch (error) {
    console.error('获取位置天气失败:', error)
    throw error
  }
}

/**
 * 缓存天气数据到localStorage
 */
const WEATHER_CACHE_KEY = 'weather_cache'
const WEATHER_CACHE_DURATION = 10 * 60 * 1000 // 10分钟缓存

export const cacheWeatherData = (data) => {
  const cacheData = {
    data,
    timestamp: Date.now()
  }
  localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData))
}

export const getCachedWeatherData = () => {
  const cacheStr = localStorage.getItem(WEATHER_CACHE_KEY)
  if (!cacheStr) return null
  
  try {
    const cacheData = JSON.parse(cacheStr)
    const now = Date.now()
    
    // 检查是否过期
    if (now - cacheData.timestamp > WEATHER_CACHE_DURATION) {
      localStorage.removeItem(WEATHER_CACHE_KEY)
      return null
    }
    
    return cacheData.data
  } catch (error) {
    console.error('读取缓存失败:', error)
    localStorage.removeItem(WEATHER_CACHE_KEY)
    return null
  }
}

