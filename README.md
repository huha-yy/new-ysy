# 户外徒步活动管理系统

一个基于 Spring Boot + React 的户外徒步活动管理平台，采用前后端分离架构，服务于徒步爱好者、活动组织者和管理员。

## 项目概述

本系统实现了从活动发布、报名审核、行前准备、签到监控到评价反馈的完整业务闭环，为户外徒步活动提供全方位的管理和支持。

- **用户端**：浏览活动、在线报名、实时签到、轨迹记录、活动评价
- **组织者端**：发布活动、审核报名、签到监控、路线管理、数据统计
- **管理端**：活动审核、用户管理、系统配置、数据分析

## 技术栈

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.0 | 基础框架 |
| JDK | 17 | 运行环境 |
| MySQL | 8.0 | 数据库 |
| MyBatis-Plus | 3.5.5 | ORM 框架 |
| Spring Security | - | 安全框架 |
| JJWT | 0.12.3 | JWT 认证 |
| SpringDoc | 3.0 | API 文档 |
| Knife4j | 4.3.0 | 接口文档 UI |
| Lombok | - | 代码简化 |

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.2.0 | UI 框架 |
| React Router | 6.21.0 | 路由管理 |
| Vite | 5.0.8 | 构建工具 |
| Ant Design | 5.12.0 | UI 组件库 |
| Axios | 1.6.2 | HTTP 客户端 |
| Day.js | 1.11.10 | 日期处理 |

## 项目结构

```
ysy/
├── backend/                          # 后端项目
│   ├── src/main/java/com/hiking/hikingbackend/
│   │   ├── common/                   # 公共模块
│   │   │   ├── constant/            # 常量定义
│   │   │   ├── exception/           # 全局异常处理
│   │   │   └── result/              # 统一响应封装
│   │   ├── config/                   # 配置类（安全、CORS、MyBatis）
│   │   ├── module/                   # 业务模块
│   │   │   ├── activity/            # 活动管理
│   │   │   ├── admin/               # 管理功能
│   │   │   ├── checkin/             # 签到管理
│   │   │   ├── message/             # 消息通知
│   │   │   ├── registration/        # 报名管理
│   │   │   ├── review/              # 评价反馈
│   │   │   ├── route/               # 路线管理
│   │   │   ├── system/              # 系统字典
│   │   │   └── user/                # 用户管理
│   │   └── HikingBackendApplication.java
│   ├── src/main/resources/
│   │   ├── mapper/                  # MyBatis 映射文件
│   │   └── application.yml          # 配置文件
│   └── pom.xml
├── frontend/                         # 前端项目
│   ├── public/
│   ├── src/
│   │   ├── api/                     # API 接口封装
│   │   ├── components/              # 公共组件
│   │   ├── pages/                   # 页面组件
│   │   │   ├── activity/           # 活动相关页面
│   │   │   ├── admin/              # 管理页面
│   │   │   ├── organizer/          # 组织者页面
│   │   │   ├── user/               # 用户页面
│   │   │   └── Home/               # 首页
│   │   ├── utils/                   # 工具函数
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── router.jsx               # 路由配置
│   ├── package.json
│   └── vite.config.js
├── 系统实现与设计/                    # 项目文档
└── README.md
```

## 功能特性

### 1. 用户管理
- 用户注册/登录（JWT 认证）
- 三级角色体系（普通用户、组织者、管理员）
- 个人中心（基本信息、徒步档案、偏好设置）
- 健康状况与紧急联系人管理

### 2. 活动管理
- 活动发布与编辑
- 活动审核流程（草稿 → 待审核 → 已发布）
- 多条件筛选（难度、地区、时间、费用）
- 活动状态管理（进行中、已结束）

### 3. 报名管理
- 在线报名申请
- 报名资格校验（容量、时间冲突）
- 候补机制
- 报名审核与通知

### 4. 签到管理
- GPS 定位签到
- 实时位置监控
- 轨迹记录与回放
- 偏离路线预警
- 自动点名统计

### 5. 路线管理
- 可视化路线编辑
- 路线信息（里程、爬升、难度）
- 路线复用与分享

### 6. 评价反馈
- 活动评分与评论
- 评价展示与统计

### 7. 消息通知
- 站内消息推送
- 系统通知、活动提醒、报名结果

## 快速开始

### 环境要求
- JDK 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### 数据库配置

1. 创建数据库：
```sql
CREATE DATABASE hiking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改 `backend/src/main/resources/application.yml` 中的数据库连接信息：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/hiking_system
    username: root
    password: your_password
```

### 后端启动

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务运行在 `http://localhost:8080`

API 文档地址：`http://localhost:8080/doc.html`

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务运行在 `http://localhost:5173`

## API 接口

### 认证模块
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/profile` | GET | 获取用户信息 |

### 活动模块
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/activities` | GET | 活动列表 |
| `/api/activities/{id}` | GET | 活动详情 |
| `/api/activities` | POST | 创建活动 |
| `/api/activities/{id}` | PUT | 更新活动 |
| `/api/activities/{id}/audit` | POST | 审核活动 |

### 报名模块
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/registrations` | POST | 提交报名 |
| `/api/registrations/my` | GET | 我的报名记录 |
| `/api/registrations/{id}/status` | PUT | 审核报名 |

### 签到模块
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/checkin/points/{activityId}` | GET | 获取签到点 |
| `/api/checkin/record` | POST | 提交签到 |
| `/api/checkin/track/{activityId}` | GET | 获取轨迹 |
| `/api/checkin/alerts` | GET | 获取预警事件 |

## 数据库设计

### 核心数据表

| 表名 | 说明 |
|------|------|
| user | 用户账号表 |
| user_profile | 用户档案表 |
| activity | 活动表 |
| registration | 报名表 |
| gathering_plan | 集合方案表 |
| route | 路线表 |
| route_point | 路线点位表 |
| checkpoint | 签到点表 |
| check_in_record | 签到记录表 |
| track_record | 轨迹记录表 |
| alert_event | 预警事件表 |
| review | 评价表 |
| message | 消息表 |
| dict_type | 字典类型表 |
| dict_data | 字典数据表 |

## 项目文档

详细的设计文档位于 `系统实现与设计/` 目录：

- 系统架构设计文档.md
- 数据库设计文档.md
- 功能模块设计文档.md
- 前端开发提示词文档.md
- 后端开发提示词文档.md
- 功能时序图.md
- 页面清单设计.md

## 版本信息

- **当前版本**: 1.0.0
- **开发周期**: 2024-12 至 2026-01
- **当前分支**: 3.1

## 许可证

MIT License

---

**开发团队**: 户外徒步活动管理系统开发组
