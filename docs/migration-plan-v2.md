# 易伴·卦象神兽 - 多端迁移计划 v2

> 目标：将现有 React Web 应用迁移为 **Monorepo 架构**，支持 **Web H5 + 微信小程序** 双端发布，集成 **AI Agent 能力**

---

## 1. 项目概况

### 1.1 当前状态 ✅ 已完成迁移

| 维度 | 现状 |
|------|------|
| 框架 | Taro 3.6 + React 18 + TypeScript |
| 样式 | SCSS（Taro 推荐） |
| 组织 | Monorepo（pnpm workspace） |
| 端 | Web H5 + 微信小程序（统一代码库） |
| 组件 | 15 个 Taro 组件 |
| 特性 | 水墨国风 UI、梅花易数起卦、64 卦神兽系统 |

### 1.2 目标架构

| 维度 | 目标 | 状态 |
|------|------|------|
| 框架 | Taro 3 + React 18 + TypeScript | ✅ 已完成 |
| 样式 | SCSS | ✅ 已完成 |
| 组织 | Monorepo（pnpm workspace） | ✅ 已完成 |
| 端 | Web H5 + 微信小程序 | ✅ 已完成 |
| 后端 | Hono + Drizzle + SQLite | ✅ 已完成 |
| AI | Agent 工程 + GLM-5 API | ✅ 已完成 |
| 微信能力 | 分享 + 登录 + 云存储 | 🔲 待开发 |

---

## 2. 业务模型

### 2.1 用户分层

| 用户类型 | 能力 |
|---------|------|
| **免费用户** | 每日领养神兽 + 神兽建议（6项，每日每场景1次免费） + 收藏查看 |
| **付费用户** | 免费用户能力 + 月度报告生成 + 历史数据统计 + AI 建议无限解锁 |

### 2.2 Agent 核心场景

| 场景 | 描述 | 触发时机 | 付费要求 |
|------|------|----------|----------|
| **今日适合** | 神兽建议今天适合做什么 | 用户点击解锁 | 每日每场景1次免费 |
| **处事建议** | 今天如果遇到事情该怎么做 | 用户点击解锁 | 每日每场景1次免费 |
| **情绪陪同** | 神兽以自身口吻安慰用户 | 用户点击解锁 | 每日每场景1次免费 |
| **工作发展** | 从神兽视角给事业发展建议 | 用户点击解锁 | 每日每场景1次免费 |
| **情感沟通** | 从神兽视角给情感交流建议 | 用户点击解锁 | 每日每场景1次免费 |
| **财运参考** | 从神兽视角给财运方面参考 | 用户点击解锁 | 每日每场景1次免费 |
| **月度报告** | 综合当月领养情况的分析报告 | 付费用户手动触发 | 付费专属 |

### 2.3 合规要求

| 要求 | 实现方式 |
|------|----------|
| **不出现预测** | 禁用"预示"、"将会"、"命运"等预测性词汇 |
| **神兽口吻** | AI 回复以对应神兽的性格、语气、典故风格生成 |
| **心理慰藉定位** | 强调"陪伴"、"建议"、"参考"，不承诺结果 |
| **文化教育** | 融入易经知识、神兽典故，提供文化价值 |

---

## 3. 技术架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            客户端层                                      │
├─────────────────────────────────────────────────────────────────────────┤
│   packages/app (Taro 统一应用) ✅ 已实现                                  │
│   ├── Web H5 构建目标                                                    │
│   │   - 页面渲染                                                         │
│   │   - 状态管理                                                         │
│   │   - 本地缓存                                                         │
│   └── 微信小程序构建目标                                                  │
│       - 页面渲染                                                         │
│       - 小程序 API 调用                                                  │
│       - 分享/登录/广告（部分完成）                                         │
└───────────────────────┬─────────────────────────────────────────────────┘
                        │ HTTP/HTTPS (JWT)
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        后端服务层 ✅ 已实现                               │
├─────────────────────────────────────────────────────────────────────────┤
│   packages/api (Hono + Drizzle + SQLite)                                │
│   ├── /api/auth          - 用户认证（微信登录）✅                         │
│   ├── /api/checkin       - 打卡领养 ✅                                   │
│   ├── /api/collection    - 收藏管理 ✅                                   │
│   ├── /api/hexagram      - 卦象数据 ✅                                   │
│   ├── /api/user          - 用户信息/付费状态 ✅                           │
│   ├── /api/agent         - AI Agent 接口 ✅                              │
│   └── /api/report        - 月度报告 🔲                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 当前目录结构 ✅ 已实现

