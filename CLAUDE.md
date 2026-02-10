# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

户外徒步活动管理系统 - 基于 Spring Boot（后端）和 React（前端）的全栈 Web 应用。系统服务于徒步爱好者、活动组织者和管理员，提供活动发布、报名管理、实时签到、路线规划和 GPS 轨迹追踪等功能。

## 开发命令

### 后端 (Spring Boot)
```bash
cd backend
mvn clean install          # 构建项目
mvn spring-boot:run        # 运行后端服务 (http://localhost:8080)
mvn test                   # 运行测试
```

- API 文档：http://localhost:8080/api/doc.html (Knife4j)
- Swagger：http://localhost:8080/api/swagger-ui.html
- 注意：`server.servlet.context-path` 为 `/api`，所有后端接口实际路径为 `/api/...`

### 前端 (React + Vite)
```bash
cd frontend
npm install                # 安装依赖
npm run dev                # 运行开发服务器 (http://localhost:5173)
npm run build              # 生产环境构建
npm run preview            # 预览生产构建
```

### 数据库配置
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE hiking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 在 backend/src/main/resources/application.yml 中更新数据库凭据
# 从 系统实现与设计/hiking_system.sql 导入数据库架构
```

## 系统架构

### 后端架构 (Spring Boot 3.2.0 + JDK 17)

入口类：`com.hiking.hikingbackend.HikingApplication`（启用了 `@EnableScheduling`）

**包结构** (`src/main/java/com/hiking/hikingbackend/`)：
- `module/` — 按领域划分的业务模块，每个模块含 controller/service/mapper/entity/dto：
  - `activity/` - 活动生命周期（创建、审核、发布、取消）
  - `registration/` - 报名工作流（申请、审核、候补）
  - `checkin/` - GPS 签到、轨迹记录、偏离预警
  - `route/` - 路线规划及路点（起点/终点/路点/休息点/景点/危险点）
  - `user/` - 用户认证（JWT）、个人资料、徒步档案
  - `admin/` - 管理员操作（审核、用户管理）
  - `message/` - 站内消息通知
  - `review/` - 活动评价与评分
  - `file/` - 文件上传
  - `system/` - 字典数据管理
- `security/` — JWT 认证过滤器（`JwtAuthenticationFilter`）、`CustomUserDetailsService`
- `config/` — `SecurityConfig`、`CorsConfig`、`MyBatisPlusConfig`、`WebMvcConfig`、`OpenApiConfig`、`JwtProperties`
- `common/` — `result/Result.java`（统一响应）、`exception/`（全局异常处理）、`constant/`

**安全机制**：基于 JWT 的 Spring Security 认证
- Token 格式：`Authorization: Bearer <token>` 请求头
- 公开端点：`/auth/**`、`/activities`、`/routes`、`/uploads/**`
- 受保护端点需要认证
- 基于角色的访问控制：USER、ORGANIZER、ADMIN

**数据层**：MyBatis-Plus 自动配置
- 实体类使用 `@TableName`、`@TableId(type = IdType.AUTO)`
- 逻辑删除：`deleted` 字段（0=有效，1=已删除）
- 时间戳自动填充：`create_time`、`update_time`（通过 `MyMetaObjectHandler`）
- Mapper XML 文件位于 `src/main/resources/mapper/`

**文件上传**：存储路径在 `application.yml` 的 `file.upload-path` 中配置，项目支持 Windows 和 macOS 双平台开发：
- **Windows 路径**：`E:/1huah毕业设计/new-户外徒步/ysy/uploads`
- **macOS 路径**：`/Users/yangshuyun/Desktop/毕业设计/new-ysy/uploads`
- **重要**：修改配置前必须先识别当前开发环境（通过 `uname` 命令判断），然后启用对应平台的路径，注释掉另一个平台的路径。两个路径都保留在 `application.yml` 中，用注释区分。

### 前端架构 (React 18 + Vite)

**路由**：React Router v6 懒加载（`src/router/index.jsx`）
- 公开路由：`/`、`/activities`、`/activities/:id`、`/login`、`/register`
- 用户路由（需登录）：`/user/*`（profile、hiking-profile、registrations、messages）
- 组织者路由：`/organizer/*`（activities、routes、checkin monitor、alerts、gathering）
- 管理员路由：`/admin/*`（dashboard、activities audit、users、statistics、registrations）
- 受保护路由通过 `AuthRoute` 组件包装

**API 层** (`api/`)：基于 Axios 的拦截器
- Base URL：`/api`（代理到后端）
- 请求拦截器：从 localStorage 添加 JWT token
- 响应拦截器：处理统一响应格式，401/403 自动重定向
- Token 存储：通过 `utils/storage.js` 存储在 `localStorage`

**状态管理**：React hooks + localStorage（无 Redux/Context）
- 用户信息和 token 存储在 localStorage
- 组件级状态使用 useState/useEffect

**UI 组件**：Ant Design 5.12.0
- 布局：`components/layout/MainLayout.jsx`（头部、侧边栏、内容区）
- 认证：`components/AuthRoute.jsx`（受保护路由包装器）
- 地图：`components/MapView/`（路线编辑器、GPS 追踪）

**路径别名**：`@` → `./src`（在 `vite.config.js` 中配置）

**核心工具** (`src/utils/`)：
- `storage.js` - Token/用户信息持久化
- `constants.js` - 前端常量
- `location.js` - GPS 工具函数
- `map.js` - 地图辅助函数
- `imageUrl.js` - 图片 URL 处理

**自定义 Hooks**：`src/hooks/`

## 核心业务流程

### 活动生命周期
1. 组织者创建活动（状态：DRAFT 草稿）
2. 组织者提交审核（状态：PENDING_AUDIT 待审核）
3. 管理员审核（状态：PUBLISHED 已发布 或 REJECTED 已驳回）
4. 组织者启动活动（状态：IN_PROGRESS 进行中）
5. 组织者结束活动（状态：COMPLETED 已完成）

### 报名流程
1. 用户提交报名申请
2. 系统检查容量和时间冲突
3. 组织者审核（APPROVED 通过 / REJECTED 拒绝 / WAITLIST 候补）
4. 通过审核的用户可在活动期间签到

### 签到系统
- 基于 GPS 的位置验证
- 实时轨迹记录
- 用户偏离路线时发出预警
- 在路点处进行检查点验证

## 重要开发模式

### 后端响应格式
所有 API 响应遵循以下结构：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1703318400000
}
```

在 Controller 中使用 `Result.success(data)` 或 `Result.error(message)`。

### 前端 API 调用
```javascript
import request from '@/api/request'

// 响应拦截器自动提取 data 字段
const activities = await request.get('/activities')  // 直接返回 data
```

### 身份认证
后端：使用 `SecurityUtils.getCurrentUserId()` 获取已认证用户 ID
前端：Token 由请求拦截器自动附加，通过 `storage.js` 存储

### 路线点位
路线路点类型：START（起点）、END（终点）、WAYPOINT（路点）、REST_POINT（休息点）、SCENIC_POINT（景点）、DANGER_POINT（危险点）
每个点位包含：`{latitude, longitude, altitude, pointType, description, sequence}`

## 数据库说明

- 所有表使用 `id` 作为主键（AUTO_INCREMENT）
- 通过 `deleted` 字段实现软删除（由 MyBatis-Plus 管理）
- 时间戳：`create_time`、`update_time`（通过 `MyMetaObjectHandler` 自动填充）
- 外键：`user_id`、`activity_id`、`route_id` 等

## 配置文件

- 后端配置：`backend/src/main/resources/application.yml`
  - 数据库凭据
  - JWT 密钥和过期时间
  - 文件上传路径（`file.upload-path`，Windows 和 macOS 双路径通过注释切换，详见上方"文件上传"说明）
  - CORS 设置

- 前端代理：`frontend/vite.config.js`（将 `/api` 代理到 `http://localhost:8080`）

## 当前分支

当前工作分支：`3.9` - 最近的工作涉及路线点位类型优化和地图组件改进。
