# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

户外徒步活动管理系统 - 基于 Spring Boot（后端）和 React（前端）的全栈 Web 应用。系统服务于徒步爱好者、活动组织者和管理员，提供活动发布、报名管理、实时签到、路线规划和 GPS 轨迹追踪等功能。

**当前平台**：Windows 11

## 开发命令

### 后端 (Spring Boot 3.2.0 + JDK 17)
```bash
cd backend
mvn clean install          # 构建项目
mvn spring-boot:run        # 运行后端服务 (http://localhost:8080)
mvn test                   # 运行测试
```

- API 文档：http://localhost:8080/api/doc.html (Knife4j)
- Swagger：http://localhost:8080/api/swagger-ui.html
- 注意：`server.servlet.context-path` 为 `/api`，所有后端接口实际路径为 `/api/...`
- 目前项目无单元测试
- `maven-enforcer-plugin` 强制要求 JDK 17（不接受其他版本）

### 前端 (React 18 + Vite 5)
```bash
cd frontend
npm install                # 安装依赖
npm run dev                # 运行开发服务器 (http://localhost:5173)
npm run build              # 生产环境构建
npm run preview            # 预览生产构建
```

- 无 ESLint/Prettier 配置，项目未设置代码格式化工具

### 数据库
```bash
mysql -u root -p
CREATE DATABASE hiking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# 从 sql/hiking_system0210.sql 导入数据库架构
# 数据库凭据在 backend/src/main/resources/application.yml
```

- **MySQL 凭据**：用户名 `root`，密码 `123666888`，数据库 `hiking_system`
- **Windows**：确保 MySQL 服务已启动（服务管理器中查看 `MySQL` 服务）

## 系统架构

### 后端架构

入口类：`com.hiking.hikingbackend.HikingApplication`（启用了 `@EnableScheduling`）

**包结构** (`backend/src/main/java/com/hiking/hikingbackend/`)：
- `module/` — 按领域划分的业务模块，每个模块含 controller/service/mapper/entity/dto/vo：
  - `activity/` - 活动生命周期（创建、审核、发布、取消）+ 集合方案（GatheringPlan）
  - `registration/` - 报名工作流（申请、审核、候补）
  - `checkin/` - GPS 签到、轨迹记录（TrackRecord）、偏离预警（AlertEvent）
  - `route/` - 路线规划、路点（RoutePoint）、检查点（Checkpoint）
  - `user/` - 用户认证（JWT）、个人资料（UserProfile）、徒步档案
  - `admin/` - 管理员操作（活动审核、用户管理、统计报表、仪表盘）
  - `message/` - 站内消息通知
  - `review/` - 活动评价与评分
  - `file/` - 文件上传（头像、活动图片）
  - `system/` - 字典数据管理（DictType、DictData）
- `security/` — `JwtAuthenticationFilter`、`CustomUserDetailsService`
- `config/` — `SecurityConfig`、`CorsConfig`、`MyBatisPlusConfig`、`WebMvcConfig`、`OpenApiConfig`、`JwtProperties`
- `common/` — `result/Result.java`（统一响应）、`exception/`（全局异常处理）、`utils/`（JwtUtils、SecurityUtils、GeoUtils）

**关键依赖版本**：MyBatis-Plus 3.5.5、JJWT 0.12.3、SpringDoc 2.3.0、Knife4j 4.3.0

**安全机制**：基于 JWT 的 Spring Security 认证（无状态 Session）
- Token 格式：`Authorization: Bearer <token>`，有效期 24 小时
- 公开端点：`/auth/**`、`/activities/**`、`/routes/**`、`/dict/data/**`、`/file/**`、`/uploads/**`
- 角色：USER、ORGANIZER、ADMIN

**异常处理**：`GlobalExceptionHandler` 统一捕获异常，返回 `Result` 格式
- 业务异常使用 `throw new BusinessException("错误信息")` 或 `throw new BusinessException(code, "错误信息")`
- 参数校验异常（`@Valid`/`@Validated`）自动捕获并返回字段级错误信息