```
yiban-web/                              # 项目根目录
├── packages/
│   ├── core/                           # 【共享核心层】 ✅
│   │   ├── src/
│   │   │   ├── utils/                  # 工具函数
│   │   │   │   ├── meihua.ts           # 梅花易数算法 ✅
│   │   │   │   ├── storage.ts          # 存储抽象层 ✅
│   │   │   │   ├── date.ts             # 日期工具 ✅
│   │   │   │   └── hexagram.ts         # 卦象工具 ✅
│   │   │   ├── types/                  # 类型定义 ✅
│   │   │   │   └── hexagram.ts         # Hexagram, Mood, Inspiration ✅
│   │   │   ├── prompts/                # AI 提示词模板 ✅
│   │   │   │   └── index.ts            # buildPrompt, filterCompliance ✅
│   │   │   ├── data/                   # 静态数据 ✅
│   │   │   │   └── hexagrams.json      # 64卦数据 ✅
│   │   │   ├── constants/              # 常量 ✅
│   │   │   │   └── gua.ts             # 八卦常量 ✅
│   │   │   └── index.ts                # 统一导出 ✅
│   │   ├── __tests__/                  # 单元测试 ✅
│   │   │   └── meihua.test.ts         # 梅花易数测试 ✅
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── app/                            # 【Taro 跨平台应用】 ✅ 已实现
│   │   ├── src/
│   │   │   ├── pages/                  # 页面 ✅
│   │   │   │   ├── home/               # 今日灵感 ✅
│   │   │   │   ├── collection/         # 神兽收藏 ✅
│   │   │   │   ├── study/              # 书斋学习 ✅
│   │   │   │   └── settings/           # 设置 ✅
│   │   │   ├── components/             # 组件 ✅
│   │   │   │   ├── hexagram/           # 卦象组件 ✅
│   │   │   │   ├── inspiration/        # 灵感组件 ✅
│   │   │   │   ├── agent/              # AI Agent 组件 ✅
│   │   │   │   │   └── AgentCard.tsx   # 神兽建议卡片 ✅
│   │   │   │   └── ui/                 # UI 组件 ✅
│   │   │   ├── context/                # 状态管理 ✅
│   │   │   │   ├── InspirationContext.tsx ✅
│   │   │   │   ├── CollectionContext.tsx ✅
│   │   │   │   ├── SettingsContext.tsx ✅
│   │   │   │   └── AuthContext.tsx     # 认证状态 ✅
│   │   │   ├── api/                    # API 客户端 ✅
│   │   │   │   ├── client.ts          # HTTP 客户端 ✅
│   │   │   │   ├── auth.ts            # 认证 API ✅
│   │   │   │   ├── checkin.ts         # 打卡 API ✅
│   │   │   │   ├── collection.ts      # 收藏 API ✅
│   │   │   │   ├── hexagram.ts        # 卦象 API ✅
│   │   │   │   ├── user.ts            # 用户 API ✅
│   │   │   │   └── agent.ts           # Agent API ✅
│   │   │   ├── adapters/              # 平台适配 ✅
│   │   │   │   └── storage.ts         # Taro 存储适配 ✅
│   │   │   ├── app.tsx               # 入口 ✅
│   │   │   ├── app.config.ts          # 配置 ✅
│   │   │   └── app.scss               # 全局样式 ✅
│   │   ├── config/                    # Taro 配置 ✅
│   │   ├── dist/                      # 构建产物
│   │   ├── project.config.json        # 小程序配置 ✅
│   │   └── package.json
│   │
│   └── api/                            # 【后端服务层】 ✅ 已实现
│       ├── src/
│       │   ├── routes/                 # API 路由 ✅
│       │   │   ├── auth.ts             # 认证路由 ✅
│       │   │   ├── checkin.ts          # 打卡路由 ✅
│       │   │   ├── collection.ts        # 收藏路由 ✅
│       │   │   ├── hexagram.ts         # 卦象路由 ✅
│       │   │   ├── user.ts             # 用户路由 ✅
│       │   │   └── agent.ts            # Agent 路由 ✅
│       │   ├── services/               # 业务服务 ✅
│       │   │   ├── agent.ts           # AI Agent 服务 ✅
│       │   │   ├── wechat.ts          # 微信登录 ✅
│       │   │   └── checkin.ts         # 打卡服务 ✅
│       │   ├── middleware/             # 中间件 ✅
│       │   │   └── auth.ts           # JWT 认证 ✅
│       │   ├── db/                    # 数据库 ✅
│       │   │   ├── schema.ts         # Drizzle schema ✅
│       │   │   └── index.ts          # 数据库连接 ✅
│       │   ├── types/                 # 类型定义 ✅
│       │   │   ├── auth.ts
│       │   │   └── api.ts
│       │   └── index.ts              # 入口 ✅
│       ├── drizzle/                   # 迁移文件 ✅
│       ├── .env                       # 环境变量 ✅
│       ├── drizzle.config.ts          # Drizzle 配置 ✅
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── migration-plan.md
│   ├── migration-plan-v2.md            # 本文档
│   ├── 神兽推荐付费流程设计文档.md
│   └── 神兽推荐付费流程实施计划.md
│
├── pnpm-workspace.yaml                 # ✅
├── package.json                        # ✅
├── tsconfig.json                       # ✅
└── project.md                          # 项目说明
```

