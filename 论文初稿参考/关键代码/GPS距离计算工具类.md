# GPS距离计算工具类 - 关键代码

## 技术难点与解决方案

### 1. GPS定位精度与误差处理

**问题背景**：GPS定位在实际应用中存在多重误差源，包括：①卫星信号传播延迟导致的系统误差；②多路径效应（信号反射）导致的随机误差；③室内或高楼遮挡导致的信号衰减；④不同设备GPS芯片的精度差异。这些误差会导致定位偏差从几米到上百米不等，直接影响签到准确性。

**解决方案**：
- **多重定位策略**：系统采用"浏览器原生定位→高德地图定位"的级联策略，浏览器定位配置`enableHighAccuracy=true`强制使用GPS而非网络定位，超时时间设为15秒以平衡准确率和响应速度；失败时自动切换至高德地图定位API，利用其融合基站和WiFi的混合定位技术。
- **坐标系转换**：针对中国境内GPS定位偏差问题（WGS84坐标系与地图显示使用的GCJ02坐标系存在约50-500米的系统偏差），系统实现了WGS84到GCJ02的坐标转换算法，确保签到点和用户位置在同一坐标系下计算。
- **精度分级处理**：根据定位的accuracy字段（精度值，单位：米）将定位分为三级：高精度（<50米）直接用于签到；中等精度（50-100米）建议用户配合地图确认后签到；低精度（>100米）提示用户重新定位或手动输入坐标。
- **容差机制**：签到点设置有效半径（默认100米，可配置），作为定位误差的容差范围，只要用户位置在半径内即判定为可签到。

### 2. Haversine公式的应用场景与实现细节

**应用场景**：Haversine公式用于计算地球表面两点间的大圆距离（Great Circle Distance），即球面上两点间的最短路径距离。该公式适用于GPS距离计算的原因：①考虑地球曲率，而非简单的平面距离计算；②在短距离（<100km）内误差可忽略；③计算复杂度适中，适合实时应用。

**技术难点**：
- **地球模型选择**：地球并非完美球体，而是椭球体（赤道半径6378.137km，极半径6356.752km）。本系统采用球形模型（平均半径6371km），在短距离应用中精度足够且计算高效。如需更高精度，可采用Vincenty公式（考虑椭球体模型）。
- **角度与弧度转换**：Haversine公式基于弧度计算，需将经纬度（度）转换为弧度（rad = degree × π/180）。转换过程中的浮点精度需谨慎处理，避免舍入误差累积。
- **极端情况处理**：当两点重合时，Δlat=0且Δlng=0，公式计算结果为0；当两点位于地球对侧（距离约20000km）时，a≈1导致√(1-a)接近0，需使用atan2函数（而非atan）避免除零错误。

**代码实现**：见下方Java和JavaScript实现，包含详细的注释说明各步骤。

## 后端 - GeoUtils.java (Haversine公式实现)

```java
package com.hiking.hikingbackend.common.utils;

/**
 * 地理距离计算工具类
 * 使用Haversine公式计算地球表面两点间的大圆距离
 *
 * 技术要点：
 * 1. 地球模型：采用球形模型，平均半径6371000米，适用于短距离计算
 * 2. 坐标转换：将经纬度从度转换为弧度（rad = degree × π/180）
 * 3. 公式实现：a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)
 *             c = 2·atan2(√a, √(1-a))
 *             d = R·c
 * 4. 极端情况：使用atan2函数避免a=1时的除零错误
 */
public class GeoUtils {

    /**
     * 地球半径（米）
     * 采用WGS84椭球模型的平均半径
     * 赤道半径：6378137米，极半径：6356752米，平均半径：6371000米
     */
    private static final double EARTH_RADIUS = 6371000;

    /**
     * 私有构造函数，防止实例化
     */
    private GeoUtils() {
    }

    /**
     * 计算两点之间的距离（使用Haversine公式）
     *
     * Haversine公式原理：
     * 球面上两点间的最短距离是大圆距离，计算公式基于球面三角学。
     * 设两点A(lat1, lng1)和B(lat2, lng2)，则：
     * Δlat = lat2 - lat1, Δlng = lng2 - lng1
     * a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)
     * c = 2·atan2(√a, √(1-a))
     * distance = R·c
     *
     * @param lat1 第一点的纬度（度），范围：[-90, 90]
     * @param lng1 第一点的经度（度），范围：[-180, 180]
     * @param lat2 第二点的纬度（度）
     * @param lng2 第二点的经度（度）
     * @return 两点之间的距离（米）
     */
    public static double calculateDistance(double lat1, double lng1,
                                          double lat2, double lng2) {
        // 1. 将角度转换为弧度（rad = degree × π/180）
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLng = Math.toRadians(lng2 - lng1);

        // 2. Haversine公式核心计算
        // a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

        // c = 2·atan2(√a, √(1-a))
        // 使用atan2而非atan，避免a=1时√(1-a)=0导致的除零错误
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // 3. 计算距离：d = R·c
        return EARTH_RADIUS * c;
    }

    /**
     * 计算两点之间的距离并保留指定小数位
     *
     * @param lat1     第一点的纬度（度）
     * @param lng1     第一点的经度（度）
     * @param lat2     第二点的纬度（度）
     * @param lng2     第二点的经度（度）
     * @param scale     保留的小数位数
     * @return 两点之间的距离（米，四舍五入到指定小数位）
     */
    public static double calculateDistance(double lat1, double lng1,
                                          double lat2, double lng2,
                                          int scale) {
        double distance = calculateDistance(lat1, lng1, lat2, lng2);
        return Math.round(distance * Math.pow(10, scale)) / Math.pow(10, scale);
    }

    /**
     * 判断当前位置是否在有效范围内
     * 用于GPS签到功能，判断用户是否在签到点的有效半径内
     *
     * 容差机制说明：
     * - 签到点设置有效半径（如100米），作为GPS定位误差的容差范围
     * - 用户位置在半径内即可签到成功，无需精确定位到签到点
     * - 有效半径可根据实际情况调整，例如：开阔地50米，高楼区150米
     *
     * @param currentLat 当前纬度
     * @param currentLng 当前经度
     * @param targetLat  目标纬度
     * @param targetLng  目标经度
     * @param radius     有效半径（米）
     * @return true在范围内，false不在范围内
     */
    public static boolean isWithinRange(double currentLat, double currentLng,
                                       double targetLat, double targetLng,
                                       double radius) {
        double distance = calculateDistance(currentLat, currentLng,
                                           targetLat, targetLng);
        return distance <= radius;
    }

    /**
     * 获取地球半径常量
     *
     * @return 地球半径（米）
     */
    public static double getEarthRadius() {
        return EARTH_RADIUS;
    }
}
```

