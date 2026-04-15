# 易伴·卦象神兽 - 多端迁移计划

> 目标：将现有 React Web 应用迁移为 **Monorepo 架构**，支持 **Web H5 + 微信小程序** 双端发布

---

## 1. 项目概况

### 1.1 当前状态

| 维度 | 现状 |
|------|------|
| 框架 | React 18 + Vite 5 + TypeScript |
| 样式 | Tailwind CSS 3.4 |
| 路由 | react-router-dom 6 |
| 组件 | 23 个 TSX 组件 |
| 特性 | 水墨国风 UI、梅花易数起卦、64 卦神兽系统、SVG 水墨图标 |

### 1.2 目标架构

| 维度 | 目标 |
|------|------|
| 框架 | Taro 3 + React 18 + TypeScript |
| 样式 | UnoCSS（原子化 CSS，Tailwind 兼容语法） |
| 组织 | Monorepo（pnpm workspace） |
| 端 | Web H5 + 微信小程序 |
| 微信能力 | 分享 + 登录 + 云存储 |

---

## 2. 技术选型

### 2.1 为什么选 Taro？

| 对比项 | Taro | Remax | 原生小程序 |
|--------|------|-------|-----------|
| React 语法 | ✅ 完整支持 | ✅ 完整支持 | ❌ 需重写 |
| 多端编译 | ✅ 微信/支付宝/抖音/H5 | ✅ 同上 | ❌ 单端 |
| 社区生态 | ⭐⭐⭐⭐⭐ 最活跃 | ⭐⭐⭐ 较小 | ⭐⭐⭐⭐⭐ |
| UI 组件库 | Taro UI / NutUI | 较少 | 原生 |
| 学习成本 | 低（React 开发者） | 低 | 高 |

**结论**：Taro 是 React 开发者做小程序的最优选择。

### 2.2 为什么选 UnoCSS？

| 对比项 | UnoCSS | Sass | styled-components |
|--------|--------|------|-------------------|
| Tailwind 迁移成本 | ✅ 最低（语法兼容） | ❌ 需重写 | ❌ 需重写 |
| 小程序支持 | ✅ Taro 官方支持 | ✅ 原生支持 | ⚠️ 性能差 |
| 原子化 | ✅ 是 | ❌ 否 | ❌ 否 |
| 包体积 | 小 | 中 | 大 |

**结论**：UnoCSS 迁移成本最低，同时保持原子化 CSS 的开发体验。

### 2.3 为什么选 Monorepo？

| 对比项 | Monorepo | 多仓库 |
|--------|----------|--------|
| 代码复用 | ✅ 天然共享 | ❌ 需发 npm 包 |
| 开发体验 | ✅ 统一工具链 | ❌ 分散维护 |
| CI/CD | ✅ 统一流程 | ❌ 各自配置 |
| 依赖管理 | ✅ pnpm workspace | ❌ 各自安装 |

**结论**：Monorepo 是多端项目的最佳实践。

---

## 3. 目录结构