---

## 4. 迁移步骤执行记录

### Phase 1: Monorepo 搭建 ✅ 已完成

**目标**：搭建 Monorepo 基础结构

**执行记录**：
- [x] 初始化 pnpm workspace
- [x] 创建 packages 目录结构
- [x] 配置 TypeScript 公共配置
- [x] 抽取核心层代码到 packages/core

**验收结果**：
- ✅ pnpm install 成功
- ✅ packages/core 可独立构建
- ✅ 包间依赖正确配置

---

### Phase 2-4: Taro 统一迁移 ✅ 已完成

**决策变更**：采用 Taro 统一方案，一套代码编译到 H5 和小程序，而非分开维护两个端。

**执行记录**：
- [x] 创建 packages/app（原 miniapp 升级）
- [x] 迁移所有 Context（Inspiration/Collection/Settings/Auth）
- [x] 迁移所有组件（HexagramCard, MoodSelector 等 15 个）
- [x] 迁移所有页面（home, collection, study, settings）
- [x] 配置 H5 构建支持
- [x] 删除旧 Web 项目（src/, packages/web/）

**验收结果**：
- ✅ H5 构建成功（有包体积警告）
- ✅ 小程序构建成功
- ✅ 功能与原 Web 应用一致

---

### Phase 5: 代码质量优化 ✅ 已完成

**执行记录**：
- [x] 修复根目录 tsconfig.json include 配置
- [x] 清理 console.log 调试代码
- [x] 类型优化：替换 any 为具体类型（RawHexagram）
- [x] 添加核心算法单元测试（meihua.test.ts）
- [x] 测试覆盖率 100%
- [x] 统一类型定义：Hexagram = RawHexagram
- [x] 清理未使用变量（hexagramId, getHexagramById, currentPage, Switch）
- [x] 修复环境检测：使用 Taro.getEnv() 替代 process.env.TARO_ENV
- [x] 移除死代码（home/index.tsx 中的冗余判断）

**验收结果**：
- ✅ TypeScript 配置正确
- ✅ 无 console.log 残留
- ✅ 单元测试通过（17 测试用例）
- ✅ TypeScript 编译零错误（tsc --noEmit）
- ✅ H5 构建成功

---

### Phase 6: 后端服务搭建 ✅ 已完成

**技术选型**：
- 框架：Hono（轻量、TypeScript 原生）
- 数据库：SQLite（libsql，零配置）
- ORM：Drizzle（类型安全、轻量）
- 认证：JWT + 微信 OAuth

**执行记录**：
- [x] 创建 packages/api 完整项目结构
- [x] 配置 Drizzle ORM + SQLite
- [x] 定义数据模型（users, checkins, collections）
- [x] 实现微信登录认证（JWT）
- [x] 实现打卡领养 API（含一日一打卡限制）
- [x] 实现收藏列表 API
- [x] 实现卦象数据 API
- [x] 实现用户资料 API

**验收结果**：
- ✅ API 服务可启动（http://localhost:3000）
- ✅ 微信登录流程完整（JWT 认证）
- ✅ 打卡功能可用（一日一打卡限制有效）
- ✅ 收藏自动添加逻辑正确
- ✅ TypeScript 编译零错误

---

### Phase 6.5: 前后端联调 ✅ 已完成

**目标**：Taro 应用对接 packages/api

**执行记录**：
- [x] 创建 API 客户端层（src/api/）
- [x] 创建 AuthContext 处理用户认证
- [x] InspirationContext 迁移到 checkinApi
- [x] CollectionContext 迁移到 collectionApi
- [x] 更新 home/index.tsx 适配新接口
- [x] 修复退出登录后自动重新登录问题
- [x] 修复 TypeScript 类型错误（setInterval, @types/node）