**定时任务**（`checkin/scheduler/AlertScheduledTasks.java`）：
- 每 5 分钟检测超时未签到用户和失联用户
- 每小时输出预警任务汇总日志

**数据层**：MyBatis-Plus
- 实体类使用 `@TableName`、`@TableId(type = IdType.AUTO)`
- 逻辑删除：`deleted` 字段（0=有效，1=已删除）
- 时间戳自动填充：`create_time`、`update_time`（通过 `MyMetaObjectHandler`）
- Mapper XML 文件位于 `backend/src/main/resources/mapper/`（目前仅 `AdminMapper.xml` 使用 XML，其余 Mapper 均通过 MyBatis-Plus 注解实现）

**文件上传**：`application.yml` 中 `file.upload-path` 配置
- 当前配置（Windows）：`E:/1huah毕业设计/new-户外徒步/ysy/uploads`
- 如需切换平台，修改 `application.yml` 中的 `file.upload-path` 路径

### 前端架构

**路由**：React Router v6 懒加载（`src/router/index.jsx`）
- 公开路由：`/`、`/activities`、`/activities/:id`、`/login`、`/register`
- 用户路由：`/user/*`（profile、hiking-profile、registrations、messages、my-location）
- 组织者路由：`/organizer/*`（activities、routes、checkin monitor、alerts、gathering）
- 管理员路由：`/admin/*`（dashboard、activities audit、users、statistics、registrations）
- 受保护路由通过 `AuthRoute` 组件包装，含 Suspense + ErrorBoundary

**API 层** (`src/api/request.js`)：Axios 实例
- Base URL：`/api`（Vite 代理到 `http://localhost:8080`），超时 10 秒
- 请求拦截器：从 localStorage 添加 `Bearer` token
- 响应拦截器：自动提取 `data` 字段，401/403 清除 token 并跳转 `/login`

**状态管理**：React hooks + localStorage（无 Redux/Context）
- Token/用户信息通过 `utils/storage.js` 管理（`getToken`、`setToken`、`getUser`、`setUser`、`removeToken`、`removeUser`）

**UI**：Ant Design 5.12.0 + @ant-design/icons + Day.js

**路径别名**：`@` → `./src`（`vite.config.js`）

## 核心业务流程

### 活动生命周期
DRAFT（草稿）→ PENDING_AUDIT（待审核）→ PUBLISHED（已发布）/ REJECTED（已驳回）→ IN_PROGRESS（进行中）→ COMPLETED（已完成）

### 报名流程
用户申请 → 系统检查容量/时间冲突 → 组织者审核（APPROVED / REJECTED / WAITLIST）→ 通过者可签到

### 签到系统
基于 GPS 位置验证 → 实时轨迹记录 → 偏离路线预警 → 路点检查点验证

## 重要开发模式

### 后端响应格式
```json
{"code": 200, "message": "操作成功", "data": {}, "timestamp": 1703318400000}
```
Controller 中使用 `Result.success(data)` 或 `Result.error(message)`。

### 前端 API 调用
```javascript
import request from '@/api/request'
const activities = await request.get('/activities')  // 响应拦截器自动提取 data
```

### 身份认证
- 后端：`SecurityUtils` 工具类（`common/utils/SecurityUtils.java`）
  - `getCurrentUserId()` 获取当前用户 ID
  - `getCurrentUsername()` 获取当前用户名
  - `getCurrentUserRole()` 获取当前用户角色
  - `isAuthenticated()` 判断是否已登录
- 前端：Token 由拦截器自动附加，通过 `utils/storage.js` 管理
- 角色常量：USER (0)、ORGANIZER (1)、ADMIN (2)

### 状态常量 (`frontend/src/utils/constants.js`)
- ACTIVITY_STATUS: DRAFT (0) → PENDING (1) → PUBLISHED (2) → IN_PROGRESS (3) → ENDED (4)，另有 CANCELLED (5)、REJECTED (6)
- REGISTRATION_STATUS: PENDING (0)、APPROVED (1)、REJECTED (2)、WAITING (3)、CANCELLED (4)、ABSENT (5)
- DIFFICULTY: EASY (1)、SIMPLE (2)、MEDIUM (3)、HARD (4)、EXTREME (5)