```
yiban-web/                              # 项目根目录
├── packages/
│   ├── core/                           # 【共享核心层】
│   │   ├── src/
│   │   │   ├── utils/                  # 工具函数
│   │   │   │   ├── meihua.ts           # 梅花易数算法
│   │   │   │   ├── storage.ts          # 存储抽象层
│   │   │   │   ├── date.ts             # 日期工具
│   │   │   │   └── hexagram.ts         # 卦象工具
│   │   │   ├── types/                  # 类型定义
│   │   │   │   └── hexagram.ts
│   │   │   ├── hooks/                  # 共享 hooks
│   │   │   │   ├── useHexagram.ts
│   │   │   │   └── useMeihua.ts
│   │   │   ├── data/                   # 静态数据
│   │   │   │   └── hexagrams.json
│   │   │   ├── constants/              # 常量
│   │   │   │   └── gua.ts              # 八卦常量
│   │   │   └── index.ts                # 统一导出
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                             # 【共享 UI 组件层】（可选）
│   │   ├── src/
│   │   │   ├── HexagramCard/           # 卦象卡片（跨端适配）
│   │   │   ├── HexagramSymbol/         # 神兽图标
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                            # 【Web 端】
│   │   ├── src/
│   │   │   ├── pages/                  # 页面
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── CollectionPage.tsx
│   │   │   │   ├── StudyPage.tsx
│   │   │   │   └── SettingsPage.tsx
│   │   │   ├── components/             # Web 专属组件
│   │   │   │   ├── layout/
│   │   │   │   └── ui/
│   │   │   ├── context/                # 状态管理
│   │   │   │   ├── InspirationContext.tsx
│   │   │   │   ├── CollectionContext.tsx
│   │   │   │   └── SettingsContext.tsx
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css               # UnoCSS 入口
│   │   ├── public/
│   │   │   └── hexagrams/              # 神兽 SVG 图标
│   │   ├── vite.config.ts
│   │   ├── uno.config.ts
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── miniapp/                        # 【微信小程序端】
│       ├── src/
│       │   ├── pages/                  # 页面
│       │   │   ├── home/
│       │   │   │   ├── index.tsx
│       │   │   │   └── index.config.ts
│       │   │   ├── collection/
│       │   │   ├── study/
│       │   │   └── settings/
│       │   ├── components/             # 小程序专属组件
│       │   │   └── tab-bar/
│       │   ├── app.tsx                 # Taro 入口
│       │   ├── app.config.ts           # 小程序配置
│       │   ├── app.scss                # 全局样式
│       │   └── index.html              # H5 入口（Taro 生成）
│       ├── config/                     # Taro 配置
│       │   ├── index.ts
│       │   ├── dev.ts
│       │   └── prod.ts
│       ├── project.config.json         # 微信小程序配置
│       ├── package.json
│       └── tsconfig.json
│
├── assets/                             # 共享静态资源
│   └── hexagrams.json                  # 64 卦数据
│
├── docs/                               # 文档
│   └── migration-plan.md               # 本文档
│
├── pnpm-workspace.yaml                 # Monorepo 配置
├── package.json                        # 根 package.json
├── tsconfig.base.json                  # 共享 TS 配置
└── README.md
```

---

## 4. 共享层设计

### 4.1 Core 包结构

```typescript
// packages/core/src/index.ts

// 工具函数
export * from './utils/meihua';
export * from './utils/storage';
export * from './utils/date';
export * from './utils/hexagram';

// 类型定义
export * from './types/hexagram';

// 常量
export * from './constants/gua';

// 数据
import hexagrams from './data/hexagrams.json';
export { hexagrams };
```

### 4.2 存储抽象层

小程序和 Web 的存储 API 不同，需要抽象：

```typescript
// packages/core/src/utils/storage.ts

interface StorageAdapter {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
}

// Web 端实现
const webStorage: StorageAdapter = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
};

// 小程序端实现（Taro）
// const taroStorage: StorageAdapter = {
//   getItem: (key) => Taro.getStorageSync(key),
//   setItem: (key, value) => Taro.setStorageSync(key, value),
//   removeItem: (key) => Taro.removeStorageSync(key),
// };

export const STORAGE_KEYS = {
  TODAY_DATE: 'yiban_today_date',
  COLLECTION: 'yiban_collection',
  // ...
} as const;

// 运行时注入适配器
let adapter: StorageAdapter = webStorage;

export function setStorageAdapter(newAdapter: StorageAdapter) {
  adapter = newAdapter;
}

export function getItem(key: string) {
  return adapter.getItem(key);
}

export function setItem(key: string, value: string) {
  adapter.setItem(key, value);
}
```

### 4.3 梅花易数算法

核心算法可完全复用，无需修改：

```typescript
// packages/core/src/utils/meihua.ts

export const GUA_IDS = ['qian','dui','li','zhen','xun','kan','gen','kun'];
export const GUA_NAMES = ['乾','兑','离','震','巽','坎','艮','坤'];

export function meihuaDivination(timestamp: number) {
  // 现有算法逻辑不变
  const lastTwo = Number(String(timestamp).slice(-2));
  const randomThree = Math.random();
  const product = lastTwo * randomThree;
  const decimalPart = product - Math.floor(product);
  const seed = Math.floor(decimalPart * 1000) % 1000;

  const year = new Date(timestamp).getFullYear();
  const lowerGua = seed % 8;
  const upperGua = (seed + year % 8) % 8;
  const movingLine = (seed % 6) + 1;

  return {
    upperGua,
    lowerGua,
    movingLine,
    hexagramId: `${GUA_IDS[upperGua]}_${GUA_IDS[lowerGua]}`,
  };
}
```

---

## 5. 迁移步骤

### Phase 1: Monorepo 搭建（1-2 天）

**目标**：搭建 Monorepo 基础结构

**步骤**：

1. 初始化 pnpm workspace
```bash
pnpm init
echo 'packages:\n  - "packages/*"' > pnpm-workspace.yaml
```

2. 创建 packages 目录结构
```bash
mkdir -p packages/{core,web,miniapp}
```