**新增文件**：
```
packages/app/src/
├── api/
│   ├── client.ts       # HTTP 客户端（JWT 认证）
│   ├── auth.ts         # 认证 API
│   ├── checkin.ts      # 打卡 API
│   ├── collection.ts   # 收藏 API
│   ├── hexagram.ts     # 卦象 API
│   ├── user.ts         # 用户 API
│   └── agent.ts        # Agent API
└── context/
    └── AuthContext.tsx # 认证状态管理
```

**架构变更**：
```
之前: Context → Taro Storage（本地）
之后: Context → API Client → packages/api（后端）
```

**验收结果**：
- ✅ API 客户端创建完成
- ✅ AuthContext 实现登录流程
- ✅ InspirationContext 调用后端打卡 API
- ✅ CollectionContext 调用后端收藏 API
- ✅ TypeScript 编译零错误

---

### Phase 7: Agent 工程实现 ✅ 已完成

**目标**：实现 AI Agent 能力（含付费解锁流程）

**技术实现**：
- AI 模型：GLM-5 API（edgefn.net）
- 提示词引擎：packages/core/src/prompts/index.ts
- 缓存策略：hexagramId + mood + scene 组合，24小时有效
- 免费配额：每日每场景 1 次（daily_free_usage 表）
- 广告解锁：微信激励视频广告回调

**执行记录**：
- [x] 编写 64 神兽提示词模板（packages/core/src/prompts/）
- [x] 实现提示词引擎（buildSystemPrompt, buildUserPrompt, buildPrompt）
- [x] 实现合规过滤器（filterCompliance）
- [x] 实现 agent_contents 表结构（含 hexagramId, mood 字段用于缓存）
- [x] 实现 daily_free_usage 表（每日免费次数追踪）
- [x] 实现 API 路由（POST /api/agent/generate, GET /api/agent/contents/:checkinId）
- [x] 实现激励视频回调（POST /api/agent/ad-rewarded）
- [x] 前端集成（AgentCard, InspirationContext）
- [x] 修复 @yiban/core 模块导出问题（显式导出替代通配符导出）
- [x] 切换到 GLM-5 API（edgefn.net）
- [x] 修复 max_tokens 问题（移除限制让模型正常输出）
- [x] 新增 3 个场景（career, emotion, fortune）
- [x] 实现每日免费次数机制
- [x] 实现微信激励视频广告解锁流程
- [x] 修复配额检查顺序 bug（配额检查优先于缓存）
- [x] 修复 userId placeholder（从 AuthContext 获取）
- [x] 修复 AgentScene 类型（统一为 6 个场景）

**API 端点**：
| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/agent/generate | 生成 AI 建议（含 requiresAd 标识） |
| GET | /api/agent/contents/:checkinId | 获取打卡的所有 AI 内容 |
| POST | /api/agent/ad-rewarded | 微信激励视频回调 |

**数据库表**：
```sql
agent_contents - AI 生成内容缓存
daily_free_usage - 每日免费次数记录
```

**验收标准**：
- [x] 六项内容可生成（suitable_for, advice, companionship, career, emotion, fortune）
- [x] 神兽口吻符合设定（古风文言、温暖陪伴）
- [x] GLM-5 API 集成成功
- [x] 免费用户每日每场景 1 次免费
- [x] 微信激励视频广告解锁已集成
- [x] TypeScript 编译零错误

---

### Phase 8: 月度报告实现 🔲 待开发

**目标**：实现付费用户月度报告

**待完成任务**：
- [ ] 数据库设计（月度报告表）
- [ ] 报告生成提示词（综合分析）
- [ ] API 路由和逻辑
- [ ] 前端展示

**验收标准**：
- [ ] 付费用户可生成报告
- [ ] 报告内容准确
- [ ] 非付费用户无法访问

---

### Phase 9: 微信能力实现 🔲 部分完成

**目标**：实现分享、登录、云存储、广告

**已完成**：
- [x] userId 获取逻辑修复（从 AuthContext 获取）
- [x] 激励视频广告前端集成（InspirationContext）
- [x] ad-rewarded 回调接口
- [x] 配额检查 + 缓存机制（支持后期接入广告）

**待完成任务**：
- [ ] 微信激励视频广告单元 ID 配置（需小程序达到 **500 独立访客** 后可申请流量主）
- [ ] 分享卡片和分享内容配置
- [ ] 云存储同步（如需）