## 前端 - location.js (HTML5 Geolocation API)

```javascript
/**
 * GPS定位与坐标处理工具
 * 针对中国境内GPS定位偏差问题，实现坐标系转换和多重定位策略
 */

/**
 * 获取用户当前GPS位置
 * 使用HTML5 Geolocation API获取实时位置信息
 *
 * 定位配置说明：
 * - enableHighAccuracy: true，强制使用GPS而非网络定位（WiFi/基站）
 * - timeout: 15000ms，超时时间15秒，平衡准确率和响应速度
 * - maximumAge: 60000ms，允许使用1分钟内的缓存位置，减少设备功耗
 *
 * @returns {Promise<{latitude, longitude, accuracy, originalLatitude, originalLongitude, coordinateSystem}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // 检查浏览器是否支持地理定位
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }

    // 定位配置
    const options = {
      enableHighAccuracy: true,  // 启用高精度GPS定位
      timeout: 15000,            // 超时时间15秒
      maximumAge: 60000          // 允许使用1分钟内的缓存位置
    }

    // 调用HTML5 Geolocation API获取位置
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const originalLat = position.coords.latitude
        const originalLng = position.coords.longitude
        const accuracy = position.coords.accuracy

        // 进行坐标系转换（WGS84转GCJ02）
        // GPS原始坐标为WGS84坐标系，中国境内需转换为GCJ02（火星坐标系）
        // 否则会在地图上出现约50-500米的系统偏差
        const converted = wgs84ToGcj02(originalLng, originalLat)

        console.log('浏览器定位成功:')
        console.log('原始坐标(WGS84):', { latitude: originalLat, longitude: originalLng })
        console.log('转换坐标(GCJ02):', { latitude: converted.lat, longitude: converted.lng })
        console.log('定位精度:', accuracy + '米')

        resolve({
          latitude: converted.lat,              // 转换后的纬度（GCJ02）
          longitude: converted.lng,             // 转换后的经度（GCJ02）
          accuracy: accuracy,                   // 定位精度（米）
          originalLatitude: originalLat,        // 原始纬度（WGS84）
          originalLongitude: originalLng,       // 原始经度（WGS84）
          coordinateSystem: 'GCJ02 (已转换)'    // 坐标系标识
        })
      },
      (error) => {
        let errorMessage = '获取位置失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了定位请求'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用，可能在室内或GPS信号弱'
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
 * 持续监听用户位置变化
 * 用于活动进行中的轨迹记录
 *
 * 轨迹记录配置：
 * - 启用高精度定位，确保轨迹准确性
 * - 不使用缓存，确保获取实时位置
 * - 超时时间20秒，给GPS更多响应时间
 */
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    throw new Error('浏览器不支持地理定位')
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const originalLat = position.coords.latitude
      const originalLng = position.coords.longitude

      // 坐标系转换
      const converted = wgs84ToGcj02(originalLng, originalLat)

      callback({
        latitude: converted.lat,
        longitude: converted.lng,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      })
    },
    (error) => {
      console.error('位置监听失败：', error)
      callback(new Error(error.message), null)
    },
    options
  )

  return watchId
}

/**
 * 定位精度分级判断
 * 根据accuracy字段判断定位质量
 *
 * @param {number} accuracy - 定位精度（米）
 * @returns {string} 'high' | 'medium' | 'low'
 */
export const getLocationAccuracyLevel = (accuracy) => {
  if (accuracy < 50) return 'high'      // 高精度：<50米
  if (accuracy < 100) return 'medium'  // 中等精度：50-100米
  return 'low'                           // 低精度：>100米
}
```

