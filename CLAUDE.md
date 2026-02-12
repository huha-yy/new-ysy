# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

户外徒步活动管理系统 - 基于 Spring Boot（后端）和 React（前端）的全栈 Web 应用。系统服务于徒步爱好者、活动组织者和管理员，提供活动发布、报名管理、实时签到、路线规划和 GPS 轨迹追踪等功能。

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

### 前端 (React 18 + Vite 5)
```bash
cd frontend
npm install                # 安装依赖
npm run dev                # 运行开发服务器 (http://localhost:5173)
npm run build              # 生产环境构建
npm run preview            # 预览生产构建
```

### 数据库
```bash
mysql -u root -p
CREATE DATABASE hiking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# 从 系统实现与设计/hiking_system.sql 导入数据库架构
# 数据库凭据在 backend/src/main/resources/application.yml
```

## 系统架构

### 后端架构

入口类：`com.hiking.hikingbackend.HikingApplication`（启用了 `@EnableScheduling`）

**包结构** (`backend/src/main/java/com/hiking/hikingbackend/`)：
- `module/` — 按领域划分的业务模块，每个模块含 controller/service/mapper/entity/dto/vo：
  - `activity/` - 活动生命周期（创建、审核、发布、取消）+ 集合方案
  - `registration/` - 报名工作流（申请、审核、候补）
  - `checkin/` - GPS 签到、轨迹记录（TrackRecord）、偏离预警（AlertEvent）
  - `route/` - 路线规划及路点
  - `user/` - 用户认证（JWT）、个人资料、徒步档案
  - `admin/` - 管理员操作（审核、用户管理、统计）
  - `message/` - 站内消息通知
  - `review/` - 活动评价与评分
  - `file/` - 文件上传
  - `system/` - 字典数据管理
- `security/` — `JwtAuthenticationFilter`、`CustomUserDetailsService`
- `config/` — `SecurityConfig`、`CorsConfig`、`MyBatisPlusConfig`、`WebMvcConfig`、`OpenApiConfig`、`JwtProperties`
- `common/` — `result/Result.java`（统一响应）、`exception/`（全局异常处理）、`utils/`（JwtUtils、SecurityUtils、GeoUtils）

**关键依赖版本**：MyBatis-Plus 3.5.5、JJWT 0.12.3、SpringDoc 2.3.0、Knife4j 4.3.0

**安全机制**：基于 JWT 的 Spring Security 认证（无状态 Session）
- Token 格式：`Authorization: Bearer <token>`，有效期 24 小时
- 公开端点：`/auth/**`、`/activities/**`、`/routes/**`、`/dict/data/**`、`/file/**`、`/uploads/**`
- 角色：USER、ORGANIZER、ADMIN

**数据层**：MyBatis-Plus
- 实体类使用 `@TableName`、`@TableId(type = IdType.AUTO)`
- 逻辑删除：`deleted` 字段（0=有效，1=已删除）
- 时间戳自动填充：`create_time`、`update_time`（通过 `MyMetaObjectHandler`）
- Mapper XML 文件位于 `backend/src/main/resources/mapper/`

**文件上传**：`application.yml` 中 `file.upload-path` 配置，项目支持 Windows 和 macOS 双平台：
- **macOS**：`/Users/yangshuyun/Desktop/毕业设计/new-ysy/uploads`
- **Windows**：`E:/1huah毕业设计/new-户外徒步/ysy/uploads`
- **重要**：修改前先通过 `uname` 判断当前平台，启用对应路径并注释另一个。

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
- 后端：`SecurityUtils.getCurrentUserId()` 获取当前用户 ID
- 前端：Token 由拦截器自动附加，通过 `utils/storage.js` 管理

### 路线点位类型
START（起点）、END（终点）、WAYPOINT（路点）、REST_POINT（休息点）、SCENIC_POINT（景点）、DANGER_POINT（危险点）
每个点位：`{latitude, longitude, altitude, pointType, description, sequence}`

## 数据库约定

- 主键：`id`（AUTO_INCREMENT）
- 软删除：`deleted` 字段（MyBatis-Plus 管理）
- 自动时间戳：`create_time`、`update_time`
- 常见外键：`user_id`、`activity_id`、`route_id`
- SQL 文件：`系统实现与设计/hiking_system.sql`

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

JDK 17+、Node.js 16+、MySQL 8.0+、Maven 3.6+

## 配置文件

- 后端：`backend/src/main/resources/application.yml`（数据库、JWT、文件上传路径、CORS）
- 前端代理：`frontend/vite.config.js`（`/api` → `http://localhost:8080`）
