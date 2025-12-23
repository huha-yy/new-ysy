-- =============================================
-- 户外徒步活动管理系统 - 数据库初始化脚本
-- 创建时间：2024-12-23
-- 说明：包含建库、建表、初始数据
-- =============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS hiking_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE hiking_system;

-- =============================================
-- 1. 用户表 (user)
-- =============================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username` VARCHAR(32) NOT NULL COMMENT '用户名（唯一）',
    `password` VARCHAR(64) NOT NULL COMMENT '密码（BCrypt加密）',
    `phone` VARCHAR(16) DEFAULT NULL COMMENT '手机号（唯一）',
    `email` VARCHAR(64) DEFAULT NULL COMMENT '邮箱（唯一）',
    `nickname` VARCHAR(32) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(256) DEFAULT NULL COMMENT '头像URL',
    `role` TINYINT NOT NULL DEFAULT 0 COMMENT '角色：0普通用户 1组织者 2管理员',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
    `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_username` (`username`),
    UNIQUE INDEX `idx_phone` (`phone`),
    UNIQUE INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =============================================
-- 2. 用户档案表 (user_profile)
-- =============================================
DROP TABLE IF EXISTS `user_profile`;
CREATE TABLE `user_profile` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID（唯一）',
    `real_name` VARCHAR(32) DEFAULT NULL COMMENT '真实姓名',
    `gender` TINYINT DEFAULT NULL COMMENT '性别：0未知 1男 2女',
    `birth_date` DATE DEFAULT NULL COMMENT '出生日期',
    `experience_level` TINYINT NOT NULL DEFAULT 0 COMMENT '徒步经验：0新手 1初级 2中级 3高级 4专业',
    `health_status` VARCHAR(256) DEFAULT NULL COMMENT '健康状况描述',
    `medical_history` VARCHAR(512) DEFAULT NULL COMMENT '病史/过敏史',
    `emergency_contact` VARCHAR(32) DEFAULT NULL COMMENT '紧急联系人姓名',
    `emergency_phone` VARCHAR(16) DEFAULT NULL COMMENT '紧急联系人电话',
    `equipment_list` VARCHAR(512) DEFAULT NULL COMMENT '常用装备清单',
    `preference_intensity` TINYINT DEFAULT NULL COMMENT '偏好强度：1低 2中 3高',
    `preference_distance` TINYINT DEFAULT NULL COMMENT '偏好里程：1短(<10km) 2中(10-20km) 3长(>20km)',
    `preference_region` VARCHAR(128) DEFAULT NULL COMMENT '偏好地区（多个逗号分隔）',
    `bio` VARCHAR(256) DEFAULT NULL COMMENT '个人简介',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户档案表';

-- =============================================
-- 3. 活动表 (activity)
-- =============================================
DROP TABLE IF EXISTS `activity`;
CREATE TABLE `activity` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `title` VARCHAR(128) NOT NULL COMMENT '活动标题',
    `cover_image` VARCHAR(256) DEFAULT NULL COMMENT '封面图片URL',
    `description` TEXT DEFAULT NULL COMMENT '活动详细描述',
    `organizer_id` BIGINT NOT NULL COMMENT '组织者用户ID',
    `route_id` BIGINT DEFAULT NULL COMMENT '关联路线ID',
    `activity_date` DATE NOT NULL COMMENT '活动日期',
    `start_time` TIME NOT NULL COMMENT '开始时间',
    `end_time` TIME DEFAULT NULL COMMENT '预计结束时间',
    `duration_hours` DECIMAL(4,1) DEFAULT NULL COMMENT '预计时长（小时）',
    `max_participants` INT NOT NULL DEFAULT 20 COMMENT '人数上限',
    `current_participants` INT NOT NULL DEFAULT 0 COMMENT '当前报名人数',
    `registration_deadline` DATETIME NOT NULL COMMENT '报名截止时间',
    `difficulty_level` TINYINT NOT NULL DEFAULT 1 COMMENT '难度：1休闲 2简单 3中等 4困难 5极限',
    `fee` DECIMAL(10,2) DEFAULT 0.00 COMMENT '费用（元）',
    `fee_description` VARCHAR(256) DEFAULT NULL COMMENT '费用说明',
    `equipment_requirement` VARCHAR(512) DEFAULT NULL COMMENT '装备要求',
    `fitness_requirement` VARCHAR(256) DEFAULT NULL COMMENT '体能要求',
    `age_min` INT DEFAULT NULL COMMENT '最小年龄限制',
    `age_max` INT DEFAULT NULL COMMENT '最大年龄限制',
    `experience_requirement` TINYINT DEFAULT NULL COMMENT '经验要求：0不限 1初级以上 2中级以上 3高级以上',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0草稿 1待审核 2已发布 3进行中 4已结束 5已取消 6已驳回',
    `reject_reason` VARCHAR(256) DEFAULT NULL COMMENT '驳回原因',
    `audit_by` BIGINT DEFAULT NULL COMMENT '审核人ID',
    `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
    `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_organizer_id` (`organizer_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_activity_date` (`activity_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';

-- =============================================
-- 4. 报名表 (registration)
-- =============================================
DROP TABLE IF EXISTS `registration`;
CREATE TABLE `registration` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `activity_id` BIGINT NOT NULL COMMENT '活动ID',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0待审核 1已通过 2已拒绝 3候补中 4已取消 5已缺席',
    `reject_reason` VARCHAR(256) DEFAULT NULL COMMENT '拒绝原因',
    `queue_number` INT DEFAULT NULL COMMENT '候补序号',
    `remark` VARCHAR(256) DEFAULT NULL COMMENT '报名备注',
    `audit_by` BIGINT DEFAULT NULL COMMENT '审核人ID',
    `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
    `cancel_time` DATETIME DEFAULT NULL COMMENT '取消时间',
    `cancel_reason` VARCHAR(256) DEFAULT NULL COMMENT '取消原因',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_user_activity` (`user_id`, `activity_id`),
    INDEX `idx_activity_id` (`activity_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报名表';

-- =============================================
-- 5. 集合方案表 (gathering_plan)
-- =============================================
DROP TABLE IF EXISTS `gathering_plan`;
CREATE TABLE `gathering_plan` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `activity_id` BIGINT NOT NULL COMMENT '活动ID（唯一）',
    `gathering_time` DATETIME NOT NULL COMMENT '集合时间',
    `gathering_address` VARCHAR(256) NOT NULL COMMENT '集合地点详细地址',
    `gathering_latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '集合点纬度',
    `gathering_longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '集合点经度',
    `transport_guide` VARCHAR(512) DEFAULT NULL COMMENT '交通指引',
    `items_to_bring` VARCHAR(512) DEFAULT NULL COMMENT '携带物品清单',
    `notice` TEXT DEFAULT NULL COMMENT '注意事项',
    `organizer_phone` VARCHAR(16) DEFAULT NULL COMMENT '组织者联系电话',
    `is_published` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已发布：0否 1是',
    `publish_time` DATETIME DEFAULT NULL COMMENT '发布时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='集合方案表';

-- =============================================
-- 6. 路线表 (route)
-- =============================================
DROP TABLE IF EXISTS `route`;
CREATE TABLE `route` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name` VARCHAR(128) NOT NULL COMMENT '路线名称',
    `description` TEXT DEFAULT NULL COMMENT '路线描述',
    `creator_id` BIGINT NOT NULL COMMENT '创建者用户ID',
    `difficulty_level` TINYINT NOT NULL DEFAULT 1 COMMENT '难度：1休闲 2简单 3中等 4困难 5极限',
    `total_distance` DECIMAL(6,2) DEFAULT NULL COMMENT '总里程（公里）',
    `elevation_gain` INT DEFAULT NULL COMMENT '累计爬升（米）',
    `elevation_loss` INT DEFAULT NULL COMMENT '累计下降（米）',
    `max_elevation` INT DEFAULT NULL COMMENT '最高海拔（米）',
    `min_elevation` INT DEFAULT NULL COMMENT '最低海拔（米）',
    `estimated_hours` DECIMAL(4,1) DEFAULT NULL COMMENT '预计用时（小时）',
    `start_point_name` VARCHAR(64) DEFAULT NULL COMMENT '起点名称',
    `start_latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '起点纬度',
    `start_longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '起点经度',
    `end_point_name` VARCHAR(64) DEFAULT NULL COMMENT '终点名称',
    `end_latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '终点纬度',
    `end_longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '终点经度',
    `region` VARCHAR(64) DEFAULT NULL COMMENT '所属地区',
    `is_public` TINYINT NOT NULL DEFAULT 1 COMMENT '是否公开：0否 1是',
    `use_count` INT NOT NULL DEFAULT 0 COMMENT '被使用次数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_creator_id` (`creator_id`),
    INDEX `idx_difficulty_level` (`difficulty_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='路线表';

-- =============================================
-- 7. 路线点位表 (route_point)
-- =============================================
DROP TABLE IF EXISTS `route_point`;
CREATE TABLE `route_point` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `route_id` BIGINT NOT NULL COMMENT '路线ID',
    `point_type` TINYINT NOT NULL DEFAULT 1 COMMENT '点位类型：1途经点 2风险点 3休息点 4补给点',
    `name` VARCHAR(64) NOT NULL COMMENT '点位名称',
    `description` VARCHAR(256) DEFAULT NULL COMMENT '点位描述',
    `latitude` DECIMAL(10,7) NOT NULL COMMENT '纬度',
    `longitude` DECIMAL(10,7) NOT NULL COMMENT '经度',
    `elevation` INT DEFAULT NULL COMMENT '海拔（米）',
    `sequence` INT NOT NULL DEFAULT 0 COMMENT '顺序号',
    `risk_level` TINYINT DEFAULT NULL COMMENT '风险等级：1低 2中 3高（仅风险点）',
    `risk_tip` VARCHAR(256) DEFAULT NULL COMMENT '风险提示（仅风险点）',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_route_id` (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='路线点位表';

-- =============================================
-- 8. 签到点表 (checkpoint)
-- =============================================
DROP TABLE IF EXISTS `checkpoint`;
CREATE TABLE `checkpoint` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `route_id` BIGINT NOT NULL COMMENT '路线ID',
    `name` VARCHAR(64) NOT NULL COMMENT '签到点名称',
    `description` VARCHAR(256) DEFAULT NULL COMMENT '签到点描述',
    `latitude` DECIMAL(10,7) NOT NULL COMMENT '纬度',
    `longitude` DECIMAL(10,7) NOT NULL COMMENT '经度',
    `radius` INT NOT NULL DEFAULT 100 COMMENT '有效签到半径（米）',
    `sequence` INT NOT NULL DEFAULT 0 COMMENT '顺序号（1=集合点，最大=终点）',
    `checkpoint_type` TINYINT NOT NULL DEFAULT 2 COMMENT '类型：1集合点 2途中点 3终点',
    `is_required` TINYINT NOT NULL DEFAULT 1 COMMENT '是否必签：0否 1是',
    `expected_arrive_minutes` INT DEFAULT NULL COMMENT '预计到达时间（从出发算起，分钟）',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_route_id` (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到点表';

-- =============================================
-- 9. 签到记录表 (check_in_record)
-- =============================================
DROP TABLE IF EXISTS `check_in_record`;
CREATE TABLE `check_in_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `activity_id` BIGINT NOT NULL COMMENT '活动ID',
    `checkpoint_id` BIGINT NOT NULL COMMENT '签到点ID',
    `check_in_time` DATETIME NOT NULL COMMENT '签到时间',
    `latitude` DECIMAL(10,7) NOT NULL COMMENT '签到时纬度',
    `longitude` DECIMAL(10,7) NOT NULL COMMENT '签到时经度',
    `distance_to_checkpoint` INT DEFAULT NULL COMMENT '距签到点距离（米）',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1正常 2迟到 3补签',
    `remark` VARCHAR(256) DEFAULT NULL COMMENT '备注',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_user_activity_checkpoint` (`user_id`, `activity_id`, `checkpoint_id`),
    INDEX `idx_activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到记录表';

-- =============================================
-- 10. 轨迹记录表 (track_record)
-- =============================================
DROP TABLE IF EXISTS `track_record`;
CREATE TABLE `track_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `activity_id` BIGINT NOT NULL COMMENT '活动ID',
    `latitude` DECIMAL(10,7) NOT NULL COMMENT '纬度',
    `longitude` DECIMAL(10,7) NOT NULL COMMENT '经度',
    `elevation` INT DEFAULT NULL COMMENT '海拔（米）',
    `accuracy` INT DEFAULT NULL COMMENT '定位精度（米）',
    `speed` DECIMAL(5,2) DEFAULT NULL COMMENT '移动速度（km/h）',
    `record_time` DATETIME NOT NULL COMMENT '记录时间',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_activity` (`user_id`, `activity_id`),
    INDEX `idx_record_time` (`record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轨迹记录表';

-- =============================================
-- 11. 预警事件表 (alert_event)
-- =============================================
DROP TABLE IF EXISTS `alert_event`;
CREATE TABLE `alert_event` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `activity_id` BIGINT NOT NULL COMMENT '活动ID',
    `user_id` BIGINT NOT NULL COMMENT '触发用户ID',
    `alert_type` TINYINT NOT NULL COMMENT '预警类型：1偏离路线 2严重偏离 3长时间静止 4超时未签到 5失联',
    `alert_level` TINYINT NOT NULL DEFAULT 1 COMMENT '预警级别：1警告 2严重',
    `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '触发时纬度',
    `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '触发时经度',
    `description` VARCHAR(256) DEFAULT NULL COMMENT '预警描述',
    `trigger_time` DATETIME NOT NULL COMMENT '触发时间',
    `handle_status` TINYINT NOT NULL DEFAULT 0 COMMENT '处理状态：0未处理 1处理中 2已处理 3已忽略',
    `handle_by` BIGINT DEFAULT NULL COMMENT '处理人ID',
    `handle_time` DATETIME DEFAULT NULL COMMENT '处理时间',
    `handle_remark` VARCHAR(256) DEFAULT NULL COMMENT '处理备注',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_activity_id` (`activity_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_handle_status` (`handle_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预警事件表';

-- =============================================
-- 12. 评价表 (review)
-- =============================================
DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `activity_id` BIGINT NOT NULL COMMENT '活动ID',
    `overall_rating` TINYINT NOT NULL COMMENT '整体评分：1-5星',
    `route_rating` TINYINT DEFAULT NULL COMMENT '路线评分：1-5星',
    `organization_rating` TINYINT DEFAULT NULL COMMENT '组织评分：1-5星',
    `safety_rating` TINYINT DEFAULT NULL COMMENT '安全评分：1-5星',
    `content` VARCHAR(512) DEFAULT NULL COMMENT '评价内容',
    `images` VARCHAR(1024) DEFAULT NULL COMMENT '评价图片URL（多个逗号分隔）',
    `is_anonymous` TINYINT NOT NULL DEFAULT 0 COMMENT '是否匿名：0否 1是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0隐藏 1显示',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_user_activity` (`user_id`, `activity_id`),
    INDEX `idx_activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评价表';

-- =============================================
-- 13. 消息表 (message)
-- =============================================
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id` BIGINT NOT NULL COMMENT '接收用户ID',
    `title` VARCHAR(128) NOT NULL COMMENT '消息标题',
    `content` VARCHAR(512) NOT NULL COMMENT '消息内容',
    `message_type` TINYINT NOT NULL DEFAULT 1 COMMENT '消息类型：1系统通知 2报名通知 3活动通知 4预警通知',
    `related_id` BIGINT DEFAULT NULL COMMENT '关联业务ID（如活动ID）',
    `related_type` VARCHAR(32) DEFAULT NULL COMMENT '关联业务类型（如activity）',
    `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读：0否 1是',
    `read_time` DATETIME DEFAULT NULL COMMENT '阅读时间',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- =============================================
-- 14. 字典类型表 (dict_type)
-- =============================================
DROP TABLE IF EXISTS `dict_type`;
CREATE TABLE `dict_type` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `dict_name` VARCHAR(64) NOT NULL COMMENT '字典名称',
    `dict_code` VARCHAR(64) NOT NULL COMMENT '字典编码（唯一）',
    `description` VARCHAR(256) DEFAULT NULL COMMENT '描述',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_dict_code` (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典类型表';

-- =============================================
-- 15. 字典数据表 (dict_data)
-- =============================================
DROP TABLE IF EXISTS `dict_data`;
CREATE TABLE `dict_data` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `dict_type_id` BIGINT NOT NULL COMMENT '字典类型ID',
    `dict_code` VARCHAR(64) NOT NULL COMMENT '所属字典编码',
    `label` VARCHAR(64) NOT NULL COMMENT '显示标签',
    `value` VARCHAR(64) NOT NULL COMMENT '数据值',
    `sequence` INT NOT NULL DEFAULT 0 COMMENT '排序号',
    `is_default` TINYINT NOT NULL DEFAULT 0 COMMENT '是否默认：0否 1是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0禁用 1正常',
    `remark` VARCHAR(256) DEFAULT NULL COMMENT '备注',
    `create_by` BIGINT DEFAULT NULL COMMENT '创建者ID',
    `update_by` BIGINT DEFAULT NULL COMMENT '更新者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_dict_code` (`dict_code`),
    UNIQUE INDEX `idx_dict_code_value` (`dict_code`, `value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典数据表';


-- =============================================
-- 初始数据：管理员账号
-- 用户名：admin
-- 密码：123666888ysy（BCrypt加密后）
-- =============================================
INSERT INTO `user` (`username`, `password`, `nickname`, `role`, `status`, `create_time`, `update_time`) VALUES
('admin', '$2a$10$Hbr4de9o1K0f37SEL3Q2ZunGcHcl0UM9xzsaoRyb6UJPCHt0Cu.sq', '系统管理员', 2, 1, NOW(), NOW());

-- 管理员档案
INSERT INTO `user_profile` (`user_id`, `real_name`, `gender`, `experience_level`, `create_time`, `update_time`) VALUES
(1, '管理员', 1, 4, NOW(), NOW());


-- =============================================
-- 初始数据：字典类型
-- =============================================
INSERT INTO `dict_type` (`dict_name`, `dict_code`, `description`, `status`) VALUES
('用户角色', 'user_role', '用户角色类型', 1),
('用户状态', 'user_status', '用户账号状态', 1),
('性别', 'gender', '性别选项', 1),
('徒步经验等级', 'experience_level', '用户徒步经验等级', 1),
('活动状态', 'activity_status', '活动状态流转', 1),
('难度等级', 'difficulty_level', '路线/活动难度等级', 1),
('报名状态', 'registration_status', '报名审核状态', 1),
('签到点类型', 'checkpoint_type', '签到点类型', 1),
('签到状态', 'check_in_status', '签到记录状态', 1),
('预警类型', 'alert_type', '安全预警类型', 1),
('预警级别', 'alert_level', '预警严重程度', 1),
('处理状态', 'handle_status', '预警处理状态', 1),
('消息类型', 'message_type', '站内消息类型', 1),
('点位类型', 'point_type', '路线点位类型', 1);


-- =============================================
-- 初始数据：字典数据
-- =============================================

-- 用户角色
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(1, 'user_role', '普通用户', '0', 1),
(1, 'user_role', '组织者', '1', 2),
(1, 'user_role', '管理员', '2', 3);

-- 用户状态
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(2, 'user_status', '禁用', '0', 1),
(2, 'user_status', '正常', '1', 2);

-- 性别
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(3, 'gender', '未知', '0', 1),
(3, 'gender', '男', '1', 2),
(3, 'gender', '女', '2', 3);

-- 徒步经验等级
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(4, 'experience_level', '新手', '0', 1),
(4, 'experience_level', '初级', '1', 2),
(4, 'experience_level', '中级', '2', 3),
(4, 'experience_level', '高级', '3', 4),
(4, 'experience_level', '专业', '4', 5);

-- 活动状态
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(5, 'activity_status', '草稿', '0', 1),
(5, 'activity_status', '待审核', '1', 2),
(5, 'activity_status', '已发布', '2', 3),
(5, 'activity_status', '进行中', '3', 4),
(5, 'activity_status', '已结束', '4', 5),
(5, 'activity_status', '已取消', '5', 6),
(5, 'activity_status', '已驳回', '6', 7);

-- 难度等级
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(6, 'difficulty_level', '休闲', '1', 1),
(6, 'difficulty_level', '简单', '2', 2),
(6, 'difficulty_level', '中等', '3', 3),
(6, 'difficulty_level', '困难', '4', 4),
(6, 'difficulty_level', '极限', '5', 5);

-- 报名状态
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(7, 'registration_status', '待审核', '0', 1),
(7, 'registration_status', '已通过', '1', 2),
(7, 'registration_status', '已拒绝', '2', 3),
(7, 'registration_status', '候补中', '3', 4),
(7, 'registration_status', '已取消', '4', 5),
(7, 'registration_status', '已缺席', '5', 6);

-- 签到点类型
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(8, 'checkpoint_type', '集合点', '1', 1),
(8, 'checkpoint_type', '途中点', '2', 2),
(8, 'checkpoint_type', '终点', '3', 3);

-- 签到状态
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(9, 'check_in_status', '正常', '1', 1),
(9, 'check_in_status', '迟到', '2', 2),
(9, 'check_in_status', '补签', '3', 3);

-- 预警类型
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(10, 'alert_type', '偏离路线', '1', 1),
(10, 'alert_type', '严重偏离', '2', 2),
(10, 'alert_type', '长时间静止', '3', 3),
(10, 'alert_type', '超时未签到', '4', 4),
(10, 'alert_type', '失联', '5', 5);

-- 预警级别
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(11, 'alert_level', '警告', '1', 1),
(11, 'alert_level', '严重', '2', 2);

-- 处理状态
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(12, 'handle_status', '未处理', '0', 1),
(12, 'handle_status', '处理中', '1', 2),
(12, 'handle_status', '已处理', '2', 3),
(12, 'handle_status', '已忽略', '3', 4);

-- 消息类型
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(13, 'message_type', '系统通知', '1', 1),
(13, 'message_type', '报名通知', '2', 2),
(13, 'message_type', '活动通知', '3', 3),
(13, 'message_type', '预警通知', '4', 4);

-- 点位类型
INSERT INTO `dict_data` (`dict_type_id`, `dict_code`, `label`, `value`, `sequence`) VALUES
(14, 'point_type', '途经点', '1', 1),
(14, 'point_type', '风险点', '2', 2),
(14, 'point_type', '休息点', '3', 3),
(14, 'point_type', '补给点', '4', 4);


-- =============================================
-- 执行完成提示
-- =============================================
SELECT '数据库初始化完成！' AS message;
SELECT '管理员账号：admin' AS account;
SELECT '管理员密码：123' AS password;

