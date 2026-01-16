# 户外徒步活动管理系统E-R图（详细版）

## PlantUML代码

```plantuml
@startuml 户外徒步活动管理系统E-R图

!define ENTITY class
!define PK <b>PK</b>
!define FK <b>FK</b>

skinparam linetype ortho
skinparam class {
    BackgroundColor WhiteSmoke
    BorderColor Black
    ArrowColor Black
    FontSize 11
}
skinparam padding 2
skinparam nodesep 50
skinparam ranksep 60

' ========== 用户相关实体 ==========
entity "User\n用户" as user {
    PK id : BIGINT
    username : VARCHAR(32)
    password : VARCHAR(64)
    phone : VARCHAR(16)
    email : VARCHAR(64)
    role : TINYINT
    status : TINYINT
}

entity "UserProfile\n用户档案" as user_profile {
    PK id : BIGINT
    FK user_id : BIGINT
    real_name : VARCHAR(32)
    gender : TINYINT
    health_status : VARCHAR(256)
    emergency_contact : VARCHAR(32)
    emergency_phone : VARCHAR(16)
}

' ========== 活动相关实体 ==========
entity "Activity\n活动" as activity {
    PK id : BIGINT
    title : VARCHAR(128)
    FK organizer_id : BIGINT
    FK route_id : BIGINT
    activity_date : DATE
    start_time : TIME
    max_participants : INT
    difficulty_level : TINYINT
    status : TINYINT
}

entity "Registration\n报名" as registration {
    PK id : BIGINT
    FK user_id : BIGINT
    FK activity_id : BIGINT
    status : TINYINT
    audit_by : BIGINT
    audit_time : DATETIME
}

entity "GatheringPlan\n集合方案" as gathering_plan {
    PK id : BIGINT
    FK activity_id : BIGINT
    gathering_time : DATETIME
    gathering_address : VARCHAR(256)
    gathering_latitude : DECIMAL(10,7)
    gathering_longitude : DECIMAL(10,7)
}

' ========== 路线相关实体 ==========
entity "Route\n路线" as route {
    PK id : BIGINT
    name : VARCHAR(128)
    FK creator_id : BIGINT
    difficulty_level : TINYINT
    total_distance : DECIMAL(6,2)
    elevation_gain : INT
    region : VARCHAR(64)
}

entity "RoutePoint\n路线点位" as route_point {
    PK id : BIGINT
    FK route_id : BIGINT
    point_type : TINYINT
    name : VARCHAR(64)
    latitude : DECIMAL(10,7)
    longitude : DECIMAL(10,7)
}

entity "Checkpoint\n签到点" as checkpoint {
    PK id : BIGINT
    FK route_id : BIGINT
    name : VARCHAR(64)
    latitude : DECIMAL(10,7)
    longitude : DECIMAL(10,7)
    radius : INT
    checkpoint_type : TINYINT
}

' ========== 签到与监控实体 ==========
entity "CheckInRecord\n签到记录" as check_in_record {
    PK id : BIGINT
    FK user_id : BIGINT
    FK activity_id : BIGINT
    FK checkpoint_id : BIGINT
    check_in_time : DATETIME
    status : TINYINT
}

entity "TrackRecord\n轨迹记录" as track_record {
    PK id : BIGINT
    FK user_id : BIGINT
    FK activity_id : BIGINT
    latitude : DECIMAL(10,7)
    longitude : DECIMAL(10,7)
    record_time : DATETIME
}

entity "AlertEvent\n预警事件" as alert_event {
    PK id : BIGINT
    FK activity_id : BIGINT
    FK user_id : BIGINT
    alert_type : TINYINT
    alert_level : TINYINT
    handle_status : TINYINT
}

' ========== 评价与消息实体 ==========
entity "Review\n评价" as review {
    PK id : BIGINT
    FK user_id : BIGINT
    FK activity_id : BIGINT
    overall_rating : TINYINT
    content : VARCHAR(512)
}

entity "Message\n消息" as message {
    PK id : BIGINT
    FK user_id : BIGINT
    title : VARCHAR(128)
    content : VARCHAR(512)
    message_type : TINYINT
}

' ========== 关系定义 ==========

' 用户相关
user ||--|| user_profile : "拥有"
user ||--o{ activity : "组织"
user ||--o{ route : "创建"
user ||--o{ message : "接收"

' 活动相关
user ||--o{ registration
activity ||--o{ registration
activity ||--|| gathering_plan : "制定"
activity }o--|| route : "使用"

' 路线相关
route ||--o{ route_point
route ||--o{ checkpoint

' 签到相关
user ||--o{ check_in_record
activity ||--o{ check_in_record
checkpoint ||--o{ check_in_record

' 追踪相关
user ||--o{ track_record
activity ||--o{ track_record

' 预警相关
user ||--o{ alert_event
activity ||--o{ alert_event

' 评价相关
user ||--o{ review
activity ||--o{ review

@enduml
```

## 说明

### 图表优化说明

本版本对E-R图进行了**紧凑化处理**：
- 减少了实体中的冗余属性，只显示核心字段
- 优化了布局间距，使整体更紧凑
- 简化了关系标签，提高可读性
- 保持了完整的实体关系结构

### 核心实体（13个）

| 实体 | 说明 | 核心字段 |
|------|------|---------|
| User | 用户账号 | username, password, phone, role |
| UserProfile | 用户档案 | real_name, health_status, emergency_contact |
| Activity | 徒步活动 | title, activity_date, difficulty_level, status |
| Route | 徒步路线 | name, total_distance, elevation_gain |
| Registration | 报名记录 | user_id, activity_id, status |
| GatheringPlan | 集合方案 | gathering_time, gathering_address |
| Checkpoint | 签到点 | name, latitude, longitude, radius |
| RoutePoint | 路线点位 | point_type, name, latitude, longitude |
| CheckInRecord | 签到记录 | user_id, activity_id, checkpoint_id |
| TrackRecord | 轨迹记录 | user_id, activity_id, latitude, longitude |
| AlertEvent | 预警事件 | alert_type, alert_level, handle_status |
| Review | 活动评价 | user_id, activity_id, overall_rating |
| Message | 系统消息 | user_id, title, message_type |

### 主要关系

| 关系 | 类型 | 说明 |
|------|------|------|
| User ↔ UserProfile | 1:1 | 一个用户对应一份档案 |
| User → Activity | 1:N | 用户可组织多个活动 |
| User → Route | 1:N | 用户可创建多条路线 |
| User ↔ Activity | M:N | 通过Registration实现报名 |
| Activity ↔ GatheringPlan | 1:1 | 活动对应集合方案 |
| Activity → Route | N:1 | 多活动可用同一路线 |
| Route → RoutePoint | 1:N | 路线包含多个点位 |
| Route → Checkpoint | 1:N | 路线包含多个签到点 |
| User + Activity + Checkpoint | M:N:N | 通过CheckInRecord实现签到 |
| User + Activity | M:N | 通过TrackRecord记录轨迹 |
| User + Activity | M:N | 通过AlertEvent记录预警 |
| User + Activity | M:N | 通过Review实现评价 |
| User → Message | 1:N | 用户接收多条消息 |

### 特殊说明

1. **精简字段**：图中只显示核心字段，完整字段请参考数据库设计文档
2. **关联实体**：Registration、CheckInRecord等为中间表，实现多对多关系
3. **公共字段**：所有表都包含create_by, update_by, create_time, update_time（图中未显示）

