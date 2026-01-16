@startuml
skinparam sequenceMessageAlign center

title 签到管理-GPS签到时序图

participant "User" as User
participant "React" as React
participant "Controller" as Controller
participant "Service" as Service
participant "Mapper" as Mapper
participant "MySQL" as MySQL

User -> React: 1. 点击"签到"按钮
activate React

React -> React: 2. 获取当前GPS位置

React -> Controller: 3. POST /api/checkin\n(携带JWT Token)
activate Controller

Controller -> Controller: 4. JWT认证\n@Valid参数校验

Controller -> Service: 5. performCheckIn(userId, activityId, checkInDTO)
activate Service

Service -> Mapper: 6. 校验报名和活动状态
activate Mapper
Mapper -> MySQL: 查询报名记录和活动信息
activate MySQL
MySQL --> Mapper: 报名已通过、活动进行中
deactivate MySQL
Mapper --> Service: 校验通过
deactivate Mapper

Service -> Mapper: 7. 获取签到点信息
activate Mapper
Mapper -> MySQL: SELECT * FROM checkpoint
activate MySQL
MySQL --> Mapper: 签到点坐标和半径
deactivate MySQL
Mapper --> Service: 签到点信息
deactivate Mapper

Service -> Service: 8. 计算距离并判断\n是否在有效半径内

Service -> Mapper: 9. 插入签到记录
activate Mapper
Mapper -> MySQL: INSERT INTO check_in_record
activate MySQL
MySQL --> Mapper: 返回签到ID
deactivate MySQL
Mapper --> Service: 签到ID
deactivate Mapper

Service --> Controller: 10. 返回签到结果
deactivate Service

Controller --> React: 11. 成功响应
deactivate Controller

React --> User: 12. 显示"签到成功"
deactivate React

@enduml