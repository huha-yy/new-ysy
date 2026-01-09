-- =============================================
-- 预警功能配置数据
-- 创建时间：2025-01-14
-- 说明：为预警功能添加可配置的字典数据
-- =============================================

USE hiking_system;

-- =============================================
-- 1. 添加预警配置字典类型
-- =============================================
INSERT INTO `dict_type` (`dict_name`, `dict_code`, `description`, `status`) VALUES
('预警配置', 'alert_config', '安全预警功能配置参数', 1);

-- 获取新插入的字典类型ID（假设为15）
SET @dict_type_id = LAST_INSERT_ID();

-- =============================================
-- 2. 添加预警配置数据
-- label: 配置项标识（程序中用于获取配置）
-- value: 配置值
-- =============================================
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`, `status`) VALUES
(@dict_type_id, 'alert_config', 'deviation_threshold', '200', 1, 1),
(@dict_type_id, 'alert_config', 'severe_deviation_threshold', '500', 2, 1),
(@dict_type_id, 'alert_config', 'stationary_threshold', '30', 3, 1),
(@dict_type_id, 'alert_config', 'checkin_timeout', '20', 4, 1),
(@dict_type_id, 'alert_config', 'lost_contact_threshold', '60', 5, 1),
(@dict_type_id, 'alert_config', 'check_interval', '5', 6, 1);

-- =============================================
-- 配置说明
-- =============================================
-- deviation_threshold: 偏离路线阈值（米）- 用户距离路线超过此值触发偏离预警
-- severe_deviation_threshold: 严重偏离阈值（米）- 用户距离路线超过此值触发严重偏离预警
-- stationary_threshold: 静止时间阈值（分钟）- 用户在同一位置超过此时间触发静止预警
-- checkin_timeout: 签到超时阈值（分钟）- 超过预计签到时间此值后触发超时预警
-- lost_contact_threshold: 失联时间阈值（分钟）- 超过此时间无轨迹上报触发失联预警
-- check_interval: 定时检测间隔（分钟）- 定时任务执行频率

SELECT '预警配置数据添加完成！' AS message;