**⚠️ 流量主门槛说明**：
微信小程序接入激励视频广告需要先成为流量主，需满足：
- 累计独立访客 ≥ 500
- 小程序已上线且无违规
达到门槛后可在微信公众平台申请广告位，获取 `adUnitId` 后配置到 `InspirationContext.tsx`

**验收标准**：
- [ ] 分享功能正常
- [ ] 登录流程正常
- [ ] 广告解锁流程正常
- [ ] 数据同步正常

---

### Phase 10: 测试与打磨 🔲 待进行

**测试清单**：
- [x] Web 端功能完整
- [x] 小程序端功能完整
- [x] Agent 生成内容合规
- [x] 缓存机制正确
- [x] 付费功能可用（基础流程）
- [ ] 微信激励视频广告完整流程（⚠️ 需 500 UV 门槛）
- [ ] 分享功能正常
- [ ] 动画流畅（60fps）
- [ ] 包体积优化（当前 H5 401KB > 目标 200KB）

---

## 5. 当前进度总览

| Phase | 内容 | 状态 | 完成度 |
|-------|------|------|--------|
| 1 | Monorepo 搭建 | ✅ 完成 | 100% |
| 2-4 | Taro 统一迁移 | ✅ 完成 | 100% |
| 5 | 代码质量优化 | ✅ 完成 | 100% |
| 6 | 后端服务搭建 | ✅ 完成 | 100% |
| 6.5 | 前后端联调 | ✅ 完成 | 100% |
| 7 | Agent 工程实现 | ✅ 完成 | 100% |
| 8 | 月度报告实现 | 🔲 待开发 | 0% |
| 9 | 微信能力实现 | 🔲 部分完成 | ~60% |
| 10 | 测试与打磨 | 🔲 待进行 | ~50% |

**总体进度**：约 85%

---

## 6. 遗留问题

| 问题 | 级别 | 状态 |
|------|------|------|
| ~~预存类型错误（15个）~~ | 🟡 中 | ✅ 已修复 |
| H5 包体积过大（401KB） | 🟡 中 | 待优化 |
| ~~packages/api 未实现~~ | 🟡 中 | ✅ 已完成 |
| ~~userId placeholder~~ | 🟡 中 | ✅ 已修复 |
| ~~AgentScene 类型不完整~~ | 🟡 中 | ✅ 已修复 |
| AI Agent 能力 | 🔵 低 | ✅ 已完成 |
| 微信激励视频广告单元 ID | 🔵 低 | 待配置 |

---

## 7. 下一步行动

### P0 - 必须完成（发布前）
1. **H5 包体积优化** - 代码分割、移除未使用依赖（401KB → 目标 <200KB）

### P1 - 重要功能
2. **Phase 8**：月度报告实现（付费用户功能）
3. **分享功能** - 微信分享卡片和分享内容配置
4. **达到 500 UV 后**：配置微信广告单元 ID（`your_ad_unit_id` → 真实 ID）

### P2 - 体验优化
5. **动画优化** - 60fps 流畅动画
6. **端到端测试** - 完整业务流程验证

### 广告变现路线图
```
用户量 0 → 500 UV
    ↓
达到流量主门槛
    ↓
申请激励视频广告位 → 获取 adUnitId
    ↓
配置到 InspirationContext.tsx
    ↓
广告变现上线
```

---

## 8. 提交记录（近期）

| Commit | 描述 |
|--------|------|
| `3e15486` | docs: update migration plan with userId fix |
| `b829d90` | fix: resolve userId placeholder and add missing scene labels |
| `ae6f392` | fix: check user quota before cache check to prevent bypass |
| `051a9b4` | feat: add 6 scene buttons UI in home page |
| `6a134b2` | feat: integrate rewarded video ad in InspirationContext |
| `295daaf` | feat: add reportAdWatched API method |
| `cb0b5f2` | feat: add career, emotion, fortune agent scenes |
| `ecb3eda` | feat: modify generate endpoint to check premium status |
| `92c7f88` | feat: add ad-rewarded callback endpoint |
| `59f3f76` | feat: add free quota check in agent service |
| `c69d1b7` | feat: add types for ad-rewarded flow |
| `6a8979e` | feat: add daily_free_usage table for free quota tracking |

---

> 文档版本: v2.8
> 创建时间: 2026-04-02
> 更新时间: 2026-04-03
> 状态: Phase 1-7 全部完成，AI Agent 已通过 GLM-5 联调，userId bug 已修复
