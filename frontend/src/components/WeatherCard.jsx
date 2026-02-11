import { useState, useEffect } from 'react'
import { Card, Spin, Alert, Button } from 'antd'
import {
  EnvironmentOutlined,
  ReloadOutlined,
  CloseOutlined
} from '@ant-design/icons'
import {
  getCurrentLocationWeather,
  getCachedWeatherData,
  cacheWeatherData
} from '../api/weather'
import './WeatherCard.css'

function WeatherCard() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showWeather, setShowWeather] = useState(true)
  const [warning, setWarning] = useState(null)

  useEffect(() => {
    loadWeatherData()
  }, [])

  const loadWeatherData = async () => {
    setLoading(true)
    setError(null)
    setWarning(null)
    
    try {
      // 先尝试从缓存获取
      const cachedData = getCachedWeatherData()
      if (cachedData) {
        setWeather(cachedData)
        setLoading(false)
        return
      }

      // 获取实时天气
      const weatherData = await getCurrentLocationWeather()
      
      // 检查是否使用了默认位置
      if (weatherData.isDefaultLocation) {
        setWarning('定位失败，已切换至默认位置（北京）')
      }
      
      setWeather(weatherData)
      
      // 缓存数据
      cacheWeatherData(weatherData)
    } catch (err) {
      setError(err.message || '获取天气信息失败')
      
      // 设置默认天气数据（避免页面空白）
      setWeather({
        cityName: '北京',
        current: {
          temperature: 22,
          weatherCode: 0,
          icon: '🌤️',
          description: '晴朗'
        },
        suggestion: {
          level: 'good',
          text: '天气适宜，适合徒步活动'
        },
        daily: [],
        isDefaultLocation: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    // 清除缓存，重新加载
    localStorage.removeItem('weather_cache')
    loadWeatherData()
  }

  const handleClose = () => {
    setShowWeather(false)
  }

  // 不显示天气卡片
  if (!showWeather) {
    return null
  }

  // 加载状态
  if (loading && !weather) {
    return (
      <div className="weather-card loading">
        <Spin size="large" tip="获取天气信息..." />
      </div>
    )
  }

  return (
    <Card
      className={`weather-card ${weather?.suggestion?.level || 'good'}`}
      bordered={false}
      extra={
        <div className="weather-card-actions">
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleRetry}
            className="refresh-btn"
            title="刷新天气"
          />
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleClose}
            className="close-btn"
            title="关闭"
          />
        </div>
      }
    >
      {warning && (
        <Alert
          message={warning}
          type="info"
          showIcon
          closable
          onClose={() => setWarning(null)}
          style={{ marginBottom: 12, fontSize: 12 }}
        />
      )}

      {error && (
        <Alert
          message={error}
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 12 }}
        />
      )}

      <div className="weather-content">
        {/* 地点 */}
        <div className="weather-location">
          <EnvironmentOutlined />
          <span className="location-name">{weather?.cityName || '当前位置'}</span>
        </div>

        {/* 主要天气信息 */}
        <div className="weather-main">
          <div className="weather-icon">
            {weather?.current?.icon || '🌤️'}
          </div>
          <div className="weather-temp">
            <span className="temp-value">
              {weather?.current?.temperature || 0}
            </span>
            <span className="temp-unit">°C</span>
          </div>
        </div>

        {/* 天气描述 */}
        <div className="weather-desc">
          {weather?.current?.description || '晴朗'}
        </div>

        {/* 徒步建议 */}
        <div className={`weather-suggestion ${weather?.suggestion?.level || 'good'}`}>
          <span className="suggestion-icon">
            {weather?.suggestion?.level === 'danger' && '⚠️'}
            {weather?.suggestion?.level === 'warning' && '⚡'}
            {weather?.suggestion?.level === 'good' && '✅'}
          </span>
          <span className="suggestion-text">
            {weather?.suggestion?.text || '天气适宜，适合徒步活动'}
          </span>
        </div>

        {/* 未来天气预报 */}
        {weather?.daily && weather.daily.length > 0 && (
          <div className="weather-forecast">
            <div className="forecast-title">未来几天</div>
            <div className="forecast-list">
              {weather.daily.slice(1, 4).map((day, index) => (
                <div key={index} className="forecast-item">
                  <span className="forecast-day">
                    {new Date(day.date).toLocaleDateString('zh-CN', {
                      weekday: 'short'
                    })}
                  </span>
                  <span className="forecast-icon">{day.icon}</span>
                  <span className="forecast-temp">
                    {day.temperatureMax}° / {day.temperatureMin}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default WeatherCard

