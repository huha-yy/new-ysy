package com.hiking.hikingbackend.common.utils;

/**
 * 地理距离计算工具类
 * <p>
 * 用于签到功能中的距离计算：
 * <ul>
 *   <li>使用Haversine公式计算两点间距离</li>
 *   <li>输入：两个点的经纬度（lat1, lng1, lat2, lng2）</li>
 *   <li>输出：距离（米）</li>
 * </ul>
 *
 * @author hiking-system
 * @since 2024-12-23
 */
public class GeoUtils {

    /**
     * 地球半径（米）
     */
    private static final double EARTH_RADIUS = 6371000;

    /**
     * 私有构造函数，防止实例化
     */
    private GeoUtils() {
    }

    /**
     * 计算两点之间的距离（使用Haversine公式）
     * <p>
     * Haversine公式用于计算球面上两点间的最短距离（大圆距离）
     *
     * @param lat1 第一点的纬度（度）
     * @param lng1 第一点的经度（度）
     * @param lat2 第二点的纬度（度）
     * @param lng2 第二点的经度（度）
     * @return 两点之间的距离（米）
     */
    public static double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        // 将角度转换为弧度
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLng = Math.toRadians(lng2 - lng1);

        // Haversine公式
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // 计算距离
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
    public static double calculateDistance(double lat1, double lng1, double lat2, double lng2, int scale) {
        double distance = calculateDistance(lat1, lng1, lat2, lng2);
        return Math.round(distance * Math.pow(10, scale)) / Math.pow(10, scale);
    }

    /**
     * 判断当前位置是否在有效范围内
     * <p>
     * 用于签到功能，判断用户是否在签到点的有效半径内
     *
     * @param currentLat 当前纬度
     * @param currentLng 当前经度
     * @param targetLat  目标纬度
     * @param targetLng  目标经度
     * @param radius     有效半径（米）
     * @return true在范围内，false不在范围内
     */
    public static boolean isWithinRange(double currentLat, double currentLng,
                                      double targetLat, double targetLng, double radius) {
        double distance = calculateDistance(currentLat, currentLng, targetLat, targetLng);
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