3. 配置 TypeScript 公共配置
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

4. 抽取核心层代码到 packages/core

**验收标准**：
- [ ] pnpm install 成功
- [ ] packages/core 可独立构建
- [ ] 包间依赖正确配置

---

### Phase 2: Web 端迁移（2-3 天）

**目标**：将现有 Web 代码迁移到 packages/web，替换 Tailwind 为 UnoCSS

**步骤**：

1. 安装 UnoCSS
```bash
cd packages/web
pnpm add -D unocss @unocss/reset
```

2. 配置 UnoCSS
```typescript
// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  theme: {
    colors: {
      primary: '#1A2B3C',
      accent: '#C73E3A',
      bg: '#F5F0E8',
    },
  },
  shortcuts: {
    // 常用组合类
    'btn-primary': 'py-3 px-6 bg-accent text-white rounded-full font-bold',
  },
});
```

3. 迁移现有 Tailwind 类名（大部分可直接复用）

4. 更新 vite.config.ts

**验收标准**：
- [ ] npm run dev 启动正常
- [ ] npm run build 成功
- [ ] 样式显示正确

---

### Phase 3: 小程序端搭建（2-3 天）

**目标**：创建 Taro 小程序项目，配置基础架构

**步骤**：

1. 初始化 Taro 项目
```bash
cd packages
npx @tarojs/cli init miniapp
```

2. 选择配置：
   - 框架：React
   - 样式：Sass（后续配置 UnoCSS）
   - 模板：默认模板

3. 安装 UnoCSS for Taro
```bash
pnpm add @tarojs/plugin-html unocss
```

4. 配置 Taro
```typescript
// config/index.ts
import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import UnoCSS from 'unocss/webpack';

export default defineConfig({
  mini: {
    webpackChain(chain) {
      chain.plugin('unocss').use(UnoCSS());
    },
  },
  h5: {
    webpackChain(chain) {
      chain.plugin('unocss').use(UnoCSS());
    },
  },
});
```

5. 配置微信小程序
```json
// project.config.json
{
  "appid": "你的小程序 AppID",
  "projectname": "yiban-miniapp",
  "setting": {
    "es6": true,
    "postcss": true,
    "minified": true
  }
}
```

**验收标准**：
- [ ] npm run dev:weapp 成功编译
- [ ] 微信开发者工具可预览
- [ ] 页面渲染正常

---

### Phase 4: UI 组件适配（3-4 天）

**目标**：适配水墨国风 UI 组件到小程序

**关键适配点**：

| 组件 | Web | 小程序 | 适配策略 |
|------|-----|--------|----------|
| TabBar | react-router-dom | Taro.navigateTab | 小程序用原生 TabBar |
| HexagramCard | div + CSS | View + CSS | 共享样式，替换标签 |
| HexagramSymbol | img + SVG | Image + SVG | SVG 需转 base64 或 iconfont |
| TaijiSVG | SVG 动画 | SVG 动画 | Taro 支持 SVG |
| 背景动画 | CSS @keyframes | CSS @keyframes | 小程序支持良好 |

**SVG 神兽图标处理**：

方案 A：转为 iconfont
```bash
# 使用 iconfont.cn 或本地工具将 64 个 SVG 转为字体图标
```

方案 B：内联 SVG
```typescript
// 小程序中直接使用 SVG 字符串
const SVG_MAP: Record<string, string> = {
  qian_qian: '<svg>...</svg>',
  // ...
};
```

方案 C：Image 组件
```typescript
// 使用 base64 或远程图片
<Image src={`data:image/svg+xml;base64,${base64}`} />
```

**推荐**：方案 A（iconfont）性能最佳，但需要额外构建步骤。

---

### Phase 5: 微信能力实现（2-3 天）

**目标**：实现分享、登录、云存储

#### 5.1 分享功能

```typescript
// pages/home/index.tsx
import Taro from '@tarojs/taro';

export default function HomePage() {
  // 分享给朋友
  useShareAppMessage(() => ({
    title: `我今日遇见了${hexagram?.symbol}，来看看你的神兽`,
    path: '/pages/home/index',
    imageUrl: '/assets/share.png',
  }));

  // 分享到朋友圈
  useShareTimeline(() => ({
    title: '易伴·卦象神兽 - 每日遇见你的守护神兽',
    query: '',
    imageUrl: '/assets/share.png',
  }));
}
```

#### 5.2 微信登录