### 路线点位类型
START（起点）、END（终点）、WAYPOINT（路点）、REST_POINT（休息点）、SCENIC_POINT（景点）、DANGER_POINT（危险点）
每个点位：`{latitude, longitude, altitude, pointType, description, sequence}`

### 前端 API 层组织 (`frontend/src/api/`)
每个业务模块对应一个 API 文件：`activity.js`、`checkin.js`、`registration.js`、`route.js`、`user.js`、`message.js`、`review.js`、`alert.js`、`admin.js`、`file.js`、`dict.js`、`weather.js`、`index.js`
- 所有文件 import `request` from `@/api/request` 并导出具名函数
- `request.js` 导出 `get`、`post`、`put`、`delete`、`patch` 方法，响应拦截器自动提取 `data` 字段
- 支持 `silentError` 配置项抑制错误提示：`request.get('/url', params, { silentError: true })`

### 高德地图集成 (`frontend/src/utils/map.js`)
- API 版本：2.0，需要同时配置 API Key 和 securityJsCode（当前硬编码在文件中）
- **安全提示**：API Key 硬编码在前端代码中，生产环境应移至环境变量或后端代理
- 加载方式：`loadAmapScript()` 返回 `window.AMap`
- 已加载插件：Geolocation、Marker、Polyline、Polygon、Scale、ToolBar、PlaceSearch、Geocoder
- 坐标系转换：内置 WGS84 ↔ GCJ02 ↔ BD09 转换函数（GPS 原始坐标需转 GCJ02 后才能在高德地图上使用）
- 地图组件：`src/components/MapView/MapView.jsx`，支持 `onMapClick` 回调
- 距离计算：`calculateDistance()` 使用 Haversine 公式，`isInRadius()` 检查点是否在范围内

## 数据库约定

- 主键：`id`（AUTO_INCREMENT）
- 软删除：`deleted` 字段（MyBatis-Plus 管理）
- 自动时间戳：`create_time`、`update_time`
- 常见外键：`user_id`、`activity_id`、`route_id`
- SQL 文件：`sql/hiking_system0210.sql`

### 核心数据表
`user`、`user_profile`、`activity`、`registration`、`gathering_plan`、`route`、`route_point`、`checkpoint`、`check_in_record`、`track_record`、`alert_event`、`review`、`message`、`dict_type`、`dict_data`

## 主要 API 端点

- 认证：`POST /auth/login`、`POST /auth/register`、`GET /auth/profile`
- 活动：`GET/POST /activities`、`GET/PUT /activities/{id}`、`POST /activities/{id}/audit`
- 报名：`POST /registrations`、`GET /registrations/my`、`PUT /registrations/{id}/status`
- 签到：`GET /checkin/points/{activityId}`、`POST /checkin/record`、`GET /checkin/track/{activityId}`、`GET /checkin/alerts`
- 路线：`GET/POST /routes`、`GET/PUT /routes/{id}`

注意：所有端点实际前缀为 `/api`（context-path）

## 环境要求

JDK 17（enforcer 限制 `[17,18)`，不接受其他版本）、Node.js 16+、MySQL 8.0+、Maven 3.6+

## 常见问题排查

### 后端启动失败
- 检查 JDK 版本必须是 17（`java -version`）
- 检查 MySQL 服务是否启动
- 检查数据库 `hiking_system` 是否存在

### 前端代理 404
- 确保后端在 8080 端口运行
- 所有 API 请求路径前缀为 `/api`（由 context-path 配置）

### 定位/地图不工作
- 检查浏览器是否授权定位权限
- 高德地图 API Key 可能需要更新（`frontend/src/utils/map.js`）

## 配置文件

- 后端：`backend/src/main/resources/application.yml`（数据库、JWT、文件上传路径、CORS）
- 前端代理：`frontend/vite.config.js`（`/api` → `http://localhost:8080`）
