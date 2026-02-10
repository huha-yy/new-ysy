/*
 Navicat Premium Dump SQL

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 50730 (5.7.30-log)
 Source Host           : localhost:3306
 Source Schema         : hiking_system

 Target Server Type    : MySQL
 Target Server Version : 50730 (5.7.30-log)
 File Encoding         : 65001

 Date: 10/02/2026 12:51:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for activity
-- ----------------------------
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '活动标题',
  `cover_image` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '封面图片URL',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '活动详细描述',
  `organizer_id` bigint(20) NOT NULL COMMENT '组织者用户ID',
  `route_id` bigint(20) NULL DEFAULT NULL COMMENT '关联路线ID',
  `activity_date` date NOT NULL COMMENT '活动日期',
  `start_time` time NOT NULL COMMENT '开始时间',
  `end_time` time NULL DEFAULT NULL COMMENT '预计结束时间',
  `duration_hours` decimal(4, 1) NULL DEFAULT NULL COMMENT '预计时长（小时）',
  `max_participants` int(11) NOT NULL DEFAULT 20 COMMENT '人数上限',
  `current_participants` int(11) NOT NULL DEFAULT 0 COMMENT '当前报名人数',
  `registration_deadline` datetime NOT NULL COMMENT '报名截止时间',
  `difficulty_level` tinyint(4) NOT NULL DEFAULT 1 COMMENT '难度：1休闲 2简单 3中等 4困难 5极限',
  `fee` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '费用（元）',
  `fee_description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '费用说明',
  `equipment_requirement` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '装备要求',
  `fitness_requirement` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '体能要求',
  `age_min` int(11) NULL DEFAULT NULL COMMENT '最小年龄限制',
  `age_max` int(11) NULL DEFAULT NULL COMMENT '最大年龄限制',
  `experience_requirement` tinyint(4) NULL DEFAULT NULL COMMENT '经验要求：0不限 1初级以上 2中级以上 3高级以上',
  `status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回',
  `reject_reason` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '驳回原因',
  `audit_by` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `view_count` int(11) NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_organizer_id`(`organizer_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_activity_date`(`activity_date`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '活动表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of activity
-- ----------------------------
INSERT INTO `activity` VALUES (1, '香山环线一日徒步', '/images/activities/activity-1.jpg', '香山环线是北京著名的经典徒步路线，全程约8.5公里，累计爬升480米。路线从香山公园东门出发，途径鬼笑石、樱桃沟等著名景点，最终到达香山公园北门。\n\n适合初学者和亲子徒步，风景优美，四季皆宜。沿途有清晰的标识，不易迷路。\n\n活动安排：\n- 08:30 香山公园东门集合\n- 09:00 出发\n- 12:00 鬼笑石休息\n- 13:30 到达香山公园北门\n- 14:00 活动结束', 1, 1, '2025-01-05', '08:30:00', '14:00:00', 5.5, 20, 2, '2025-01-04 18:00:00', 1, 0.00, '免费活动，无费用', '登山鞋、登山杖、背包、水壶、零食', '身体健康，能完成8公里徒步', 12, 65, 1, 4, NULL, NULL, NULL, 227, NULL, 0, '2025-12-26 16:39:52', '2026-01-04 17:23:42');
INSERT INTO `activity` VALUES (2, '妙峰山穿越一日徒步', '/images/activities/activity-2.jpg', '妙峰山穿越是门头沟区的经典路线，全程约13公里，累计爬升890米。从妙峰山南门出发，穿越至北门。\n\n难度中等，适合有徒步经验的朋友。沿途有寺庙、茶园等景点，风景秀丽。\n\n注意事项：\n- 妙峰山海拔较高，注意防寒\n- 穿越路线，中途退出不便\n- 建议携带手杖', 1, 2, '2025-01-10', '08:00:00', '16:00:00', 8.0, 15, 2, '2026-01-29 18:00:00', 2, 80.00, 'AA制，每人80元，含领队费、保险费', '登山鞋、登山杖、背包、冲锋衣、手套、帽子', '身体健康，能完成13公里徒步', 18, 60, 2, 3, NULL, NULL, NULL, 300, NULL, 0, '2025-12-26 16:39:52', '2026-01-20 15:30:42');
INSERT INTO `activity` VALUES (3, '百花山一日徒步', '/images/activities/activity-3.jpg', '百花山是北京门头沟区的著名山峰，海拔1991米。百花山一日徒步全程约18.5公里，累计爬升1200米。\n\n百花山风景优美，四季皆宜。春季山花烂漫，夏季凉爽宜人，秋季层林尽染，冬季雪景壮丽。\n\n强度：中等到困难\n\n适合有徒步经验的朋友', 1, 3, '2025-02-10', '07:30:00', '17:00:00', 9.5, 25, 3, '2026-02-09 18:00:00', 3, 120.00, 'AA制，每人120元，含领队费、保险费、交通费', '登山鞋、登山杖、背包、冲锋衣、手套、帽子、护膝', '身体健康，能完成18公里中等难度徒步', 18, 55, 2, 3, NULL, NULL, NULL, 133, NULL, 0, '2025-12-26 16:39:52', '2026-01-20 16:07:32');
INSERT INTO `activity` VALUES (4, '海坨山一日挑战', '/images/activities/activity-4.jpg', '海坨山是北京延庆区的最高峰，海拔1934米。海坨山一日全程约22公里，累计爬升1600米。\n\n强度：困难\n\n这条路线适合有丰富徒步经验、体能好的朋友。沿途视野开阔，是观景的绝佳位置。\n\n风险提示：\n- 海拔较高，注意高反\n- 风大时注意保暖\n- 建议结伴而行', 1, 4, '2025-02-25', '06:30:00', '18:30:00', 12.0, 18, 1, '2025-02-23 18:00:00', 4, 150.00, 'AA制，每人150元，含领队费、保险费、交通费', '登山鞋、登山杖、背包、冲锋衣、手套、帽子、护膝、冰爪', '体能好，有徒步经验，能完成22公里困难难度徒步', 20, 60, 2, 3, NULL, NULL, NULL, 111, NULL, 0, '2025-12-26 16:39:52', '2026-01-04 17:23:42');
INSERT INTO `activity` VALUES (5, '香山鬼笑线亲子徒步', '/images/activities/activity-5.jpg', '香山鬼笑线趣味性强，全程约5.2公里，爬升320米。非常适合亲子徒步、初学者体验。\n\n活动特色：\n- 路线短，强度小\n- 景点多，趣味性强\n- 适合拍照留念\n\n家长需陪同参加，确保儿童安全。', 1, 5, '2025-03-01', '09:00:00', '12:00:00', 3.0, 30, 0, '2025-02-28 18:00:00', 1, 50.00, '每人50元，含领队费、保险费', '运动鞋、背包、水壶、零食', '无特殊要求', 5, 65, 0, 2, NULL, NULL, NULL, 147, NULL, 0, '2025-12-26 16:39:52', '2026-01-04 17:23:42');
INSERT INTO `activity` VALUES (6, 'text1', '/images/activities/activity-5.jpg', '1', 1, 5, '2025-12-30', '20:12:00', '07:07:00', NULL, 20, 0, '2025-12-29 07:15:00', 1, 0.00, '1', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, 0, 0, 0, '2025-12-28 00:07:09', '2025-12-28 00:10:32');
INSERT INTO `activity` VALUES (7, '长城野长城穿越之旅', '/images/activities/activity-7.jpg', '这是一次极具挑战性的野长城穿越活动，全程约8.5公里，累计爬升350米。需要具备一定徒步经验，建议有徒步经验者参加。\r\n\r\n路线亮点：\r\n- 穿越未开发的长城段，体验原汁原味的长城风貌\r\n- 全程视野开阔，可远眺群山\r\n- 适合摄影爱好者\r\n\r\n注意事项：\r\n- 路线有落石，注意脚下安全\r\n- 天气多变，注意保暖\r\n- 建议携带充足饮水', 1, 1, '2025-01-15', '07:00:00', '19:00:00', 12.0, 20, 0, '2025-01-12 18:00:00', 4, 199.00, 'AA制，每人199元，含领队费、保险费', '登山杖（必备）、登山鞋、背包、冲锋衣、手套、帽子、护膝', '身体健康，能完成8.5公里徒步', 18, 55, 1, 1, NULL, NULL, NULL, 3, NULL, 0, '2025-12-28 01:41:48', '2025-12-28 01:56:27');
INSERT INTO `activity` VALUES (8, '秦岭露营两日游', '/images/activities/activity-8.jpg', '深入秦岭腹地，体验野外露营的乐趣。全程约20公里，累计爬升1200米。\r\n活动安排：\r\n- Day1: 徒步上山，露营\r\n- Day2: 下山返回\r\n\r\n装备要求：\r\n- 双人帐篷（两人一组）\r\n- 睡袋（-5度舒适）\r\n- 防潮垫\r\n- 套锅气罐\r\n- 头灯、营地灯\r\n\r\n安全提示：\r\n- 营地远离水源\r\n- 注意防熊防野猪\r\n- 禁止生明火', 1, 1, '2025-02-20', '08:00:00', '18:00:00', 24.0, 15, 0, '2025-02-17 18:00:00', 3, 299.00, 'AA制，每人299元，含领队费、保险费、营地费', '全套露营装备（帐篷、睡袋、防潮垫）、登山杖、登山鞋、背包、冲锋衣', '体能好，有露营经验', 20, 60, 2, 0, NULL, NULL, NULL, 3, NULL, 0, '2025-12-28 01:41:48', '2025-12-28 01:56:30');
INSERT INTO `activity` VALUES (9, '新疆喀纳斯湖徒步', '/images/activities/activity-9.jpg', '新疆喀纳斯湖，被誉为\"神的后花园\"。环湖徒步约15公里，海拔较低，适合初学者。\r\n\r\n喀纳斯湖特色：\r\n- 湖水碧绿如玉\r\n- 四季风景各异\r\n- 可能看到野生动物\r\n\r\n注意事项：\r\n- 新疆天气多变，注意保暖\r\n- 海拔较高，注意高反\r\n- 建议携带氧气瓶', 1, 2, '2025-03-10', '09:00:00', '16:00:00', 7.0, 25, 0, '2025-03-08 18:00:00', 4, 450.00, 'AA制，每人450元，含领队费、保险费、往返交通费', '登山杖、登山鞋、背包、冲锋衣、羽绒服', '身体健康，能适应高海拔环境', 16, 50, 3, 0, NULL, NULL, NULL, 1, NULL, NULL, '2025-12-28 01:41:48', '2025-12-28 01:56:39');
INSERT INTO `activity` VALUES (10, '哈士奇', 'blob:http://localhost:5173/4f7eb826-692b-4147-be27-8ddb78f967a4', '活捉哈士奇', 2, 3, '2026-02-12', '03:05:00', '12:12:00', NULL, 66, 0, '2026-02-11 07:07:00', 3, 6.00, NULL, NULL, NULL, NULL, NULL, NULL, 5, NULL, 1, '2026-01-09 16:48:59', 10, 0, 0, '2026-01-09 16:22:50', '2026-01-09 16:22:50');
INSERT INTO `activity` VALUES (11, '哈士奇2号', '/uploads/2026/01/14/8251107b93d546a5bf396b323ecdc059.png', '哈士奇', 2, 4, '2026-01-15', '04:04:00', '06:06:00', NULL, 20, 2, '2026-01-24 05:05:00', 4, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, 1, '2026-01-14 13:24:18', 26, 0, 0, '2026-01-14 13:23:37', '2026-01-14 14:39:50');
INSERT INTO `activity` VALUES (12, '666', '/uploads/2026/01/16/b7e91da3d57f46cbbc3027ebd2bcc766.jpg', '66', 1, 11, '2026-01-20', '05:06:00', '06:06:00', NULL, 20, 0, '2026-01-17 00:00:00', 1, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, 1, '2026-01-16 12:16:18', 4, 0, 0, '2026-01-16 12:15:55', '2026-01-16 12:15:55');
INSERT INTO `activity` VALUES (13, '建行', '/uploads/2026/01/16/6ed08dfd094a45578d49d17a538fb322.jpg', '建行冒险', 1, 13, '2026-01-16', '14:35:00', '17:22:00', NULL, 10, 1, '2026-01-16 22:14:00', 2, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, 1, '2026-01-16 14:32:16', 90, 0, 0, '2026-01-16 14:31:54', '2026-01-16 15:56:16');
INSERT INTO `activity` VALUES (14, '天安门徒步', '/uploads/2026/01/20/d05012d698ee46af87f3f90c2754437e.jpg', '天安门到天安门广场', 1, 16, '2026-01-21', '08:08:00', '16:33:00', NULL, 20, 1, '2026-01-21 06:06:00', 1, 0.00, '免费', NULL, NULL, NULL, NULL, NULL, 3, NULL, 1, '2026-01-20 17:11:01', 8, 0, 0, '2026-01-20 17:10:47', '2026-01-20 17:10:47');

-- ----------------------------
-- Table structure for alert_event
-- ----------------------------
DROP TABLE IF EXISTS `alert_event`;
CREATE TABLE `alert_event`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `user_id` bigint(20) NOT NULL COMMENT '触发用户ID',
  `alert_type` tinyint(4) NOT NULL COMMENT '预警类型：1偏离路线 2严重偏离 3长时间静止 4超时未签到 5失联',
  `alert_level` tinyint(4) NOT NULL DEFAULT 1 COMMENT '预警级别：1警告 2严重',
  `latitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '触发时纬度',
  `longitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '触发时经度',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '预警描述',
  `trigger_time` datetime NOT NULL COMMENT '触发时间',
  `handle_status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '处理状态：0未处理 1处理中 2已处理 3已忽略',
  `handle_by` bigint(20) NULL DEFAULT NULL COMMENT '处理人ID',
  `handle_time` datetime NULL DEFAULT NULL COMMENT '处理时间',
  `handle_remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '处理备注',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_activity_id`(`activity_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_handle_status`(`handle_status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '预警事件表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of alert_event
-- ----------------------------
INSERT INTO `alert_event` VALUES (1, 2, 6, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (2, 3, 5, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (3, 3, 1, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (4, 3, 2, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (5, 4, 6, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (6, 2, 6, 4, 1, 39.9800000, 115.9500000, '用户超时未在【妙峰山南门（集合点）】签到', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (7, 3, 5, 4, 1, 39.9700000, 115.9200000, '用户超时未在【百花山脚（集合点）】签到', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (8, 3, 1, 4, 1, 39.9700000, 115.9200000, '用户超时未在【百花山脚（集合点）】签到', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (9, 3, 2, 4, 1, 39.9700000, 115.9200000, '用户超时未在【百花山脚（集合点）】签到', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (10, 4, 6, 4, 1, 40.4200000, 115.8300000, '用户超时未在【海坨村（集合点）】签到', '2026-01-14 17:30:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `alert_event` VALUES (11, 2, 5, 4, 1, 39.9800000, 115.9500000, '用户超时未在【妙峰山南门（集合点）】签到', '2026-01-15 13:00:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-15 13:00:00', '2026-01-15 13:00:00');
INSERT INTO `alert_event` VALUES (12, 2, 5, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-15 13:00:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-15 13:00:00', '2026-01-15 13:00:00');
INSERT INTO `alert_event` VALUES (13, 13, 8, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-16 14:50:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-16 14:50:00', '2026-01-16 14:50:00');
INSERT INTO `alert_event` VALUES (14, 2, 8, 4, 1, 39.9800000, 115.9500000, '用户超时未在【妙峰山南门（集合点）】签到', '2026-01-20 15:35:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-20 15:35:00', '2026-01-20 15:35:00');
INSERT INTO `alert_event` VALUES (15, 2, 8, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-20 15:35:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-20 15:35:00', '2026-01-20 15:35:00');
INSERT INTO `alert_event` VALUES (16, 14, 1, 5, 2, NULL, NULL, '超过60分钟未上报轨迹，可能失联', '2026-01-20 17:15:00', 0, NULL, NULL, NULL, 0, NULL, '2026-01-20 17:15:00', '2026-01-20 17:15:00');

-- ----------------------------
-- Table structure for check_in_record
-- ----------------------------
DROP TABLE IF EXISTS `check_in_record`;
CREATE TABLE `check_in_record`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `checkpoint_id` bigint(20) NOT NULL COMMENT '签到点ID',
  `check_in_time` datetime NOT NULL COMMENT '签到时间',
  `latitude` decimal(10, 7) NOT NULL COMMENT '签到时纬度',
  `longitude` decimal(10, 7) NOT NULL COMMENT '签到时经度',
  `distance_to_checkpoint` int(11) NULL DEFAULT NULL COMMENT '距签到点距离（米）',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1正常 2迟到 3补签',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_activity_checkpoint`(`user_id`, `activity_id`, `checkpoint_id`) USING BTREE,
  INDEX `idx_activity_id`(`activity_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '签到记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of check_in_record
-- ----------------------------
INSERT INTO `check_in_record` VALUES (1, 4, 1, 1, '2025-01-05 08:22:00', 39.9925000, 116.1900000, 5, 1, NULL, NULL, NULL, '2025-12-24 20:34:15', '2025-12-24 20:34:15');
INSERT INTO `check_in_record` VALUES (2, 4, 1, 2, '2025-01-05 10:15:00', 39.9915000, 116.1895000, 8, 1, NULL, NULL, NULL, '2025-12-24 20:34:15', '2025-12-24 20:34:15');
INSERT INTO `check_in_record` VALUES (3, 4, 1, 3, '2025-01-05 13:28:00', 39.9935000, 116.1910000, 3, 1, NULL, NULL, NULL, '2025-12-24 20:34:15', '2025-12-24 20:34:15');
INSERT INTO `check_in_record` VALUES (4, 5, 1, 1, '2025-01-05 08:25:00', 39.9926000, 116.1901000, 8, 1, NULL, NULL, NULL, '2025-12-24 20:34:15', '2025-12-24 20:34:15');
INSERT INTO `check_in_record` VALUES (5, 5, 1, 2, '2025-01-05 10:20:00', 39.9914000, 116.1896000, 6, 1, NULL, NULL, NULL, '2025-12-24 20:34:15', '2025-12-24 20:34:15');
INSERT INTO `check_in_record` VALUES (6, 5, 1, 3, '2025-01-05 13:35:00', 39.9936000, 116.1911000, 2, 1, NULL, NULL, NULL, '2025-12-24 20:34:15', '2025-12-24 20:34:15');
INSERT INTO `check_in_record` VALUES (7, 8, 13, 20, '2026-01-16 15:29:01', 40.0683330, 116.1736830, 487, 1, NULL, 0, NULL, '2026-01-16 15:29:01', '2026-01-16 15:29:01');

-- ----------------------------
-- Table structure for checkpoint
-- ----------------------------
DROP TABLE IF EXISTS `checkpoint`;
CREATE TABLE `checkpoint`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `route_id` bigint(20) NOT NULL COMMENT '路线ID',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '签到点名称',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '签到点描述',
  `latitude` decimal(10, 7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10, 7) NOT NULL COMMENT '经度',
  `radius` int(11) NOT NULL DEFAULT 100 COMMENT '有效签到半径（米）',
  `sequence` int(11) NOT NULL DEFAULT 0 COMMENT '顺序号（1=集合点，最大=终点）',
  `checkpoint_type` tinyint(4) NOT NULL DEFAULT 2 COMMENT '类型：1集合点 2途中点 3终点',
  `is_required` tinyint(4) NOT NULL DEFAULT 1 COMMENT '是否必签：0否 1是',
  `expected_arrive_minutes` int(11) NULL DEFAULT NULL COMMENT '预计到达时间（从出发算起，分钟）',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_route_id`(`route_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '签到点表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of checkpoint
-- ----------------------------
INSERT INTO `checkpoint` VALUES (1, 1, '香山公园东门（集合点）', '活动集合点，需准时到达', 39.9925000, 116.1900000, 100, 1, 1, 1, 0, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (2, 1, '香山鬼笑石', '著名景点，拍照留念点', 39.9915000, 116.1895000, 100, 2, 2, 1, 60, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (3, 1, '香山北门（终点）', '活动终点，需完成签到', 39.9935000, 116.1910000, 100, 3, 3, 1, 120, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (4, 2, '妙峰山南门（集合点）', '活动集合点，需准时到达', 39.9800000, 115.9500000, 100, 1, 1, 1, 0, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (5, 2, '妙峰山半山腰', '途中签到点，风景优美', 39.9850000, 115.9550000, 100, 2, 2, 1, 90, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (6, 2, '妙峰山北门（终点）', '活动终点，需完成签到', 39.9900000, 115.9600000, 100, 3, 3, 1, 180, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (7, 3, '百花山脚（集合点）', '活动集合点，需准时到达', 39.9700000, 115.9200000, 100, 1, 1, 1, 0, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (8, 3, '百花山半山腰', '途中签到点，视野开阔', 39.9725000, 115.9225000, 100, 2, 2, 1, 120, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (9, 3, '百花山顶（终点）', '活动终点，最高点，需完成签到', 39.9750000, 115.9250000, 100, 3, 3, 1, 210, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (10, 4, '海坨村（集合点）', '活动集合点，需准时到达', 40.4200000, 115.8300000, 100, 1, 1, 1, 0, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (11, 4, '海坨山腰', '途中签到点，强度大', 40.4225000, 115.8325000, 100, 2, 2, 1, 150, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (12, 4, '海坨山顶（终点）', '活动终点，最高点，需完成签到', 40.4250000, 115.8350000, 100, 3, 3, 1, 270, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (13, 5, '香山公园东门（集合点）', '活动集合点，需准时到达', 39.9925000, 116.1900000, 100, 1, 1, 1, 0, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (14, 5, '香山鬼笑石（终点）', '活动终点，趣味性强', 39.9915000, 116.1895000, 100, 2, 3, 1, 90, NULL, NULL, '2025-12-24 20:31:32', '2025-12-24 20:31:32');
INSERT INTO `checkpoint` VALUES (18, 11, '起点签到', NULL, 40.0114500, 116.3077330, 100, 1, 2, 1, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `checkpoint` VALUES (19, 12, '1', NULL, 39.9306990, 116.3782270, 100, 1, 2, 1, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `checkpoint` VALUES (20, 13, '建行起点', NULL, 40.0694780, 116.1792090, 500, 1, 2, 1, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `checkpoint` VALUES (21, 13, '建行终点', NULL, 40.0691340, 116.1877820, 100, 2, 2, 1, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `checkpoint` VALUES (22, 15, '起点签到', NULL, 39.9100730, 116.3926050, 100, 1, 2, 1, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `checkpoint` VALUES (23, 15, '天安门签到', NULL, 39.9087840, 116.3975320, 100, 2, 2, 1, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `checkpoint` VALUES (24, 15, '终点签到', NULL, 39.9039330, 116.3996780, 100, 3, 2, 1, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `checkpoint` VALUES (25, 16, '起点签到', NULL, 39.9116650, 116.3921270, 100, 1, 2, 1, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');

-- ----------------------------
-- Table structure for dict_data
-- ----------------------------
DROP TABLE IF EXISTS `dict_data`;
CREATE TABLE `dict_data`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `dict_type_id` bigint(20) NOT NULL COMMENT '字典类型ID',
  `dict_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '所属字典编码',
  `label` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '显示标签',
  `value` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '数据值',
  `sequence` int(11) NOT NULL DEFAULT 0 COMMENT '排序号',
  `is_default` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否默认：0否 1是',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_dict_code_value`(`dict_code`, `value`) USING BTREE,
  INDEX `idx_dict_code`(`dict_code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 63 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典数据表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dict_data
-- ----------------------------
INSERT INTO `dict_data` VALUES (1, 1, 'user_role', '普通用户', '0', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (2, 1, 'user_role', '组织者', '1', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (3, 1, 'user_role', '管理员', '2', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (4, 2, 'user_status', '禁用', '0', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (5, 2, 'user_status', '正常', '1', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (6, 3, 'gender', '未知', '0', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (7, 3, 'gender', '男', '1', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (8, 3, 'gender', '女', '2', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (9, 4, 'experience_level', '新手', '0', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (10, 4, 'experience_level', '初级', '1', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (11, 4, 'experience_level', '中级', '2', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (12, 4, 'experience_level', '高级', '3', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (13, 4, 'experience_level', '专业', '4', 5, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (14, 5, 'activity_status', '草稿', '0', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (15, 5, 'activity_status', '待审核', '1', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (16, 5, 'activity_status', '已发布', '2', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (17, 5, 'activity_status', '进行中', '3', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (18, 5, 'activity_status', '已结束', '4', 5, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (19, 5, 'activity_status', '已取消', '5', 6, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (20, 5, 'activity_status', '已驳回', '6', 7, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (21, 6, 'difficulty_level', '休闲', '1', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (22, 6, 'difficulty_level', '简单', '2', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (23, 6, 'difficulty_level', '中等', '3', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (24, 6, 'difficulty_level', '困难', '4', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (25, 6, 'difficulty_level', '极限', '5', 5, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (26, 7, 'registration_status', '待审核', '0', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (27, 7, 'registration_status', '已通过', '1', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (28, 7, 'registration_status', '已拒绝', '2', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (29, 7, 'registration_status', '候补中', '3', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (30, 7, 'registration_status', '已取消', '4', 5, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (31, 7, 'registration_status', '已缺席', '5', 6, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (32, 8, 'checkpoint_type', '集合点', '1', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (33, 8, 'checkpoint_type', '途中点', '2', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (34, 8, 'checkpoint_type', '终点', '3', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (35, 9, 'check_in_status', '正常', '1', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (36, 9, 'check_in_status', '迟到', '2', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (37, 9, 'check_in_status', '补签', '3', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (38, 10, 'alert_type', '偏离路线', '1', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (39, 10, 'alert_type', '严重偏离', '2', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (40, 10, 'alert_type', '长时间静止', '3', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (41, 10, 'alert_type', '超时未签到', '4', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (42, 10, 'alert_type', '失联', '5', 5, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (43, 11, 'alert_level', '警告', '1', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (44, 11, 'alert_level', '严重', '2', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (45, 12, 'handle_status', '未处理', '0', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (46, 12, 'handle_status', '处理中', '1', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (47, 12, 'handle_status', '已处理', '2', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (48, 12, 'handle_status', '已忽略', '3', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (49, 13, 'message_type', '系统通知', '1', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (50, 13, 'message_type', '报名通知', '2', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (51, 13, 'message_type', '活动通知', '3', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (52, 13, 'message_type', '预警通知', '4', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (53, 14, 'point_type', '途经点', '1', 1, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (54, 14, 'point_type', '风险点', '2', 2, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (55, 14, 'point_type', '休息点', '3', 3, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (56, 14, 'point_type', '补给点', '4', 4, 0, 1, NULL, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_data` VALUES (57, 15, 'alert_config', 'deviation_threshold', '200', 1, 0, 1, NULL, NULL, NULL, '2026-01-14 22:28:16', '2026-01-14 22:28:16');
INSERT INTO `dict_data` VALUES (58, 15, 'alert_config', 'severe_deviation_threshold', '500', 2, 0, 1, NULL, NULL, NULL, '2026-01-14 22:28:16', '2026-01-14 22:28:16');
INSERT INTO `dict_data` VALUES (59, 15, 'alert_config', 'stationary_threshold', '30', 3, 0, 1, NULL, NULL, NULL, '2026-01-14 22:28:16', '2026-01-14 22:28:16');
INSERT INTO `dict_data` VALUES (60, 15, 'alert_config', 'checkin_timeout', '20', 4, 0, 1, NULL, NULL, NULL, '2026-01-14 22:28:16', '2026-01-14 22:28:16');
INSERT INTO `dict_data` VALUES (61, 15, 'alert_config', 'lost_contact_threshold', '60', 5, 0, 1, NULL, NULL, NULL, '2026-01-14 22:28:16', '2026-01-14 22:28:16');
INSERT INTO `dict_data` VALUES (62, 15, 'alert_config', 'check_interval', '5', 6, 0, 1, NULL, NULL, NULL, '2026-01-14 22:28:16', '2026-01-14 22:28:16');

-- ----------------------------
-- Table structure for dict_type
-- ----------------------------
DROP TABLE IF EXISTS `dict_type`;
CREATE TABLE `dict_type`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `dict_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '字典名称',
  `dict_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '字典编码（唯一）',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '描述',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_dict_code`(`dict_code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '字典类型表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of dict_type
-- ----------------------------
INSERT INTO `dict_type` VALUES (1, '用户角色', 'user_role', '用户角色类型', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (2, '用户状态', 'user_status', '用户账号状态', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (3, '性别', 'gender', '性别选项', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (4, '徒步经验等级', 'experience_level', '用户徒步经验等级', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (5, '活动状态', 'activity_status', '活动状态流转', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (6, '难度等级', 'difficulty_level', '路线/活动难度等级', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (7, '报名状态', 'registration_status', '报名审核状态', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (8, '签到点类型', 'checkpoint_type', '签到点类型', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (9, '签到状态', 'check_in_status', '签到记录状态', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (10, '预警类型', 'alert_type', '安全预警类型', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (11, '预警级别', 'alert_level', '预警严重程度', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (12, '处理状态', 'handle_status', '预警处理状态', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (13, '消息类型', 'message_type', '站内消息类型', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (14, '点位类型', 'point_type', '路线点位类型', 1, NULL, NULL, '2025-12-23 13:09:44', '2025-12-23 13:09:44');
INSERT INTO `dict_type` VALUES (15, '预警配置', 'alert_config', '安全预警功能配置参数', 1, NULL, NULL, '2026-01-14 22:28:16', '2026-01-14 22:28:16');

-- ----------------------------
-- Table structure for gathering_plan
-- ----------------------------
DROP TABLE IF EXISTS `gathering_plan`;
CREATE TABLE `gathering_plan`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID（唯一）',
  `gathering_time` datetime NOT NULL COMMENT '集合时间',
  `gathering_address` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '集合地点详细地址',
  `gathering_latitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '集合点纬度',
  `gathering_longitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '集合点经度',
  `transport_guide` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '交通指引',
  `items_to_bring` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '携带物品清单',
  `notice` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '注意事项',
  `organizer_phone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '组织者联系电话',
  `is_published` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否已发布：0否 1是',
  `publish_time` datetime NULL DEFAULT NULL COMMENT '发布时间',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_activity_id`(`activity_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '集合方案表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of gathering_plan
-- ----------------------------
INSERT INTO `gathering_plan` VALUES (1, 1, '2025-01-05 08:20:00', '北京市海淀区香山公园东门', 39.9925000, 116.1900000, '公共交通：乘坐331路、696路到香山公园东门下车；\n自驾：导航至\"香山公园东门\"，有收费停车场；\n建议：建议提前15分钟到达，预留停车时间。', '1. 登山杖（推荐）\n2. 登山鞋（必备）\n3. 背包\n4. 水壶（至少1.5升水）\n5. 零食（巧克力、能量棒等）\n6. 防晒用品（防晒霜、遮阳帽）\n7. 创可贴、碘伏等小药品', '1. 请准时到达，过时不候\n2. 穿着运动装，勿穿牛仔裤\n3. 活动中注意安全，不要脱离队伍\n4. 保护环境，不乱扔垃圾\n5. 有高血压、心脏病者禁止参加\n6. 手机保持开机，紧急情况联系领队', '13800138001', 1, '2025-01-03 10:00:00', NULL, NULL, '2025-12-24 20:12:52', '2025-12-24 20:12:52');
INSERT INTO `gathering_plan` VALUES (2, 2, '2025-01-20 07:45:00', '北京市门头沟区妙峰山南门停车场', 39.9800000, 115.9500000, '公共交通：乘坐地铁1号线到苹果园站，换乘929路到妙峰山南门；\n自驾：导航至\"妙峰山南门停车场\"；\n建议：建议提前30分钟到达，车位紧张。', '1. 登山杖（必需）\n2. 登山鞋（必需）\n3. 背包\n4. 水壶（至少2升水）\n5. 零食（巧克力、能量棒、面包等）\n6. 防晒用品\n7. 保暖衣物（抓绒衣、冲锋衣）\n8. 手套、帽子\n9. 护膝\n10. 创可贴、碘伏、感冒药', '1. 妙峰山海拔较高，注意防寒保暖\n2. 穿越路线，中途退出困难\n3. 建议结伴而行，不要单独行动\n4. 沿途有寺庙，请保持安静\n5. 手机保持开机，领队电话：13800138001\n6. 注意保护环境，带走自己的垃圾', '13800138001', 1, '2025-01-18 10:00:00', NULL, NULL, '2025-12-24 20:12:52', '2025-12-24 20:12:52');
INSERT INTO `gathering_plan` VALUES (3, 3, '2025-02-10 07:00:00', '北京市门头沟区百花山风景区停车场', 39.9700000, 115.9200000, '公共交通：乘坐地铁1号线到苹果园站，换乘892路到百花山风景区；\n自驾：导航至\"百花山风景区停车场\"；\n建议：建议提前30分钟到达。', '1. 登山杖（必需）\n2. 登山鞋（必需）\n3. 背包\n4. 水壶（至少2.5升水）\n5. 零食（巧克力、能量棒、面包、水果等）\n6. 防晒用品\n7. 保暖衣物（抓绒衣、冲锋衣、羽绒服）\n8. 手套、帽子\n9. 护膝\n10. 创可贴、碘伏、感冒药、创可贴\n11. 高原反应药（可选）', '1. 百花山海拔近2000米，注意高反\n2. 天气多变，注意防风保暖\n3. 建议携带手杖，节省体力\n4. 穿越路线，中途退出困难\n5. 建议结伴而行，不要单独行动\n6. 手机保持开机，领队电话：13800138001\n7. 注意保护环境，带走自己的垃圾', '13800138001', 1, '2025-02-08 10:00:00', NULL, NULL, '2025-12-24 20:12:52', '2025-12-24 20:12:52');
INSERT INTO `gathering_plan` VALUES (4, 4, '2025-02-25 06:00:00', '北京市延庆区海坨村', 40.4200000, 115.8300000, '公共交通：乘坐地铁S2线到延庆站，换乘Y45路到海坨村；\n自驾：导航至\"海坨村\"；\n建议：建议提前40分钟到达。', '1. 登山杖（必需，建议双杖）\n2. 登山鞋（必需，高帮）\n3. 背包\n4. 水壶（至少3升水）\n5. 零食（巧克力、能量棒、面包、水果、热饮等）\n6. 防晒用品\n7. 保暖衣物（抓绒衣、冲锋衣、羽绒服、保暖内衣）\n8. 手套、帽子、护脸\n9. 护膝\n10. 创可贴、碘伏、感冒药、创可贴\n11. 高原反应药（建议携带）\n12. 冰爪（视天气情况）', '1. 海坨山海拔高，天气变化快，务必做好防寒保暖\n2. 风大时注意防风，必要时佩戴护脸\n3. 建议携带双杖，节省体力\n4. 穿越路线，中途退出极其困难\n5. 建议结伴而行，至少3人一组\n6. 手机保持开机，领队电话：13800138001\n7. 注意保护环境，带走自己的垃圾\n8. 有心脏病、高血压、哮喘者禁止参加', '13800138001', 1, '2025-02-23 10:00:00', NULL, NULL, '2025-12-24 20:12:52', '2025-12-24 20:12:52');
INSERT INTO `gathering_plan` VALUES (5, 5, '2025-03-01 08:45:00', '北京市海淀区香山公园东门', 39.9925000, 116.1900000, '公共交通：乘坐331路、696路到香山公园东门下车；\n自驾：导航至\"香山公园东门\"，有收费停车场；\n建议：建议提前15分钟到达，预留停车时间。', '1. 运动鞋或登山鞋（必备）\n2. 背包\n3. 水壶（至少1升水）\n4. 零食（巧克力、水果、面包等）\n5. 防晒用品\n6. 纸巾/湿巾\n7. 创可贴等小药品\n8. 遮阳帽', '1. 请准时到达，过时不候\n2. 家长需全程陪同儿童\n3. 穿着运动装，勿穿牛仔裤\n4. 活动中注意安全，不要让孩子脱离队伍\n5. 保护环境，不乱扔垃圾\n6. 手机保持开机，紧急情况联系领队\n7. 建议携带驱蚊液（夏季）', '13800138001', 1, '2025-02-27 10:00:00', NULL, NULL, '2025-12-24 20:12:52', '2025-12-24 20:12:52');
INSERT INTO `gathering_plan` VALUES (6, 8, '2025-01-15 07:30:00', '北京市怀柔区慕田峪长城停车场', 40.4167000, 116.5650000, '公共交通：乘坐916路到慕田峪；\n自驾：导航至\"慕田峪长城停车场\"\n建议：建议提前30分钟到达', '1. 登山杖（必备）\n2. 登山鞋（必备）\n3. 背包\n4. 水壶（至少2升）\n5. 零食（巧克力、能量棒等）\n6. 防晒用品\n7. 手套、帽子', '1. 请准时到达，过时不候\n2. 活动中注意安全，不要脱离队伍\n3. 保护环境，不乱扔垃圾', '13900138001', 0, NULL, NULL, NULL, '2025-12-28 01:51:07', '2025-12-28 01:51:07');
INSERT INTO `gathering_plan` VALUES (7, 9, '2025-02-20 07:30:00', '陕西省西安市鄠邑区', 34.0000000, 108.9000000, '公共交通：乘坐高铁到西安站，换乘大巴；\n自驾：导航至\"鄠邑区\"\n建议：建议提前1天到达，购买露营装备', '1. 帐篷（两人一组）\n2. 睡袋\n3. 防潮垫\n4. 套锅气罐\n5. 头灯\n6. 营地灯\n7. 登山杖\n8. 登山鞋\n9. 冲锋衣\n10. 羽绒服', '1. 露营地远离水源\n2. 注意防野生动物\n3. 禁止生明火\n4. 晚上早点休息', '13900138001', 0, NULL, NULL, NULL, '2025-12-28 01:51:07', '2025-12-28 01:51:07');
INSERT INTO `gathering_plan` VALUES (8, 10, '2025-03-10 08:00:00', '新疆阿勒泰地区喀纳斯湖景区', 48.8000000, 87.0000000, '公共交通：乌鲁木齐→阿勒泰（班车）→喀纳斯\n自驾：导航至\"喀纳斯湖\"\n建议：建议提前2天到达，适应海拔', '1. 登山杖\n2. 登山鞋\n3. 背包\n4. 水壶\n5. 充足食物\n6. 氧气瓶（可选）\n7. 保暖衣物\n8. 防晒用品', '1. 新疆天气多变，注意保暖\n2. 海拔较高，注意高反\n3. 建议结伴而行\n4. 手机保持开机', '13900138001', 0, NULL, NULL, NULL, '2025-12-28 01:51:07', '2025-12-28 01:51:07');

-- ----------------------------
-- Table structure for message
-- ----------------------------
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '接收用户ID',
  `title` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '消息标题',
  `content` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '消息内容',
  `message_type` tinyint(4) NOT NULL DEFAULT 1 COMMENT '消息类型：1系统通知 2报名通知 3活动通知 4预警通知',
  `related_id` bigint(20) NULL DEFAULT NULL COMMENT '关联业务ID（如活动ID）',
  `related_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '关联业务类型（如activity）',
  `is_read` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否已读：0否 1是',
  `read_time` datetime NULL DEFAULT NULL COMMENT '阅读时间',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_is_read`(`is_read`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '消息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of message
-- ----------------------------
INSERT INTO `message` VALUES (1, 1, '[严重] 失联', '活动《妙峰山穿越一日徒步》中，用户【孙七】超过60分钟未上报轨迹，可能失联', 4, 2, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (2, 1, '[严重] 失联', '活动《百花山一日徒步》中，用户【赵六】超过60分钟未上报轨迹，可能失联', 4, 3, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (3, 1, '[严重] 失联', '活动《百花山一日徒步》中，用户【系统管理员】超过60分钟未上报轨迹，可能失联', 4, 3, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (4, 1, '[严重] 失联', '活动《百花山一日徒步》中，用户【张三】超过60分钟未上报轨迹，可能失联', 4, 3, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (5, 1, '[严重] 失联', '活动《海坨山一日挑战》中，用户【孙七】超过60分钟未上报轨迹，可能失联', 4, 4, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (6, 1, '[警告] 超时未签到', '活动《妙峰山穿越一日徒步》中，用户【孙七】用户超时未在【妙峰山南门（集合点）】签到', 4, 2, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (7, 1, '[警告] 超时未签到', '活动《百花山一日徒步》中，用户【赵六】用户超时未在【百花山脚（集合点）】签到', 4, 3, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (8, 1, '[警告] 超时未签到', '活动《百花山一日徒步》中，用户【系统管理员】用户超时未在【百花山脚（集合点）】签到', 4, 3, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (9, 1, '[警告] 超时未签到', '活动《百花山一日徒步》中，用户【张三】用户超时未在【百花山脚（集合点）】签到', 4, 3, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (10, 1, '[警告] 超时未签到', '活动《海坨山一日挑战》中，用户【孙七】用户超时未在【海坨村（集合点）】签到', 4, 4, 'activity', 0, NULL, 0, NULL, '2026-01-14 17:30:00', '2026-01-14 17:30:00');
INSERT INTO `message` VALUES (11, 1, '[警告] 超时未签到', '活动《妙峰山穿越一日徒步》中，用户【赵六】用户超时未在【妙峰山南门（集合点）】签到', 4, 2, 'activity', 0, NULL, 0, NULL, '2026-01-15 13:00:00', '2026-01-15 13:00:00');
INSERT INTO `message` VALUES (12, 1, '[严重] 失联', '活动《妙峰山穿越一日徒步》中，用户【赵六】超过60分钟未上报轨迹，可能失联', 4, 2, 'activity', 0, NULL, 0, NULL, '2026-01-15 13:00:00', '2026-01-15 13:00:00');
INSERT INTO `message` VALUES (13, 1, '[严重] 失联', '活动《建行》中，用户【呼哈】超过60分钟未上报轨迹，可能失联', 4, 13, 'activity', 0, NULL, 0, NULL, '2026-01-16 14:50:00', '2026-01-16 14:50:00');
INSERT INTO `message` VALUES (14, 1, '[警告] 超时未签到', '活动《妙峰山穿越一日徒步》中，用户【呼哈】用户超时未在【妙峰山南门（集合点）】签到', 4, 2, 'activity', 0, NULL, 0, NULL, '2026-01-20 15:35:00', '2026-01-20 15:35:00');
INSERT INTO `message` VALUES (15, 1, '[严重] 失联', '活动《妙峰山穿越一日徒步》中，用户【呼哈】超过60分钟未上报轨迹，可能失联', 4, 2, 'activity', 0, NULL, 0, NULL, '2026-01-20 15:35:00', '2026-01-20 15:35:00');
INSERT INTO `message` VALUES (16, 1, '[严重] 失联', '活动《天安门徒步》中，用户【系统管理员】超过60分钟未上报轨迹，可能失联', 4, 14, 'activity', 0, NULL, 0, NULL, '2026-01-20 17:15:00', '2026-01-20 17:15:00');

-- ----------------------------
-- Table structure for registration
-- ----------------------------
DROP TABLE IF EXISTS `registration`;
CREATE TABLE `registration`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '状态：0待审核 1已通过 2已拒绝 3候补中 4已取消 5已缺席',
  `reject_reason` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '拒绝原因',
  `queue_number` int(11) NULL DEFAULT NULL COMMENT '候补序号',
  `remark` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '报名备注',
  `audit_by` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `audit_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `cancel_time` datetime NULL DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '取消原因',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_activity`(`user_id`, `activity_id`) USING BTREE,
  INDEX `idx_activity_id`(`activity_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '报名表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of registration
-- ----------------------------
INSERT INTO `registration` VALUES (1, 4, 1, 1, NULL, NULL, '第一次参加香山环线，期待！', 2, '2025-01-04 10:30:00', NULL, NULL, NULL, NULL, '2025-12-24 20:34:11', '2025-12-24 20:34:11');
INSERT INTO `registration` VALUES (2, 5, 1, 1, NULL, NULL, '和朋友一起参加，很开心', 2, '2025-01-04 11:20:00', NULL, NULL, NULL, NULL, '2025-12-24 20:34:11', '2025-12-24 20:34:11');
INSERT INTO `registration` VALUES (3, 6, 2, 1, NULL, NULL, '第一次参加穿越路线，有点紧张但期待', 2, '2025-01-19 09:15:00', NULL, NULL, NULL, NULL, '2025-12-24 20:34:11', '2025-12-24 20:34:11');
INSERT INTO `registration` VALUES (4, 4, 2, 3, NULL, 1, '第二次参加，希望能通过审核', 2, NULL, NULL, NULL, NULL, NULL, '2025-01-18 14:30:00', '2025-12-24 20:34:11');
INSERT INTO `registration` VALUES (5, 5, 3, 1, NULL, NULL, '期待百花山的风景', 2, '2025-02-09 09:00:00', NULL, NULL, NULL, NULL, '2025-12-24 20:34:11', '2025-12-24 20:34:11');
INSERT INTO `registration` VALUES (6, 6, 4, 1, NULL, NULL, '挑战困难路线，相信自己可以', 2, '2025-02-24 16:30:00', NULL, NULL, NULL, NULL, '2025-12-24 20:34:11', '2025-12-24 20:34:11');
INSERT INTO `registration` VALUES (7, 4, 4, 3, NULL, 1, '第二次尝试海坨山', 2, NULL, NULL, NULL, NULL, NULL, '2025-02-23 17:00:00', '2025-12-24 20:34:11');
INSERT INTO `registration` VALUES (9, 4, 8, 0, NULL, NULL, '第一次参加野长城穿越，有点紧张但期待', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 01:51:07', '2025-12-28 01:51:07');
INSERT INTO `registration` VALUES (10, 6, 9, 0, NULL, NULL, '第一次体验野外露营，很兴奋', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 01:51:07', '2025-12-28 01:51:07');
INSERT INTO `registration` VALUES (13, 1, 2, 0, NULL, 0, '1320', NULL, NULL, NULL, NULL, 0, NULL, '2026-01-04 13:23:40', '2026-01-04 13:23:40');
INSERT INTO `registration` VALUES (14, 1, 3, 1, NULL, 0, '1.4', 1, '2026-01-09 16:10:46', NULL, NULL, 0, 0, '2026-01-04 17:35:36', '2026-01-04 17:35:36');
INSERT INTO `registration` VALUES (15, 1, 11, 1, NULL, NULL, '我喜欢哈士奇', NULL, NULL, NULL, NULL, 0, NULL, '2026-01-14 13:25:08', '2026-01-14 13:25:08');
INSERT INTO `registration` VALUES (16, 8, 11, 1, NULL, NULL, '1', NULL, NULL, NULL, NULL, 0, NULL, '2026-01-14 14:39:50', '2026-01-14 14:39:50');
INSERT INTO `registration` VALUES (17, 2, 3, 1, NULL, NULL, '0114', NULL, NULL, NULL, NULL, 0, NULL, '2026-01-14 15:14:29', '2026-01-14 15:14:29');
INSERT INTO `registration` VALUES (18, 5, 2, 1, NULL, NULL, '11', NULL, NULL, NULL, NULL, 0, NULL, '2026-01-15 12:55:10', '2026-01-15 12:55:10');
INSERT INTO `registration` VALUES (19, 8, 13, 1, NULL, NULL, '我', NULL, NULL, NULL, NULL, 0, NULL, '2026-01-16 14:35:18', '2026-01-16 14:35:18');
INSERT INTO `registration` VALUES (20, 8, 2, 4, NULL, NULL, '66', NULL, NULL, '2026-01-20 16:06:48', NULL, 0, 0, '2026-01-20 15:30:42', '2026-01-20 15:30:42');
INSERT INTO `registration` VALUES (21, 8, 3, 4, NULL, NULL, '666', NULL, NULL, '2026-01-20 16:07:44', NULL, 0, 0, '2026-01-20 16:07:32', '2026-01-20 16:07:32');
INSERT INTO `registration` VALUES (22, 1, 14, 1, NULL, NULL, '看升国旗', 1, '2026-01-20 17:12:02', NULL, NULL, 0, 0, '2026-01-20 17:11:43', '2026-01-20 17:11:43');

-- ----------------------------
-- Table structure for review
-- ----------------------------
DROP TABLE IF EXISTS `review`;
CREATE TABLE `review`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `overall_rating` tinyint(4) NOT NULL COMMENT '整体评分：1-5星',
  `route_rating` tinyint(4) NULL DEFAULT NULL COMMENT '路线评分：1-5星',
  `organization_rating` tinyint(4) NULL DEFAULT NULL COMMENT '组织评分：1-5星',
  `safety_rating` tinyint(4) NULL DEFAULT NULL COMMENT '安全评分：1-5星',
  `content` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '评价内容',
  `images` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '评价图片URL（多个逗号分隔）',
  `is_anonymous` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否匿名：0否 1是',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0隐藏 1显示',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_activity`(`user_id`, `activity_id`) USING BTREE,
  INDEX `idx_activity_id`(`activity_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '评价表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of review
-- ----------------------------
INSERT INTO `review` VALUES (1, 5, 1, 4, 4, 3, 4, '可以的，0115，我很高兴啊，哈哈哈哈哈', '/uploads/2026/01/15/a31ffab4481c4561b751d48523160c99.jpg', 0, 1, 0, NULL, '2026-01-15 11:10:13', '2026-01-15 11:10:13');

-- ----------------------------
-- Table structure for route
-- ----------------------------
DROP TABLE IF EXISTS `route`;
CREATE TABLE `route`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '路线名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '路线描述',
  `creator_id` bigint(20) NOT NULL COMMENT '创建者用户ID',
  `difficulty_level` tinyint(4) NOT NULL DEFAULT 1 COMMENT '难度：1休闲 2简单 3中等 4困难 5极限',
  `total_distance` decimal(6, 2) NULL DEFAULT NULL COMMENT '总里程（公里）',
  `elevation_gain` int(11) NULL DEFAULT NULL COMMENT '累计爬升（米）',
  `elevation_loss` int(11) NULL DEFAULT NULL COMMENT '累计下降（米）',
  `max_elevation` int(11) NULL DEFAULT NULL COMMENT '最高海拔（米）',
  `min_elevation` int(11) NULL DEFAULT NULL COMMENT '最低海拔（米）',
  `estimated_hours` decimal(4, 1) NULL DEFAULT NULL COMMENT '预计用时（小时）',
  `start_point_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '起点名称',
  `start_latitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '起点纬度',
  `start_longitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '起点经度',
  `end_point_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '终点名称',
  `end_latitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '终点纬度',
  `end_longitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '终点经度',
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '所属地区',
  `is_public` tinyint(4) NOT NULL DEFAULT 1 COMMENT '是否公开：0否 1是',
  `use_count` int(11) NOT NULL DEFAULT 0 COMMENT '被使用次数',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_creator_id`(`creator_id`) USING BTREE,
  INDEX `idx_difficulty_level`(`difficulty_level`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '路线表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of route
-- ----------------------------
INSERT INTO `route` VALUES (1, '香山环线', '经典的香山环线，适合初学者，风景优美，路线清晰', 2, 1, 8.50, 480, 480, 557, 120, 3.5, '香山公园东门', 39.9925000, 116.1900000, '香山公园北门', 39.9935000, 116.1910000, '北京海淀区', 1, 15, 1, NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `route` VALUES (2, '妙峰山穿越', '妙峰山经典穿越路线，风景秀丽，强度适中', 2, 2, 12.80, 890, 850, 1291, 200, 5.0, '妙峰山南门', 39.9800000, 115.9500000, '妙峰山北门', 39.9900000, 115.9600000, '北京门头沟区', 1, 8, 1, NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `route` VALUES (3, '百花山一日', '百花山经典一日路线，海拔较高，强度适中，视野开阔', 2, 3, 18.50, 1200, 1150, 1991, 800, 7.0, '百花山脚', 39.9700000, 115.9200000, '百花山顶', 39.9750000, 115.9250000, '北京门头沟区', 1, 12, 1, NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `route` VALUES (4, '海坨山一日', '海坨山一日环线，强度大，海拔高，适合有经验的徒步者', 3, 4, 22.00, 1600, 1550, 1934, 900, 9.0, '海坨村', 40.4200000, 115.8300000, '海坨山顶', 40.4250000, 115.8350000, '北京延庆区', 1, 5, 1, NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `route` VALUES (5, '香山鬼笑线', '香山鬼笑线，趣味性强，适合亲子徒步', 3, 1, 5.20, 320, 320, 550, 200, 2.5, '香山公园东门', 39.9925000, 116.1900000, '香山公园鬼笑石', 39.9915000, 116.1895000, '北京海淀区', 1, 20, 1, NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `route` VALUES (6, '测试修复路线', '测试route_point表修复', 3, 1, 5.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '北京', 1, 0, 1, NULL, NULL, '2026-01-15 14:51:13', '2026-01-15 14:51:13');
INSERT INTO `route` VALUES (9, '666', '666', 8, 1, NULL, NULL, NULL, NULL, NULL, 6.0, '起点', 39.9327210, 116.3808750, '终点', 39.9410130, 116.4227600, '北京', 1, 0, 1, 0, NULL, '2026-01-15 15:31:14', '2026-01-15 15:31:14');
INSERT INTO `route` VALUES (11, '安河家园tetxt', '1', 1, 1, 21.52, NULL, NULL, NULL, NULL, 1.0, '起点', 40.0110930, 116.3065660, '终点', 40.0131640, 116.4079100, '北京', 1, 0, 1, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route` VALUES (12, '杨舒云11', '1', 1, 1, 13.57, NULL, NULL, NULL, NULL, 1.0, '起点', 39.9294760, 116.3699880, '终点', 39.9101100, 116.3694730, '北京', 1, 0, 1, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route` VALUES (13, '建行', '1', 1, 1, 1.66, 5, 10, 200, NULL, 1.0, '起点', 40.0684220, 116.1780990, '终点', 40.0686300, 116.1860410, '北京', 1, 0, 1, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route` VALUES (14, '稻香湖111', '11', 1, 1, 6.95, NULL, NULL, NULL, NULL, 1.0, '起点', 39.9458250, 116.2450450, '终点', 39.9474530, 116.3246540, '北京', 1, 0, 1, 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route` VALUES (15, '稻香湖', '666', 1, 1, 2.35, 6, 6, 6, NULL, 6.0, '起点', 39.9101110, 116.3908250, '终点', 39.9032770, 116.3980930, '北京', 1, 0, 1, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route` VALUES (16, '天安门', '天安门徒步', 1, 1, 1.79, 20, 20, 200, NULL, 2.0, '起点', 39.9120940, 116.3911940, '终点', 39.9056150, 116.4040110, '北京', 1, 0, 1, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');

-- ----------------------------
-- Table structure for route_point
-- ----------------------------
DROP TABLE IF EXISTS `route_point`;
CREATE TABLE `route_point`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `route_id` bigint(20) NOT NULL COMMENT '路线ID',
  `point_type` tinyint(4) NOT NULL DEFAULT 1 COMMENT '点位类型：1途经点 2风险点 3休息点 4补给点 5路线轨迹点',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '点位名称',
  `description` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '点位描述',
  `latitude` decimal(10, 7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10, 7) NOT NULL COMMENT '经度',
  `elevation` int(11) NULL DEFAULT NULL COMMENT '海拔（米）',
  `sequence` int(11) NOT NULL DEFAULT 0 COMMENT '顺序号',
  `risk_level` tinyint(4) NULL DEFAULT NULL COMMENT '风险等级：1低 2中 3高（仅风险点）',
  `risk_tip` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '风险提示（仅风险点）',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_route_id`(`route_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 72 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '路线点位表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of route_point
-- ----------------------------
INSERT INTO `route_point` VALUES (2, 6, 1, '路线点1', NULL, 39.9093000, 116.3974000, NULL, 1, NULL, NULL, NULL, NULL, '2026-01-15 14:51:53', '2026-01-15 14:51:53');
INSERT INTO `route_point` VALUES (3, 6, 1, '路线点2', NULL, 39.9103000, 116.3984000, NULL, 2, NULL, NULL, NULL, NULL, '2026-01-15 14:51:53', '2026-01-15 14:51:53');
INSERT INTO `route_point` VALUES (4, 6, 1, '路线点3', NULL, 39.9113000, 116.3994000, NULL, 3, NULL, NULL, NULL, NULL, '2026-01-15 14:51:53', '2026-01-15 14:51:53');
INSERT INTO `route_point` VALUES (11, 9, 1, '路线点1', NULL, 39.9327210, 116.3808750, NULL, 1, NULL, NULL, 0, NULL, '2026-01-15 15:31:14', '2026-01-15 15:31:14');
INSERT INTO `route_point` VALUES (12, 9, 1, '路线点2', NULL, 39.9410130, 116.4227600, NULL, 2, NULL, NULL, 0, NULL, '2026-01-15 15:31:14', '2026-01-15 15:31:14');
INSERT INTO `route_point` VALUES (15, 11, 1, '路线点1', NULL, 40.0110930, 116.3065660, NULL, 1, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (16, 11, 1, '路线点2', NULL, 40.0141260, 116.3065460, NULL, 2, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (17, 11, 1, '路线点3', NULL, 40.0162360, 116.3268020, NULL, 3, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (18, 11, 1, '路线点4', NULL, 40.0188650, 116.3405350, NULL, 4, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (19, 11, 1, '路线点5', NULL, 40.0179450, 116.3492890, NULL, 5, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (20, 11, 1, '路线点6', NULL, 40.0188650, 116.3616490, NULL, 6, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (21, 11, 1, '路线点7', NULL, 40.0151840, 116.3774420, NULL, 7, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (22, 11, 1, '路线点8', NULL, 40.0157100, 116.3990710, NULL, 8, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (23, 11, 1, '路线点9', NULL, 40.0149210, 116.4074820, NULL, 9, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (24, 11, 1, '路线点10', NULL, 40.0108060, 116.3354680, NULL, 10, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (25, 11, 1, '路线点11', NULL, 40.0130870, 116.3655410, NULL, 11, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (26, 11, 1, '路线点12', NULL, 40.0090040, 116.3802030, NULL, 12, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (27, 11, 1, '路线点13', NULL, 40.0131640, 116.4079100, NULL, 13, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (28, 11, 1, '途经点1', NULL, 40.0194700, 116.3163590, NULL, 1, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (29, 11, 1, '途经点2', NULL, 40.0266680, 116.3382240, NULL, 2, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (30, 11, 1, '途经点3', NULL, 40.0265170, 116.3558180, NULL, 3, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (31, 11, 1, '途经点4', NULL, 40.0252440, 116.3734330, NULL, 4, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (32, 11, 1, '途经点5', NULL, 40.0239670, 116.3888340, NULL, 5, NULL, NULL, 0, NULL, '2026-01-15 17:46:12', '2026-01-15 17:46:12');
INSERT INTO `route_point` VALUES (33, 12, 1, '路线点1', NULL, 39.9294760, 116.3699880, NULL, 1, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (34, 12, 1, '路线点2', NULL, 39.9324130, 116.3686870, NULL, 2, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (35, 12, 1, '路线点3', NULL, 39.9362370, 116.3958090, NULL, 3, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (36, 12, 1, '路线点4', NULL, 39.9325510, 116.4291120, NULL, 4, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (37, 12, 1, '路线点5', NULL, 39.9177160, 116.4292110, NULL, 5, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (38, 12, 1, '路线点6', NULL, 39.9060410, 116.4132460, NULL, 6, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (39, 12, 1, '路线点7', NULL, 39.9009050, 116.3880120, NULL, 7, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (40, 12, 1, '路线点8', NULL, 39.9032760, 116.3710180, NULL, 8, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (41, 12, 1, '路线点9', NULL, 39.9101100, 116.3694730, NULL, 9, NULL, NULL, 0, NULL, '2026-01-15 17:58:00', '2026-01-15 17:58:00');
INSERT INTO `route_point` VALUES (42, 13, 1, '路线点1', NULL, 40.0684220, 116.1780990, NULL, 1, NULL, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route_point` VALUES (43, 13, 1, '路线点2', NULL, 40.0687160, 116.1782000, NULL, 2, NULL, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route_point` VALUES (44, 13, 1, '路线点3', NULL, 40.0727090, 116.1781240, NULL, 3, NULL, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route_point` VALUES (45, 13, 1, '路线点4', NULL, 40.0729980, 116.1862230, NULL, 4, NULL, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route_point` VALUES (46, 13, 1, '路线点5', NULL, 40.0691750, 116.1864760, NULL, 5, NULL, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route_point` VALUES (47, 13, 1, '路线点6', NULL, 40.0686300, 116.1860410, NULL, 6, NULL, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route_point` VALUES (48, 13, 1, '途经点1', NULL, 40.0725350, 116.1819780, NULL, 1, NULL, NULL, 0, NULL, '2026-01-16 14:03:54', '2026-01-16 14:03:54');
INSERT INTO `route_point` VALUES (49, 14, 5, '路线点1', NULL, 39.9463120, 116.2491390, NULL, 1, NULL, NULL, 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route_point` VALUES (50, 14, 5, '路线点2', NULL, 39.9472070, 116.2733440, NULL, 2, NULL, NULL, 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route_point` VALUES (51, 14, 5, '路线点3', NULL, 39.9511520, 116.2941150, NULL, 3, NULL, NULL, 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route_point` VALUES (52, 14, 5, '路线点4', NULL, 39.9493100, 116.3224390, NULL, 4, NULL, NULL, 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route_point` VALUES (53, 14, 1, '途经点1', NULL, 39.9497380, 116.2838120, NULL, 1, NULL, NULL, 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route_point` VALUES (54, 14, 1, '途经点3', NULL, 39.9495530, 116.3050190, NULL, 3, NULL, NULL, 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route_point` VALUES (55, 14, 2, '奥特曼', '有怪兽', 39.9399660, 116.2568640, NULL, 1, 2, '注意避让', 0, NULL, '2026-01-19 17:21:39', '2026-01-19 17:21:39');
INSERT INTO `route_point` VALUES (56, 15, 5, '路线点1', NULL, 39.9104780, 116.3914840, NULL, 1, NULL, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (57, 15, 5, '路线点2', NULL, 39.9077910, 116.3915080, NULL, 2, NULL, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (58, 15, 5, '路线点3', NULL, 39.9079590, 116.3976050, NULL, 3, NULL, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (59, 15, 5, '路线点4', NULL, 39.9081280, 116.4032140, NULL, 4, NULL, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (60, 15, 5, '路线点5', NULL, 39.9037310, 116.4033360, NULL, 5, NULL, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (61, 15, 5, '路线点6', NULL, 39.9038250, 116.3982630, NULL, 6, NULL, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (62, 15, 2, '过马路注意车辆', '', 39.9077170, 116.4037020, NULL, 2, 2, '快速有序通过', 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (63, 15, 3, '休息一下', '', 39.9062340, 116.4033850, NULL, 1, NULL, NULL, 0, NULL, '2026-01-20 13:38:44', '2026-01-20 13:38:44');
INSERT INTO `route_point` VALUES (64, 16, 5, '路线点1', NULL, 39.9122000, 116.3911940, NULL, 1, NULL, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');
INSERT INTO `route_point` VALUES (65, 16, 5, '路线点2', NULL, 39.9080850, 116.3915980, NULL, 2, NULL, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');
INSERT INTO `route_point` VALUES (66, 16, 5, '路线点3', NULL, 39.9086660, 116.3975770, NULL, 3, NULL, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');
INSERT INTO `route_point` VALUES (67, 16, 5, '路线点4', NULL, 39.9084910, 116.4031780, NULL, 4, NULL, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');
INSERT INTO `route_point` VALUES (68, 16, 5, '路线点5', NULL, 39.9065370, 116.4037840, NULL, 5, NULL, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');
INSERT INTO `route_point` VALUES (69, 16, 1, '途经点1', NULL, 39.9089210, 116.3996710, NULL, 1, NULL, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');
INSERT INTO `route_point` VALUES (70, 16, 2, '注意车辆', '', 39.9080620, 116.4041120, NULL, 1, 2, '', 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');
INSERT INTO `route_point` VALUES (71, 16, 3, '休息一下吧', '', 39.9073110, 116.4047680, NULL, 1, NULL, NULL, 0, NULL, '2026-01-20 17:08:36', '2026-01-20 17:08:36');

-- ----------------------------
-- Table structure for t_activity
-- ----------------------------
DROP TABLE IF EXISTS `t_activity`;
CREATE TABLE `t_activity`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '活动ID，主键',
  `activity_title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '活动标题',
  `activity_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '活动编码，唯一标识',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '活动描述',
  `route_id` bigint(20) NOT NULL COMMENT '关联路线ID',
  `organizer_id` bigint(20) NOT NULL COMMENT '组织者用户ID',
  `activity_date` date NOT NULL COMMENT '活动日期',
  `start_time` time NOT NULL COMMENT '出发时间',
  `end_time` time NULL DEFAULT NULL COMMENT '预计结束时间',
  `meeting_point` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '集合地点',
  `meeting_latitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '集合点纬度',
  `meeting_longitude` decimal(10, 7) NULL DEFAULT NULL COMMENT '集合点经度',
  `max_participants` int(11) NOT NULL COMMENT '最大参与人数',
  `min_participants` int(11) NULL DEFAULT 1 COMMENT '最少参与人数',
  `current_participants` int(11) NULL DEFAULT 0 COMMENT '当前报名人数',
  `registration_deadline` datetime NOT NULL COMMENT '报名截止时间',
  `cost_per_person` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '人均费用，单位：元',
  `cost_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '费用说明',
  `equipment_list` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '装备清单',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '活动备注',
  `weather_info` json NULL COMMENT '天气信息，JSON格式',
  `emergency_plan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '应急预案',
  `insurance_info` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '保险信息',
  `difficulty_requirement` tinyint(4) NULL DEFAULT NULL COMMENT '参与者难度要求',
  `age_limit_min` int(11) NULL DEFAULT NULL COMMENT '最小年龄限制',
  `age_limit_max` int(11) NULL DEFAULT NULL COMMENT '最大年龄限制',
  `health_requirement` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '健康要求',
  `experience_requirement` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '经验要求',
  `activity_images` json NULL COMMENT '活动图片URLs，JSON数组',
  `contact_info` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '联系方式',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '活动状态：0-取消，1-报名中，2-报名结束，3-进行中，4-已完成，5-已评价',
  `cancel_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '取消原因',
  `actual_start_time` datetime NULL DEFAULT NULL COMMENT '实际开始时间',
  `actual_end_time` datetime NULL DEFAULT NULL COMMENT '实际结束时间',
  `participant_rating` decimal(3, 2) NULL DEFAULT NULL COMMENT '参与者评分',
  `organizer_rating` decimal(3, 2) NULL DEFAULT NULL COMMENT '组织者评分',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人ID',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_activity_code`(`activity_code`) USING BTREE,
  INDEX `idx_activity_route_id`(`route_id`) USING BTREE,
  INDEX `idx_activity_organizer_id`(`organizer_id`) USING BTREE,
  INDEX `idx_activity_date`(`activity_date`) USING BTREE,
  INDEX `idx_activity_status`(`status`) USING BTREE,
  INDEX `idx_activity_create_time`(`create_time`) USING BTREE,
  INDEX `idx_activity_registration_deadline`(`registration_deadline`) USING BTREE,
  CONSTRAINT `fk_activity_organizer_id` FOREIGN KEY (`organizer_id`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_activity_route_id` FOREIGN KEY (`route_id`) REFERENCES `t_route` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '徒步活动表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_activity
-- ----------------------------

-- ----------------------------
-- Table structure for t_check_in
-- ----------------------------
DROP TABLE IF EXISTS `t_check_in`;
CREATE TABLE `t_check_in`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '签到ID，主键',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `check_in_type` tinyint(4) NOT NULL COMMENT '签到类型：1-集合签到，2-路径签到，3-完成签到',
  `check_in_point` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '签到点名称',
  `latitude` decimal(10, 7) NOT NULL COMMENT '签到纬度',
  `longitude` decimal(10, 7) NOT NULL COMMENT '签到经度',
  `altitude` int(11) NULL DEFAULT NULL COMMENT '海拔高度，单位：米',
  `accuracy` decimal(8, 2) NULL DEFAULT NULL COMMENT 'GPS精度，单位：米',
  `check_in_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '签到时间',
  `planned_time` datetime NULL DEFAULT NULL COMMENT '计划时间',
  `time_difference` int(11) NULL DEFAULT NULL COMMENT '时间差，单位：分钟',
  `distance_from_point` decimal(8, 2) NULL DEFAULT NULL COMMENT '距离签到点距离，单位：米',
  `health_status` tinyint(4) NULL DEFAULT 1 COMMENT '健康状态：1-良好，2-疲劳，3-不适，4-紧急',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '签到备注',
  `images` json NULL COMMENT '签到图片URLs，JSON数组',
  `weather_condition` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '天气状况',
  `temperature` decimal(4, 1) NULL DEFAULT NULL COMMENT '温度，单位：摄氏度',
  `is_emergency` tinyint(4) NULL DEFAULT 0 COMMENT '是否紧急：0-正常，1-紧急',
  `emergency_type` tinyint(4) NULL DEFAULT NULL COMMENT '紧急类型：1-迷路，2-受伤，3-设备故障，4-天气，5-其他',
  `emergency_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '紧急情况描述',
  `help_needed` tinyint(4) NULL DEFAULT 0 COMMENT '是否需要帮助：0-不需要，1-需要',
  `response_time` datetime NULL DEFAULT NULL COMMENT '响应时间',
  `response_by` bigint(20) NULL DEFAULT NULL COMMENT '响应人ID',
  `resolution_time` datetime NULL DEFAULT NULL COMMENT '解决时间',
  `resolution_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '解决方案',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_checkin_activity_id`(`activity_id`) USING BTREE,
  INDEX `idx_checkin_user_id`(`user_id`) USING BTREE,
  INDEX `idx_checkin_type`(`check_in_type`) USING BTREE,
  INDEX `idx_checkin_time`(`check_in_time`) USING BTREE,
  INDEX `idx_checkin_emergency`(`is_emergency`) USING BTREE,
  INDEX `idx_checkin_location`(`latitude`, `longitude`) USING BTREE,
  CONSTRAINT `fk_checkin_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `t_activity` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_checkin_user_id` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '活动签到表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_check_in
-- ----------------------------

-- ----------------------------
-- Table structure for t_fee
-- ----------------------------
DROP TABLE IF EXISTS `t_fee`;
CREATE TABLE `t_fee`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '费用ID，主键',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `fee_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '费用名称',
  `fee_type` tinyint(4) NOT NULL COMMENT '费用类型：1-交通费，2-住宿费，3-餐费，4-门票费，5-装备费，6-保险费，7-其他',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '费用描述',
  `total_amount` decimal(10, 2) NOT NULL COMMENT '总金额，单位：元',
  `per_person_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '人均金额，单位：元',
  `payment_method` tinyint(4) NULL DEFAULT 1 COMMENT '支付方式：1-AA制，2-组织者垫付，3-赞助，4-免费',
  `payer_id` bigint(20) NULL DEFAULT NULL COMMENT '付款人ID',
  `receipt_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '收据图片URL',
  `payment_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `settlement_status` tinyint(4) NULL DEFAULT 0 COMMENT '结算状态：0-未结算，1-已结算，2-部分结算',
  `settlement_time` datetime NULL DEFAULT NULL COMMENT '结算时间',
  `participants_count` int(11) NULL DEFAULT NULL COMMENT '参与人数',
  `paid_count` int(11) NULL DEFAULT 0 COMMENT '已支付人数',
  `unpaid_count` int(11) NULL DEFAULT 0 COMMENT '未支付人数',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '费用备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人ID',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_fee_activity_id`(`activity_id`) USING BTREE,
  INDEX `idx_fee_type`(`fee_type`) USING BTREE,
  INDEX `idx_fee_payer_id`(`payer_id`) USING BTREE,
  INDEX `idx_fee_settlement_status`(`settlement_status`) USING BTREE,
  CONSTRAINT `fk_fee_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `t_activity` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_fee_payer_id` FOREIGN KEY (`payer_id`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '活动费用表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_fee
-- ----------------------------

-- ----------------------------
-- Table structure for t_review
-- ----------------------------
DROP TABLE IF EXISTS `t_review`;
CREATE TABLE `t_review`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '评价ID，主键',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `reviewer_id` bigint(20) NOT NULL COMMENT '评价人ID',
  `review_type` tinyint(4) NOT NULL COMMENT '评价类型：1-对活动评价，2-对组织者评价，3-对路线评价，4-对参与者评价',
  `target_id` bigint(20) NULL DEFAULT NULL COMMENT '评价目标ID（用户ID或路线ID）',
  `overall_rating` tinyint(4) NOT NULL COMMENT '总体评分：1-5分',
  `organization_rating` tinyint(4) NULL DEFAULT NULL COMMENT '组织评分：1-5分',
  `route_rating` tinyint(4) NULL DEFAULT NULL COMMENT '路线评分：1-5分',
  `safety_rating` tinyint(4) NULL DEFAULT NULL COMMENT '安全评分：1-5分',
  `experience_rating` tinyint(4) NULL DEFAULT NULL COMMENT '体验评分：1-5分',
  `difficulty_rating` tinyint(4) NULL DEFAULT NULL COMMENT '难度评分：1-5分',
  `scenery_rating` tinyint(4) NULL DEFAULT NULL COMMENT '风景评分：1-5分',
  `weather_rating` tinyint(4) NULL DEFAULT NULL COMMENT '天气评分：1-5分',
  `equipment_rating` tinyint(4) NULL DEFAULT NULL COMMENT '装备评分：1-5分',
  `teamwork_rating` tinyint(4) NULL DEFAULT NULL COMMENT '团队合作评分：1-5分',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '评价标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '评价内容',
  `pros` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '优点',
  `cons` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '缺点',
  `suggestions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '改进建议',
  `images` json NULL COMMENT '评价图片URLs，JSON数组',
  `is_anonymous` tinyint(4) NULL DEFAULT 0 COMMENT '是否匿名：0-不匿名，1-匿名',
  `is_recommended` tinyint(4) NULL DEFAULT 1 COMMENT '是否推荐：0-不推荐，1-推荐',
  `helpful_count` int(11) NULL DEFAULT 0 COMMENT '有用数',
  `reply_count` int(11) NULL DEFAULT 0 COMMENT '回复数',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '评价状态：0-隐藏，1-正常，2-待审核',
  `admin_reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '管理员回复',
  `admin_reply_time` datetime NULL DEFAULT NULL COMMENT '管理员回复时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_review_activity_id`(`activity_id`) USING BTREE,
  INDEX `idx_review_reviewer_id`(`reviewer_id`) USING BTREE,
  INDEX `idx_review_type`(`review_type`) USING BTREE,
  INDEX `idx_review_target_id`(`target_id`) USING BTREE,
  INDEX `idx_review_overall_rating`(`overall_rating`) USING BTREE,
  INDEX `idx_review_create_time`(`create_time`) USING BTREE,
  CONSTRAINT `fk_review_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `t_activity` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_review_reviewer_id` FOREIGN KEY (`reviewer_id`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '活动评价反馈表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_review
-- ----------------------------

-- ----------------------------
-- Table structure for t_route
-- ----------------------------
DROP TABLE IF EXISTS `t_route`;
CREATE TABLE `t_route`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '路线ID，主键',
  `route_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '路线名称',
  `route_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '路线编码，唯一标识',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '路线描述',
  `difficulty_level` tinyint(4) NOT NULL COMMENT '难度等级：1-简单，2-中等，3-困难，4-极难，5-专业',
  `start_point` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '起点名称',
  `start_latitude` decimal(10, 7) NOT NULL COMMENT '起点纬度',
  `start_longitude` decimal(10, 7) NOT NULL COMMENT '起点经度',
  `end_point` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '终点名称',
  `end_latitude` decimal(10, 7) NOT NULL COMMENT '终点纬度',
  `end_longitude` decimal(10, 7) NOT NULL COMMENT '终点经度',
  `distance` decimal(8, 2) NULL DEFAULT NULL COMMENT '路线距离，单位：公里',
  `elevation_gain` int(11) NULL DEFAULT NULL COMMENT '累计爬升，单位：米',
  `elevation_loss` int(11) NULL DEFAULT NULL COMMENT '累计下降，单位：米',
  `max_altitude` int(11) NULL DEFAULT NULL COMMENT '最高海拔，单位：米',
  `min_altitude` int(11) NULL DEFAULT NULL COMMENT '最低海拔，单位：米',
  `estimated_time` int(11) NULL DEFAULT NULL COMMENT '预计用时，单位：分钟',
  `waypoints` json NULL COMMENT '路径点信息，JSON格式',
  `gpx_file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT 'GPX文件URL',
  `route_images` json NULL COMMENT '路线图片URLs，JSON数组',
  `risk_warnings` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '风险提示',
  `equipment_requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '装备要求',
  `best_season` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最佳季节',
  `water_sources` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '水源信息',
  `shelter_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '避难所信息',
  `emergency_exits` json NULL COMMENT '紧急出口信息，JSON格式',
  `nearby_hospitals` json NULL COMMENT '附近医院信息，JSON格式',
  `transportation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '交通信息',
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '所属地区',
  `province` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '省份',
  `city` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '城市',
  `tags` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '标签，逗号分隔',
  `rating` decimal(3, 2) NULL DEFAULT 0.00 COMMENT '路线评分，0-5分',
  `rating_count` int(11) NULL DEFAULT 0 COMMENT '评分人数',
  `usage_count` int(11) NULL DEFAULT 0 COMMENT '使用次数',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '路线状态：0-禁用，1-正常，2-维护中',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人ID',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_route_code`(`route_code`) USING BTREE,
  INDEX `idx_route_name`(`route_name`) USING BTREE,
  INDEX `idx_route_difficulty`(`difficulty_level`) USING BTREE,
  INDEX `idx_route_region`(`region`) USING BTREE,
  INDEX `idx_route_rating`(`rating`) USING BTREE,
  INDEX `idx_route_status`(`status`) USING BTREE,
  INDEX `idx_route_create_time`(`create_time`) USING BTREE,
  INDEX `idx_route_location`(`start_latitude`, `start_longitude`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '徒步路线表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_route
-- ----------------------------

-- ----------------------------
-- Table structure for t_sign_up
-- ----------------------------
DROP TABLE IF EXISTS `t_sign_up`;
CREATE TABLE `t_sign_up`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '报名ID，主键',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `real_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话',
  `id_card` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '身份证号，加密存储',
  `emergency_contact_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '紧急联系人姓名',
  `emergency_contact_phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '紧急联系人电话',
  `emergency_contact_relation` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '紧急联系人关系',
  `health_declaration` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '健康声明',
  `hiking_experience` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '徒步经验说明',
  `special_requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '特殊需求',
  `carpooling_info` json NULL COMMENT '拼车信息，JSON格式',
  `equipment_status` json NULL COMMENT '装备情况，JSON格式',
  `medical_history` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '病史说明',
  `insurance_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '保险单号',
  `application_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '报名理由',
  `sign_up_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
  `review_time` datetime NULL DEFAULT NULL COMMENT '审核时间',
  `review_by` bigint(20) NULL DEFAULT NULL COMMENT '审核人ID',
  `review_status` tinyint(4) NULL DEFAULT 0 COMMENT '审核状态：0-待审核，1-通过，2-拒绝，3-取消',
  `review_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '审核意见',
  `payment_status` tinyint(4) NULL DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付，2-已退款',
  `payment_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '支付金额',
  `payment_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `refund_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '退款金额',
  `refund_time` datetime NULL DEFAULT NULL COMMENT '退款时间',
  `refund_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退款原因',
  `attendance_status` tinyint(4) NULL DEFAULT 0 COMMENT '出勤状态：0-未签到，1-已签到，2-请假，3-缺席',
  `check_in_time` datetime NULL DEFAULT NULL COMMENT '签到时间',
  `completion_status` tinyint(4) NULL DEFAULT 0 COMMENT '完成状态：0-未完成，1-完成，2-中途退出',
  `rating` tinyint(4) NULL DEFAULT NULL COMMENT '评分：1-5分',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '反馈意见',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_signup_activity_user`(`activity_id`, `user_id`) USING BTREE,
  INDEX `idx_signup_user_id`(`user_id`) USING BTREE,
  INDEX `idx_signup_review_status`(`review_status`) USING BTREE,
  INDEX `idx_signup_payment_status`(`payment_status`) USING BTREE,
  INDEX `idx_signup_sign_up_time`(`sign_up_time`) USING BTREE,
  CONSTRAINT `fk_signup_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `t_activity` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_signup_user_id` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '活动报名表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_sign_up
-- ----------------------------

-- ----------------------------
-- Table structure for t_supply
-- ----------------------------
DROP TABLE IF EXISTS `t_supply`;
CREATE TABLE `t_supply`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '物资ID，主键',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `supply_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '物资名称',
  `supply_type` tinyint(4) NOT NULL COMMENT '物资类型：1-食物，2-装备，3-药品，4-其他',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '物资描述',
  `quantity` int(11) NOT NULL COMMENT '数量',
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '单位',
  `unit_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '单价，单位：元',
  `total_price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '总价，单位：元',
  `supplier` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '供应商',
  `purchase_date` date NULL DEFAULT NULL COMMENT '采购日期',
  `expiry_date` date NULL DEFAULT NULL COMMENT '过期日期',
  `storage_location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '存放位置',
  `responsible_person` bigint(20) NULL DEFAULT NULL COMMENT '负责人用户ID',
  `usage_instructions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '使用说明',
  `safety_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '安全注意事项',
  `allocation_method` tinyint(4) NULL DEFAULT 1 COMMENT '分配方式：1-平均分配，2-按需分配，3-集体使用',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '物资状态：0-缺货，1-充足，2-已分配，3-已使用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` bigint(20) NOT NULL COMMENT '创建人ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人ID',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_supply_activity_id`(`activity_id`) USING BTREE,
  INDEX `idx_supply_type`(`supply_type`) USING BTREE,
  INDEX `idx_supply_responsible_person`(`responsible_person`) USING BTREE,
  INDEX `idx_supply_status`(`status`) USING BTREE,
  CONSTRAINT `fk_supply_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `t_activity` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_supply_responsible_person` FOREIGN KEY (`responsible_person`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '活动物资表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_supply
-- ----------------------------

-- ----------------------------
-- Table structure for t_user
-- ----------------------------
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名，唯一标识',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码，BCrypt加密',
  `real_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '昵称',
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号，唯一',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '邮箱地址',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '头像URL',
  `gender` tinyint(4) NULL DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
  `birth_date` date NULL DEFAULT NULL COMMENT '出生日期',
  `id_card` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '身份证号，加密存储',
  `address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '居住地址',
  `hiking_experience` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '徒步经验描述',
  `health_status` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '健康状况说明',
  `emergency_contact_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '紧急联系人姓名',
  `emergency_contact_phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '紧急联系人电话',
  `emergency_contact_relation` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '紧急联系人关系',
  `user_type` tinyint(4) NULL DEFAULT 1 COMMENT '用户类型：1-普通用户，2-组织者，3-管理员',
  `status` tinyint(4) NULL DEFAULT 1 COMMENT '账户状态：0-禁用，1-正常，2-待审核',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '最后登录IP',
  `login_count` int(11) NULL DEFAULT 0 COMMENT '登录次数',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新人ID',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_username`(`username`) USING BTREE,
  UNIQUE INDEX `uk_user_phone`(`phone`) USING BTREE,
  INDEX `idx_user_email`(`email`) USING BTREE,
  INDEX `idx_user_real_name`(`real_name`) USING BTREE,
  INDEX `idx_user_status`(`status`) USING BTREE,
  INDEX `idx_user_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_user
-- ----------------------------
INSERT INTO `t_user` VALUES (1, 'test', '\\.zmdr9k7uOCQb96VdodAOBGEpVJnPnpuTWmQgJrjVsw/CJvbws9e', '测试用户', NULL, '13800138000', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, NULL, 0, '2025-10-09 14:27:53', '2025-10-09 14:27:53', NULL, NULL, 0);

-- ----------------------------
-- Table structure for t_user_fee
-- ----------------------------
DROP TABLE IF EXISTS `t_user_fee`;
CREATE TABLE `t_user_fee`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '个人费用ID，主键',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `fee_id` bigint(20) NOT NULL COMMENT '费用ID',
  `amount` decimal(10, 2) NOT NULL COMMENT '应付金额，单位：元',
  `paid_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '已付金额，单位：元',
  `payment_status` tinyint(4) NULL DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付，2-部分支付，3-已退款',
  `payment_method` tinyint(4) NULL DEFAULT NULL COMMENT '支付方式：1-微信，2-支付宝，3-银行卡，4-现金',
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '交易流水号',
  `payment_time` datetime NULL DEFAULT NULL COMMENT '支付时间',
  `refund_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '退款金额，单位：元',
  `refund_time` datetime NULL DEFAULT NULL COMMENT '退款时间',
  `refund_reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '退款原因',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(4) NULL DEFAULT 0 COMMENT '删除标记：0-未删除，1-已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_fee_activity_user_fee`(`activity_id`, `user_id`, `fee_id`) USING BTREE,
  INDEX `idx_user_fee_user_id`(`user_id`) USING BTREE,
  INDEX `idx_user_fee_fee_id`(`fee_id`) USING BTREE,
  INDEX `idx_user_fee_payment_status`(`payment_status`) USING BTREE,
  INDEX `idx_user_fee_payment_time`(`payment_time`) USING BTREE,
  CONSTRAINT `fk_user_fee_activity_id` FOREIGN KEY (`activity_id`) REFERENCES `t_activity` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_fee_fee_id` FOREIGN KEY (`fee_id`) REFERENCES `t_fee` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_fee_user_id` FOREIGN KEY (`user_id`) REFERENCES `t_user` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户费用明细表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t_user_fee
-- ----------------------------

-- ----------------------------
-- Table structure for track_record
-- ----------------------------
DROP TABLE IF EXISTS `track_record`;
CREATE TABLE `track_record`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `activity_id` bigint(20) NOT NULL COMMENT '活动ID',
  `latitude` decimal(10, 7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10, 7) NOT NULL COMMENT '经度',
  `elevation` int(11) NULL DEFAULT NULL COMMENT '海拔（米）',
  `accuracy` int(11) NULL DEFAULT NULL COMMENT '定位精度（米）',
  `speed` decimal(5, 2) NULL DEFAULT NULL COMMENT '移动速度（km/h）',
  `record_time` datetime NOT NULL COMMENT '记录时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_activity`(`user_id`, `activity_id`) USING BTREE,
  INDEX `idx_record_time`(`record_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '轨迹记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of track_record
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名（唯一）',
  `password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（BCrypt加密）',
  `phone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '手机号（唯一）',
  `email` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '邮箱（唯一）',
  `nickname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '头像URL',
  `role` tinyint(4) NOT NULL DEFAULT 0 COMMENT '角色：0普通用户 1组织者 2管理员',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
  `last_login_time` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_username`(`username`) USING BTREE,
  UNIQUE INDEX `idx_phone`(`phone`) USING BTREE,
  UNIQUE INDEX `idx_email`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'admin', '$2a$10$A4BZOjBI84XL6MzY65Vlke08XuKGRW9i64g0g0xKkEy/0wNn.OUwq', '13800138000', 'admin@hiking.com', '系统管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 2, 1, '2026-01-20 17:04:55', NULL, 0, '2025-12-24 20:26:21', '2025-12-24 20:37:08');
INSERT INTO `user` VALUES (2, 'zhangsan', '$2a$10$A4BZOjBI84XL6MzY65Vlke08XuKGRW9i64g0g0xKkEy/0wNn.OUwq', '13900138001', 'zhangsan@hiking.com', '张三', '/uploads/2026/01/09/6d216f4b9c5c47d2b9b8e6eaea358d28.png', 1, 1, '2026-01-14 14:46:16', NULL, 0, '2025-12-24 20:26:21', '2026-01-09 16:19:56');
INSERT INTO `user` VALUES (3, 'lisi', '$2a$10$A4BZOjBI84XL6MzY65Vlke08XuKGRW9i64g0g0xKkEy/0wNn.OUwq', '13900138002', 'lisi@hiking.com', '李四', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi', 1, 1, NULL, NULL, NULL, '2025-12-24 20:26:21', '2026-01-09 16:19:57');
INSERT INTO `user` VALUES (4, 'wangwu', '$2a$10$A4BZOjBI84XL6MzY65Vlke08XuKGRW9i64g0g0xKkEy/0wNn.OUwq', '13900138003', 'wangwu@hiking.com', '王五', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu', 1, 1, NULL, NULL, 1, '2025-12-24 20:26:21', '2026-01-20 17:14:21');
INSERT INTO `user` VALUES (5, 'zhaoliu', '$2a$10$A4BZOjBI84XL6MzY65Vlke08XuKGRW9i64g0g0xKkEy/0wNn.OUwq', '13900138004', 'zhaoliu@hiking.com', '赵六', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu', 0, 1, '2026-01-15 14:03:05', NULL, 0, '2025-12-24 20:26:21', '2026-01-09 16:19:58');
INSERT INTO `user` VALUES (6, 'sunqi', '$2a$10$A4BZOjBI84XL6MzY65Vlke08XuKGRW9i64g0g0xKkEy/0wNn.OUwq', '13900138005', 'sunqi@hiking.com', '孙七', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunqi', 0, 1, NULL, NULL, 1, '2025-12-24 20:26:21', '2026-01-09 16:20:01');
INSERT INTO `user` VALUES (7, 'huha', '$2a$10$A4BZOjBI84XL6MzY65Vlke08XuKGRW9i64g0g0xKkEy/0wNn.OUwq', '13635145229', '2856234031@qq.com', NULL, NULL, 0, 1, '2026-01-20 14:48:10', 0, 0, '2025-12-24 20:36:52', '2025-12-24 20:36:52');
INSERT INTO `user` VALUES (8, 'ysy', '$2a$10$AbHJgJl2erIXNdgT0U5lQODo2ivMKm400yU0A1RvHy/TLLAARHx9q', '13635415299', '2856234020@qq.com', '呼哈', '/uploads/2026/01/14/b614019af31a428898f2228eafef7195.png', 1, 1, '2026-01-20 15:22:19', 0, 1, '2026-01-14 13:33:23', '2026-01-14 14:38:46');

-- ----------------------------
-- Table structure for user_profile
-- ----------------------------
DROP TABLE IF EXISTS `user_profile`;
CREATE TABLE `user_profile`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID（唯一）',
  `real_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '真实姓名',
  `gender` tinyint(4) NULL DEFAULT NULL COMMENT '性别：0未知 1男 2女',
  `birth_date` date NULL DEFAULT NULL COMMENT '出生日期',
  `experience_level` tinyint(4) NOT NULL DEFAULT 0 COMMENT '徒步经验：0新手 1初级 2中级 3高级 4专业',
  `health_status` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '健康状况描述',
  `medical_history` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '病史/过敏史',
  `emergency_contact` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系人姓名',
  `emergency_phone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '紧急联系人电话',
  `equipment_list` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '常用装备清单',
  `preference_intensity` tinyint(4) NULL DEFAULT NULL COMMENT '偏好强度：1低 2中 3高',
  `preference_distance` tinyint(4) NULL DEFAULT NULL COMMENT '偏好里程：1短(<10km) 2中(10-20km) 3长(>20km)',
  `preference_region` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '偏好地区（多个逗号分隔）',
  `bio` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '个人简介',
  `create_by` bigint(20) NULL DEFAULT NULL COMMENT '创建者ID',
  `update_by` bigint(20) NULL DEFAULT NULL COMMENT '更新者ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_id`(`user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户档案表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_profile
-- ----------------------------
INSERT INTO `user_profile` VALUES (1, 2, '张三', 0, '1990-05-15', 3, '身体健康，无心脏病、高血压等疾病', '无', '张伟', '13800138888', '登山杖、登山鞋、背包、冲锋衣', 3, 3, '北京郊区,河北,山西', '有5年徒步经验，完成过20多次中等难度徒步', NULL, 0, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `user_profile` VALUES (2, 3, '李四', 1, '1988-08-20', 4, '身体健康，无过敏史', '无', '李明', '13800139999', '登山杖、登山鞋、背包、GPS', 3, 3, '北京周边,河北,山西', '有7年徒步经验，完成过多次困难难度徒步', NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `user_profile` VALUES (3, 4, '王五', 2, '1995-03-10', 1, '身体健康，无重大疾病', '无', '王建军', '13800137777', '登山鞋、背包、水壶', 2, 2, '北京郊区,天津', '有2年徒步经验，喜欢休闲和简单难度', NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `user_profile` VALUES (4, 5, '赵六', 1, '1992-11-25', 2, '身体健康，偶尔轻微感冒', '青霉素过敏', '赵国栋', '13800136666', '登山杖、登山鞋、背包、冲锋衣', 2, 2, '北京郊区,河北', '有3年徒步经验，完成过10多次简单和中等难度徒步', NULL, 0, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `user_profile` VALUES (5, 6, '孙七', 2, '1993-07-08', 0, '身体健康，无重大疾病', '无', '孙伟民', '13800135555', '登山鞋、背包、水壶', 1, 1, '北京郊区', '有1年徒步经验，主要参加休闲路线', NULL, NULL, '2025-12-24 20:26:21', '2025-12-24 20:26:21');
INSERT INTO `user_profile` VALUES (6, 7, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-24 20:36:52', '2025-12-24 20:36:52');
INSERT INTO `user_profile` VALUES (7, 8, '杨舒云', 0, '2003-12-06', 2, '良好', '无', 'huha', '13635415229', '背包', 2, 2, '重庆', '我很好', 0, 0, '2026-01-14 13:33:23', '2026-01-14 13:33:23');

SET FOREIGN_KEY_CHECKS = 1;