## 前端 - map.js (坐标转换与距离计算)

```javascript
/**
 * 坐标系转换工具 - 解决GPS定位偏差问题
 *
 * 问题背景：
 * GPS定位使用WGS84坐标系（国际标准），但中国境内的地图（高德、腾讯等）
 * 使用GCJ02坐标系（火星坐标系），两者存在约50-500米的系统偏差。
 * 如果不进行转换，用户在地图上看到的签到点与实际GPS位置会明显不符。
 *
 * 解决方案：
 * 实现WGS84到GCJ02的坐标转换算法，确保签到点和用户位置在同一坐标系下。
 */

// 坐标转换常量（GCJ02坐标系转换参数）
const X_PI = 3.14159265358979324 * 3000.0 / 180.0
const PI = 3.1415926535897932384626
const A = 6378245.0      // 长半轴
const EE = 0.00669342162296594323  // 扁率

/**
 * WGS84转GCJ02坐标系
 * GPS坐标转换为中国标准坐标
 *
 * @param {number} lng - WGS84经度
 * @param {number} lat - WGS84纬度
 * @returns {{lng: number, lat: number}} 转换后的GCJ02坐标
 */
export const wgs84ToGcj02 = (lng, lat) => {
  // 判断是否在中国境外
  if (outOfChina(lng, lat)) {
    return { lng, lat }
  }

  // 计算纬度偏移量
  let dlat = transformLat(lng - 105.0, lat - 35.0)
  // 计算经度偏移量
  let dlng = transformLng(lng - 105.0, lat - 35.0)

  // 计算纬度转换
  const radlat = lat / 180.0 * PI
  let magic = Math.sin(radlat)
  magic = 1 - EE * magic * magic
  const sqrtmagic = Math.sqrt(magic)
  dlat = (dlat * 180.0) / ((A * (1 - EE)) / (magic * sqrtmagic) * PI)

  // 计算经度转换
  dlng = (dlng * 180.0) / (A / sqrtmagic * Math.cos(radlat) * PI)

  const mglat = lat + dlat
  const mglng = lng + dlng

  return { lng: mglng, lat: mglat }
}

/**
 * 判断是否在中国境外
 * 中国境内经度范围：72.004°E ~ 137.8347°E
 * 中国境内纬度范围：0.8293°N ~ 55.8271°N
 */
function outOfChina(lng, lat) {
  return (lng < 72.004 || lng > 137.8347) ||
         ((lat < 0.8293 || lat > 55.8271) || false)
}

/**
 * 纬度转换（坐标转换的核心算法之一）
 */
function transformLat(lng, lat) {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat +
            0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0
  return ret
}

/**
 * 经度转换（坐标转换的核心算法之一）
 */
function transformLng(lng, lat) {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng +
            0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
  return ret
}

/**
 * 计算两点之间的距离（Haversine公式）
 *
 * 参数说明：
 * - lat1, lng1: 第一点的纬度和经度（度）
 * - lat2, lng2: 第二点的纬度和经度（度）
 *
 * 返回值：
 * - 两点间的距离（米）
 *
 * 计算步骤：
 * 1. 将经纬度转换为弧度
 * 2. 计算Haversine公式中的a值
 * 3. 计算c值（圆心角）
 * 4. 距离 = 地球半径 × c
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000 // 地球半径（米）

  // 1. 角度转弧度
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  // 2. Haversine公式：a = sin²(Δφ/2) + cos(φ1)·cos(φ2)·sin²(Δλ/2)
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  // 3. c = 2·atan2(√a, √(1-a))
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // 4. 距离 = R·c
  return R * c
}

/**
 * 检查点是否在范围内
 * 用于签到功能判断用户是否在签到点有效半径内
 *
 * @param {number} lat1 - 用户纬度
 * @param {number} lng1 - 用户经度
 * @param {number} lat2 - 目标点纬度
 * @param {number} lng2 - 目标点经度
 * @param {number} radius - 半径（米）
 * @returns {boolean} true在范围内，false不在范围内
 */
export const isInRadius = (lat1, lng1, lat2, lng2, radius) => {
  const distance = calculateDistance(lat1, lng1, lat2, lng2)
  return distance <= radius
}
```
