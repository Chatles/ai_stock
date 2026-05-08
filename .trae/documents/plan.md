# A股公司公告展示应用 - 实施计划

## 1. 项目概述

### 目标
构建一个前后端分离的 Web 应用,获取并展示 A 股上市公司公告数据。

### 技术栈
- **后端**: Node.js + Express + TypeScript
- **前端**: React + TypeScript + Vite
- **数据源**: 东方财富公开 API (datacenter-web.eastmoney.com)

### 用户需求
- 展示最新公告列表
- 点击查看公告 PDF 文件
- 按市场分类筛选(沪市/深市/科创板/创业板)

---

## 2. 当前状态分析

### 已有资源
- 工作目录为空,适合全新项目
- README.md 文件存在但内容为占位符

### 数据源分析
东方财富数据中心提供公开公告接口:

**全市场公告接口**:
```
GET https://datacenter-web.eastmoney.com/api/data/v1/get
Parameters:
- reportName: "RPT_NOTICE_LIST"
- columns: "NOTICE_DATE,SECURITY_CODE,SECURITY_NAME_ABBR,NOTICE_TYPE,NOTICE_TITLE,NOTICE_URL"
- pageNumber: 1
- pageSize: 50
- sortTypes: -1 (最新优先)
- sortColumns: NOTICE_DATE
```

**市场筛选参数**:
- 沪市主板: market=SHA
- 科创板: market=KCB
- 深市主板: market=SZA
- 创业板: market=CYB

---

## 3. 架构设计

### 项目结构
```
/workspace
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── index.ts        # 入口文件
│   │   ├── routes/         # 路由
│   │   ├── services/      # 数据服务
│   │   └── types/          # 类型定义
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/         # 页面
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── types/         # 类型定义
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── SPEC.md
```

### API 设计

#### 后端代理接口
```
GET /api/notices
Query Parameters:
  - page: number (default: 1)
  - pageSize: number (default: 20, max: 50)
  - market: "ALL" | "SHA" | "SZA" | "KCB" | "CYB"
  - keyword?: string (搜索关键词)
  - startDate?: string (YYYY-MM-DD)
  - endDate?: string (YYYY-MM-DD)

Response:
{
  "code": 200,
  "data": {
    "list": Notice[],
    "total": number,
    "page": number,
    "pageSize": number
  }
}
```

#### 公告数据结构
```typescript
interface Notice {
  noticeDate: string;      // 公告日期
  securityCode: string;     // 股票代码
  securityNameAbbr: string; // 公司简称
  noticeType: string;       // 公告类型
  noticeTitle: string;      // 公告标题
  noticeUrl: string;        // 公告链接(PDF)
}
```

---

## 4. 后端实现

### 4.1 初始化
- 创建 `backend` 目录
- 初始化 npm 项目
- 安装依赖: express, cors, axios, typescript, @types/*
- 配置 TypeScript

### 4.2 核心服务
**EastMoneyService**:
- 调用东方财富数据中心 API
- 处理市场筛选参数映射
- 数据清洗和转换

### 4.3 路由
- `/api/notices` - 获取公告列表
- `/api/markets` - 获取市场统计

---

## 5. 前端实现

### 5.1 UI 设计 (金融数据风格)

**配色方案**:
- 主色: #1a1a2e (深蓝黑)
- 次色: #16213e (深海蓝)
- 强调色: #0f3460 (靛蓝)
- 高亮: #e94560 (金融红)
- 文字: #ffffff, #a0a0a0
- 背景: #0a0a0f

**布局**:
- 顶部导航栏(带搜索框)
- 左侧筛选面板
- 主内容区(公告列表)
- 公告卡片设计

**动效**:
- 列表加载时的骨架屏
- 卡片悬停时的微光效果
- 平滑的列表过渡动画

### 5.2 组件结构
```
App
├── Header (导航栏 + 搜索)
├── FilterPanel (市场筛选)
│   └── MarketFilter
├── NoticeList (公告列表)
│   └── NoticeCard (单个公告卡片)
└── NoticeModal (公告详情弹窗)
```

### 5.3 功能
- 公告列表分页加载
- 市场筛选(沪市/深市/科创板/创业板)
- 关键词搜索
- 日期范围筛选
- 点击公告打开 PDF
- 响应式设计

---

## 6. 实施步骤

### 阶段 1: 后端开发
1. 创建 backend 项目结构
2. 实现 EastMoneyService
3. 实现 /api/notices 接口
4. 添加 CORS 配置
5. 测试接口

### 阶段 2: 前端开发
1. 使用 Vite 创建 React + TypeScript 项目
2. 安装依赖 (axios, react-router-dom)
3. 实现 API 服务层
4. 创建布局组件
5. 实现公告列表组件
6. 实现筛选功能
7. 添加样式和动效

### 阶段 3: 联调与优化
1. 前后端联调
2. 错误处理
3. 加载状态
4. 响应式适配

---

## 7. 关键文件清单

### 后端
- `backend/src/index.ts` - 入口
- `backend/src/services/eastmoney.ts` - 数据服务
- `backend/src/routes/notices.ts` - 路由
- `backend/src/types/index.ts` - 类型定义

### 前端
- `frontend/src/App.tsx` - 主组件
- `frontend/src/components/Header.tsx` - 导航
- `frontend/src/components/NoticeList.tsx` - 列表
- `frontend/src/components/NoticeCard.tsx` - 卡片
- `frontend/src/components/FilterPanel.tsx` - 筛选
- `frontend/src/services/api.ts` - API 调用
- `frontend/src/types/index.ts` - 类型
- `frontend/src/styles/App.css` - 样式

---

## 8. 验证标准

- [ ] 后端服务正常启动在 3000 端口
- [ ] /api/notices 接口返回正确数据
- [ ] 前端页面正常加载
- [ ] 公告列表正确展示
- [ ] 市场筛选功能正常
- [ ] 点击公告能打开 PDF
- [ ] 无控制台错误
- [ ] 响应式布局正常

---

## 9. 注意事项

1. **CORS 问题**: 通过后端代理解决
2. **数据格式**: 东方财富返回 GBK 编码,需转换
3. **请求频率**: 添加适当延迟避免被限流
4. **PDF 链接**: 直接使用东方财富提供的链接
5. **错误处理**: 优雅处理网络异常和数据解析错误
