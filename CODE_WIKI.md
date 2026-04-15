# 易伴·卦象神兽 Code Wiki

## 目录
1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [项目结构](#项目结构)
4. [核心包 (@yiban/core)](#核心包-yibancore)
5. [API 服务包 (@yiban/api)](#api-服务包-yibanapi)
6. [应用包 (@yiban/app)](#应用包-yibanapp)
7. [数据库设计](#数据库设计)
8. [依赖关系](#依赖关系)
9. [运行方式](#运行方式)
10. [开发指南](#开发指南)

---

## 项目概述

### 产品定位
易伴·卦象神兽是一个通过领养卦象神兽、学习《易经》智慧的国学互动应用。

### 核心特性
- 梅花易数起卦算法
- 12只卦象神兽系统
- 心情选择与灵感启发
- 神兽领养与收藏
- AI Agent辅助生成内容
- 跨平台支持（H5 + 微信小程序）

### 核心理念
不预测命运，只提供文化视角的灵感启发。

---

## 技术架构

### 整体架构
项目采用 **Monorepo** 架构，使用 **pnpm** 作为包管理工具。

```
yiban-web/
├── packages/
│   ├── core/     # 共享核心库
│   ├── api/      # 后端API服务
│   └── app/      # 前端应用
```

### 技术栈详情

| 层级 | 技术选型 |
|------|----------|
| 前端框架 | Taro 3.6 + React 18 + TypeScript |
| 后端框架 | Hono 4.6 + TypeScript |
| 数据库 | SQLite + Drizzle ORM |
| 测试框架 | Vitest |
| 状态管理 | React Context + useReducer |
| 样式方案 | SCSS |
| 构建工具 | Taro CLI + tsx |

---

## 项目结构

### 根目录结构
```
yiban-web/
├── packages/                  # 子包目录
├── docs/                      # 文档目录
├── .claude/                   # Claude AI配置
├── pnpm-workspace.yaml        # pnpm工作区配置
├── tsconfig.base.json         # 基础TypeScript配置
├── package.json               # 根项目配置
└── README.md                  # 项目说明
```

### packages/core/ - 核心包
```
core/
├── src/
│   ├── constants/
│   │   └── gua.ts            # 卦象常量定义
│   ├── data/
│   │   └── hexagrams.json    # 卦象语料数据
│   ├── prompts/
│   │   └── index.ts           # AI Agent提示词
│   ├── types/
│   │   └── hexagram.ts        # 核心类型定义
│   ├── utils/
│   │   ├── date.ts            # 日期工具
│   │   ├── hexagram.ts        # 卦象工具
│   │   ├── meihua.ts          # 梅花易数算法
│   │   └── storage.ts         # 存储工具
│   └── index.ts               # 入口文件
├── __tests__/
│   └── meihua.test.ts         # 算法测试
├── package.json
└── tsconfig.json
```

### packages/api/ - API服务包
```
api/
├── src/
│   ├── db/
│   │   ├── index.ts           # 数据库连接
│   │   └── schema.ts          # 数据库Schema
│   ├── middleware/
│   │   └── auth.ts            # 认证中间件
│   ├── routes/
│   │   ├── agent.ts           # AI Agent路由
│   │   ├── auth.ts            # 认证路由
│   │   ├── checkin.ts         # 打卡路由
│   │   ├── collection.ts      # 收藏路由
│   │   ├── hexagram.ts        # 卦象路由
│   │   └── user.ts            # 用户路由
│   ├── services/
│   │   ├── agent.ts           # AI Agent服务
│   │   ├── checkin.ts         # 打卡服务
│   │   ├── sms.ts             # 短信服务
│   │   └── wechat.ts          # 微信服务
│   ├── types/
│   │   ├── api.ts             # API类型
│   │   └── auth.ts            # 认证类型
│   └── index.ts               # 入口文件
├── drizzle/
│   └── meta/                  # Drizzle元数据
├── package.json
├── drizzle.config.ts
└── tsconfig.json
```

### packages/app/ - 应用包
```
app/
├── src/
│   ├── adapters/
│   │   └── storage.ts         # 存储适配器
│   ├── api/
│   │   ├── agent.ts           # AI Agent API
│   │   ├── auth.ts            # 认证 API
│   │   ├── checkin.ts         # 打卡 API
│   │   ├── client.ts          # API客户端
│   │   ├── collection.ts      # 收藏 API
│   │   ├── hexagram.ts        # 卦象 API
│   │   ├── index.ts           # API入口
│   │   └── user.ts            # 用户 API
│   ├── assets/
│   │   └── icons/             # 图标资源
│   ├── components/
│   │   ├── agent/             # Agent组件
│   │   ├── hexagram/          # 卦象组件
│   │   ├── inspiration/       # 灵感组件
│   │   ├── share/             # 分享组件
│   │   └── ui/                # UI组件
│   ├── context/
│   │   ├── AuthContext.tsx    # 认证上下文
│   │   ├── CollectionContext.tsx  # 收藏上下文
│   │   ├── InspirationContext.tsx # 灵感上下文
│   │   └── SettingsContext.tsx    # 设置上下文
│   ├── pages/
│   │   ├── collection/        # 收藏页
│   │   ├── home/              # 首页
│   │   ├── login/             # 登录页
│   │   ├── settings/          # 设置页
│   │   └── study/             # 学习页
│   ├── app.config.ts          # 应用配置
│   ├── app.scss               # 全局样式
│   ├── app.tsx                # 应用入口
│   └── index.html             # H5入口
├── config/
│   ├── dev.ts                 # 开发配置
│   ├── index.ts               # 配置入口
│   └── prod.ts                # 生产配置
├── package.json
├── project.config.json        # 小程序项目配置
└── tsconfig.json
```

---

## 核心包 (@yiban/core)

### 主要功能
提供项目共享的类型定义、工具函数、常量和数据。

### 核心类型定义

#### Mood（心境类型）
```typescript
type Mood = 'work' | 'emotion' | 'inspiration' | 'encouragement';
```

#### RawHexagram（原始卦象）
```typescript
interface RawHexagram {
  id: string;
  name: string;
  symbol: string;
  nature: string;
  concept: string;
  source: string;
  description: string;
  rationale?: string;
  moods: Record<Mood, RawMoodData>;
}
```

#### Inspiration（灵感）
```typescript
interface Inspiration {
  hexagram: RawHexagram;
  mood: Mood;
  text: string;
  date: string;
}
```

### 关键工具函数

#### 梅花易数算法 ([meihua.ts](file:///Users/mac/github/yiban-web/packages/core/src/utils/meihua.ts))

**meihuaDivination(timestamp: number)**
- 功能：根据时间戳进行梅花易数起卦
- 参数：timestamp - 打卡时间戳（毫秒）
- 返回：
  ```typescript
  {
    upperGua: number;      // 上卦（外卦，行 0-7）
    lowerGua: number;      // 下卦（内卦，列 0-7）
    movingLine: number;    // 动爻（1-6）
    seed: number;          // 随机种子
    hexagramId: string;    // 64卦ID
  }
  ```

**起卦规则：**
- 八卦顺序：乾兑离震巽坎艮坤（0-7）
- 上卦 = (seed + 年份%8) % 8
- 下卦 = seed % 8
- 动爻 = seed % 6 + 1

**种子生成：**
- 取时间戳末两位 × 三位随机小数
- 取积的小数部分 × 1000，取前三位

#### 卦象查询

**getHexagramById(id: string): RawHexagram | undefined**
- 功能：根据ID查询卦象数据
- 参数：id - 卦象ID
- 返回：卦象对象或undefined

### 卦象常量

#### 12神兽ID映射
| ID | 名称 | 符号 |
|----|------|------|
| qian | 乾 | 龙 |
| kun | 坤 | 牛 |
| tai | 泰 | 麒麟 |
| qian_2 | 谦 | 龟 |
| zhun | 屯 | 鹿 |
| xu | 需 | 鲲 |
| shi | 师 | 虎 |
| bi | 比 | 狐 |
| dayou | 大有 | 凤 |
| gu | 蛊 | 鹤 |
| lin | 临 | 狮 |
| guan | 观 | 虹 |

---

## API 服务包 (@yiban/api)

### 主要功能
提供RESTful API服务，处理用户认证、打卡、收藏、卦象查询等业务逻辑。

### 入口文件 ([index.ts](file:///Users/mac/github/yiban-web/packages/api/src/index.ts))

```typescript
// 主要路由
/api/auth          # 认证路由
/api/checkin       # 打卡路由
/api/collection    # 收藏路由
/api/hexagram      # 卦象路由
/api/hexagrams     # 卦象列表路由
/api/user          # 用户路由
/api/agent         # AI Agent路由
```

### 可用API端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/wechat | 微信登录 |
| POST | /api/auth/phone/send | 发送验证码 |
| POST | /api/auth/phone/verify | 验证验证码 |
| GET | /api/auth/test-token | 测试token |
| POST | /api/checkin | 打卡 |
| GET | /api/checkin/today | 获取今日打卡 |
| GET | /api/collection | 获取收藏列表 |
| GET | /api/hexagrams | 获取卦象列表 |
| GET | /api/hexagram/:id | 获取单个卦象 |
| GET | /api/user/profile | 获取用户资料 |
| POST | /api/agent/generate | AI Agent生成内容 |
| GET | /api/agent/contents/:checkinId | 获取Agent生成的内容 |

### 中间件

#### auth.ts - 认证中间件
- 使用JWT进行身份验证
- 检查JWT_SECRET配置

### 服务层

#### wechat.ts - 微信服务
- 处理微信登录
- 检查WECHAT_APPID和WECHAT_SECRET配置

#### sms.ts - 短信服务
- 发送和验证手机验证码

#### checkin.ts - 打卡服务
- 处理用户打卡逻辑

#### agent.ts - AI Agent服务
- 调用LLM API生成内容

---

## 应用包 (@yiban/app)

### 主要功能
Taro跨平台应用，提供H5和微信小程序前端界面。

### 应用入口 ([app.tsx](file:///Users/mac/github/yiban-web/packages/app/src/app.tsx))

应用使用React Context进行状态管理，Context Provider的嵌套顺序：
```
AuthProvider
  └─ SettingsProvider
      └─ CollectionProvider
          └─ InspirationProvider
```

### 页面结构

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | pages/home | 今日灵感、心境选择、神兽展示 |
| 收藏页 | pages/collection | 已领养神兽列表 |
| 学习页 | pages/study | 易经智慧学习 |
| 设置页 | pages/settings | 主题设置、极简模式 |
| 登录页 | pages/login | 用户登录 |

### 核心组件

#### 卦象组件
- **HexagramSymbol**: 神兽图标（图片优先，emoji fallback）
- **HexagramCard**: 神兽大卡（浮动动画）
- **HexagramGridItem**: 收藏网格项
- **MeihuaDisplay**: 梅花易数展示

#### 灵感组件
- **MoodSelector**: 心境选择器
- **InspirationText**: 打字机效果
- **InspirationDisplay**: 絮语展示 + 免责声明

#### Agent组件
- **AgentCard**: Agent卡片
- **AgentContentList**: Agent内容列表

### Context上下文

#### AuthContext
- 管理用户认证状态
- 提供登录、登出方法

#### InspirationContext
- **State**: `{ currentHexagram, selectedMood, inspiration, alreadyAdoptedToday, isLoading }`
- **Actions**: LOAD, SELECT_MOOD, ADOPT_SUCCESS, SET_LOADING
- 功能：管理今日灵感、心境选择、神兽领养

#### CollectionContext
- **State**: `{ adoptedIds }`
- 功能：管理已领养的神兽列表

#### SettingsContext
- **State**: `{ theme, simplified }`
- 功能：管理主题设置（xuanqing/dailan/mojin）和极简模式

### 主题系统

三套主题通过CSS变量实现：

| 主题 | 背景色 | 文字色 | 强调色 |
|------|--------|--------|--------|
| xuanqing（默认） | #F5F0E8 | #1A2B3C | #C73E3A |
| dailan | #FAF8F5 | #3D5A73 | #D4A5A5 |
| mojin | #EDE8DC | #1C1C1C | #C9A84C |

---

## 数据库设计

### Schema定义 ([schema.ts](file:///Users/mac/github/yiban-web/packages/api/src/db/schema.ts))

#### users（用户表）
```typescript
{
  id: UUID (主键)
  openid: string (唯一)
  phone: string (可选，唯一)
  nickname: string
  avatar: string
  isPremium: boolean (默认false)
  createdAt: timestamp
}
```

#### checkins（打卡表）
```typescript
{
  id: UUID (主键)
  userId: UUID (外键 -> users.id)
  hexagramId: string
  meihuaData: JSON (上卦、下卦、动爻)
  mood: string
  createdAt: timestamp
}
```

#### collections（收藏表）
```typescript
{
  id: UUID (主键)
  userId: UUID (外键 -> users.id)
  hexagramId: string
  adoptedAt: timestamp
}
```

#### agentContents（AI Agent生成内容表）
```typescript
{
  id: UUID (主键)
  checkinId: UUID (外键 -> checkins.id)
  userId: UUID (外键 -> users.id)
  hexagramId: string (用于缓存匹配)
  mood: string (用于缓存匹配)
  scene: string ('suitable_for' | 'advice' | 'companionship')
  content: string
  cached: boolean (默认false)
  createdAt: timestamp
  expiresAt: timestamp (可选)
}
```

#### dailyFreeUsage（每日免费使用记录表）
```typescript
{
  id: UUID (主键)
  userId: UUID (外键 -> users.id)
  usedDate: string (YYYY-MM-DD)
  scene: string
  usedAt: timestamp
  createdAt: timestamp
}
```

---

## 依赖关系

### 包依赖关系图
```
@yiban/app
    └── @yiban/core

@yiban/api
    └── @yiban/core
```

### 主要外部依赖

#### @yiban/core
- typescript
- vitest (测试)

#### @yiban/api
- hono (Web框架)
- @hono/node-server
- drizzle-orm (ORM)
- @libsql/client (SQLite客户端)
- jose (JWT)
- uuid
- dotenv

#### @yiban/app
- @tarojs/* (Taro框架)
- react
- react-dom
- sass

---

## 运行方式

### 环境要求
- Node.js >= 16
- pnpm >= 8

### 快速启动

#### 1. 安装依赖
```bash
pnpm install
```

#### 2. 配置环境变量
在 `packages/api/.env` 中配置：
```env
JWT_SECRET=your-jwt-secret-here
WECHAT_APPID=wx203011da8e42d5f9
WECHAT_SECRET=your-wechat-appsecret-here
```

#### 3. 启动后端API
```bash
cd packages/api
pnpm dev
```
后端服务运行在 http://localhost:3000

#### 4. 启动前端H5
```bash
cd packages/app
pnpm build:h5 && npx serve dist -p 10086
```
访问 http://localhost:10086

#### 5. 构建微信小程序
```bash
cd packages/app
pnpm build:weapp
```
用微信开发者工具打开 `packages/app/dist` 目录。

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装所有依赖 |
| `pnpm --filter @yiban/api dev` | 启动后端API |
| `pnpm --filter @yiban/api db:generate` | 生成数据库迁移 |
| `pnpm --filter @yiban/api db:push` | 推送数据库更改 |
| `pnpm --filter @yiban/api db:studio` | 打开Drizzle Studio |
| `pnpm --filter @yiban/app dev:h5` | H5开发模式 |
| `pnpm --filter @yiban/app build:h5` | 构建H5 |
| `pnpm --filter @yiban/app build:weapp` | 构建小程序 |
| `pnpm --filter @yiban/core test` | 运行核心包测试 |

---

## 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循现有代码风格
- 单一职责原则：每个文件只做一件事

### 合规要求
- **禁用词**：占卜、算命、预测、运势、风水、命理、玄学
- **语气**：使用"或许"、"可能"、"启发"等非确定性词汇
- **免责声明**：每条絮语底部必显示

### 测试
- 核心包使用Vitest进行单元测试
- 运行测试：`pnpm --filter @yiban/core test`

### Git工作流
1. 创建功能分支
2. 提交代码
3. 发起Pull Request
4. 代码审查
5. 合并到主分支

---

## 端口说明

| 服务 | 端口 |
|------|------|
| 后端API | 3000 |
| H5预览 | 10086 |

---

## 相关文档

- 项目README：[README.md](file:///Users/mac/github/yiban-web/README.md)
- 项目说明：[project.md](file:///Users/mac/github/yiban-web/project.md)
- 设计文档：`docs/superpowers/specs/`
- 实现计划：`docs/superpowers/plans/`

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-04-04 | 初始版本 |
