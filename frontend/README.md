# 户外徒步活动管理系统 - 前端

基于 React + Vite + Ant Design 的户外徒步活动管理系统前端。

## 技术栈

- **React 18.2** - 前端框架
- **Vite 5.0** - 构建工具
- **React Router 6.21** - 路由管理
- **Ant Design 5.12** - UI 组件库
- **Axios 1.6** - HTTP 请求
- **Day.js 1.11** - 日期处理
- **高德地图** - 地图服务

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
frontend/
├── src/
│   ├── api/                 # API 请求模块
│   ├── components/          # 公共组件
│   │   ├── common/         # 通用组件
│   │   ├── business/       # 业务组件
│   │   └── layout/        # 布局组件
│   ├── pages/             # 页面组件
│   ├── utils/             # 工具函数
│   ├── hooks/             # 自定义 Hooks
│   ├── App.jsx            # 根组件
│   ├── main.jsx           # 入口文件
│   └── index.css          # 全局样式
├── public/               # 静态资源
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置
```

## 开发阶段

### 第一批：P0 - 基础框架 + 核心流程
- ✅ 项目初始化
- ⏳ 公共模块开发
- ⏳ API 模块开发
- ⏳ 公共页面开发

### 第二批：P1 - 用户核心功能
- 用户中心页面
- 签到功能

### 第三批：P2 - 管理功能
- 组织者页面
- 管理后台页面

## 配置说明

### 代理配置

开发环境下，`/api` 请求会被代理到后端服务 `http://localhost:8080`

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### 环境变量

可以根据需要创建 `.env` 文件配置环境变量。

## 后端接口

后端服务地址：`http://localhost:8080`

接口文档：`http://localhost:8080/doc.html`

## License

MIT