```typescript
// packages/core/src/utils/auth.ts
import Taro from '@tarojs/taro';

export async function wxLogin() {
  const { code } = await Taro.login();
  // 发送 code 到后端换取 openid/session_key
  const res = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return res.json();
}

export async function getUserInfo() {
  const { userInfo } = await Taro.getUserProfile({
    desc: '用于完善用户资料',
  });
  return userInfo;
}
```

#### 5.3 云存储

```typescript
// packages/core/src/utils/cloud.ts
import Taro from '@tarojs/taro';

export async function syncCollection(collection: HexagramCollection) {
  await Taro.cloud.callFunction({
    name: 'syncCollection',
    data: { collection },
  });
}

export async function fetchCollection() {
  const res = await Taro.cloud.callFunction({
    name: 'fetchCollection',
  });
  return res.result;
}
```

**云开发配置**：
```json
// project.config.json
{
  "cloudfunctionRoot": "cloudfunctions/",
  "cloudbaseRoot": "cloudbase/"
}
```

---

### Phase 6: 测试与打磨（2-3 天）

**测试清单**：

- [ ] Web 端功能完整
- [ ] 小程序端功能完整
- [ ] 分享功能正常
- [ ] 登录流程正常
- [ ] 数据同步正常
- [ ] 动画流畅（60fps）
- [ ] 包体积合理（<2MB）
- [ ] 兼容性测试（iOS/Android）

---

## 6. 包依赖

### 6.1 根 package.json

```json
{
  "name": "yiban-monorepo",
  "private": true,
  "scripts": {
    "dev:web": "pnpm -F @yiban/web dev",
    "dev:miniapp": "pnpm -F @yiban/miniapp dev:weapp",
    "build:web": "pnpm -F @yiban/web build",
    "build:miniapp": "pnpm -F @yiban/miniapp build:weapp",
    "build:all": "pnpm build:web && pnpm build:miniapp"
  },
  "devDependencies": {
    "typescript": "^5.2.2"
  }
}
```

### 6.2 packages/core/package.json

```json
{
  "name": "@yiban/core",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.2.2"
  }
}
```

### 6.3 packages/web/package.json

```json
{
  "name": "@yiban/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "@yiban/core": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "unocss": "^0.58.0",
    "vite": "^5.0.8"
  }
}
```

### 6.4 packages/miniapp/package.json

```json
{
  "name": "@yiban/miniapp",
  "version": "1.0.0",
  "scripts": {
    "dev:weapp": "taro build --type weapp --watch",
    "build:weapp": "taro build --type weapp",
    "dev:h5": "taro build --type h5 --watch",
    "build:h5": "taro build --type h5"
  },
  "dependencies": {
    "@yiban/core": "workspace:*",
    "@tarojs/components": "^3.6.0",
    "@tarojs/helper": "^3.6.0",
    "@tarojs/plugin-framework-react": "^3.6.0",
    "@tarojs/plugin-html": "^3.6.0",
    "@tarojs/react": "^3.6.0",
    "@tarojs/runtime": "^3.6.0",
    "@tarojs/shared": "^3.6.0",
    "@tarojs/taro": "^3.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@tarojs/cli": "^3.6.0",
    "@tarojs/webpack5-runner": "^3.6.0",
    "typescript": "^5.2.2",
    "unocss": "^0.58.0"
  }
}
```

---

## 7. 风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| UnoCSS 小程序兼容性问题 | 中 | 准备 Sass 作为备选方案 |
| SVG 动画在小程序性能差 | 中 | 简化动画或转为 Lottie |
| 云开发学习成本 | 低 | 先用本地存储，后续迭代云存储 |
| 微信审核不通过 | 低 | 确保「测试内容」标记，避免敏感词 |

---

## 8. 时间线

```
Week 1:
  Day 1-2: Phase 1 - Monorepo 搭建
  Day 3-5: Phase 2 - Web 端迁移

Week 2:
  Day 1-3: Phase 3 - 小程序端搭建
  Day 4-5: Phase 4 - UI 组件适配（开始）

Week 3:
  Day 1-2: Phase 4 - UI 组件适配（完成）
  Day 3-5: Phase 5 - 微信能力实现

Week 4:
  Day 1-3: Phase 6 - 测试与打磨
  Day 4-5: 缓冲时间，处理意外问题
```

---

## 9. 下一步行动

1. **确认此计划**：用户审核并确认
2. **开始 Phase 1**：搭建 Monorepo 基础结构
3. **每日同步**：每个 Phase 完成后汇报进度

---

> 文档版本: v1.0
> 创建时间: 2026-04-02
> 状态: 待确认
