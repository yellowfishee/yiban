# 易伴·卦象神兽 Web MVP

> 项目状态：开发完成 | 最后更新：2026-04-02

---

## 一、项目概述

**产品定位**：通过领养卦象神兽、学习《易经》智慧的国学互动应用 Web 端
**Slogan**：领养一只文化神兽，收获一份今日灵感
**核心理念**：不预测命运，只提供文化视角的灵感启发
**技术架构**：React 18 + TypeScript + Vite + TailwindCSS
**未来扩展**：Tauri 打包为 iOS/Android App

---

## 二、技术栈

| 维度 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5.4 |
| 样式 | TailwindCSS 3.4（无其他 UI 框架）|
| 路由 | React Router v6 |
| 状态管理 | React Context + useReducer |
| 数据持久化 | localStorage |
| Mock 数据 | `src/mocks/` 模拟 API 接口 |

---

## 三、目录结构

```
yiban-web/
├── public/
│   └── hexagrams/              # 神兽图片（绘图师提供 PNG 后放入）
│       └── .gitkeep
├── assets/
│   └── hexagrams.json          # 48条语料（12卦 × 4心境）
├── src/
│   ├── main.tsx               # React 入口
│   ├── App.tsx                # 路由 + Context Provider 注入
│   ├── index.css              # Tailwind + CSS 变量主题
│   ├── api/
│   │   └── hexagram.ts        # API 接口定义（未来对接真实后端）
│   ├── mocks/
│   │   ├── index.ts           # 统一导出
│   │   └── hexagrams.ts       # Mock 实现（异步函数）
│   ├── types/
│   │   └── hexagram.ts        # Mood, Hexagram, Inspiration, ThemeMode
│   ├── utils/
│   │   ├── date.ts           # formatDate, getToday, isToday
│   │   └── storage.ts        # STORAGE_KEYS, getItem, setItem, getJSON, setJSON
│   ├── context/
│   │   ├── InspirationContext.tsx  # 今日灵感（useReducer）
│   │   ├── CollectionContext.tsx    # 已领养神兽列表
│   │   └── SettingsContext.tsx      # 主题 + 极简模式
│   ├── components/
│   │   ├── layout/
│   │   │   └── PageLayout.tsx      # 页面骨架 + 条件渲染 TabBar
│   │   ├── ui/
│   │   │   ├── Disclaimer.tsx       # 免责声明
│   │   │   └── TabBar.tsx          # 底部 Tab 导航
│   │   ├── hexagram/
│   │   │   ├── HexagramSymbol.tsx   # 神兽图标（图片优先，emoji fallback）
│   │   │   ├── HexagramBadge.tsx    # 名称 + 符号组合
│   │   │   ├── HexagramCard.tsx     # 神兽大卡（浮动动画）
│   │   │   └── HexagramGridItem.tsx # 收藏网格项
│   │   ├── inspiration/
│   │   │   ├── MoodSelector.tsx     # 心境选择器
│   │   │   ├── InspirationText.tsx   # 打字机效果
│   │   │   └── InspirationDisplay.tsx # 絮语展示 + 免责声明
│   │   └── knowledge/
│   │       ├── KnowledgeCard.tsx     # 知识卡片
│   │       └── HexagramListTile.tsx # 卦象列表项
│   └── pages/
│       ├── HomePage.tsx        # 今日灵感
│       ├── CollectionPage.tsx   # 神兽收藏
│       ├── StudyPage.tsx       # 智慧书斋
│       └── SettingsPage.tsx     # 设置
└── package.json
```

---

## 四、数据结构

### 4.1 语料格式（hexagrams.json）

```json
{
  "hexagrams": [
    {
      "id": "qian",
      "name": "乾",
      "symbol": "龙",
      "moods": {
        "work": { "interpretation": "...", "encouragement": "..." },
        "emotion": { "interpretation": "...", "encouragement": "..." },
        "inspiration": { "interpretation": "...", "encouragement": "..." },
        "encouragement": { "interpretation": "...", "encouragement": "..." }
      }
    }
  ]
}
```

**注意**：代码中使用 `entry.moods.work.interpretation`（不是 `.encouragement`）

### 4.2 TypeScript 类型

```typescript
type Mood = 'work' | 'emotion' | 'inspiration' | 'encouragement';

interface Hexagram {
  id: string;
  name: string;
  symbol: string;
  interpretations: Record<Mood, string>;  // 实际使用 interpretation 字段
}

interface Inspiration {
  hexagram: Hexagram;
  mood: Mood;
  text: string;   // 即 interpretations[mood]
  date: string;
}

type ThemeMode = 'xuanqing' | 'dailan' | 'mojin';
```

### 4.3 localStorage Keys

| Key | 类型 | 说明 |
|-----|------|------|
| `yiban_today_date` | string | 今日日期（yyyy-MM-dd）|
| `yiban_today_hexagram` | string | 今日卦象 ID |
| `yiban_collection` | string (JSON) | 已领养神兽 ID 数组 |
| `yiban_theme` | string | 主题（xuanqing/dailan/mojin）|
| `yiban_simplified` | string | 极简模式（true/false）|

### 4.4 12 神兽 ID 命名

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

## 五、主题系统

三套主题通过 CSS 变量实现：

```css
:root {                              /* xuanqing（默认）*/
  --color-bg: #F5F0E8;
  --color-text: #1A2B3C;
  --color-accent: #C73E3A;
}

[data-theme="dailan"] {
  --color-bg: #FAF8F5;
  --color-text: #3D5A73;
  --color-accent: #D4A5A5;
}

[data-theme="mojin"] {
  --color-bg: #EDE8DC;
  --color-text: #1C1C1C;
  --color-accent: #C9A84C;
}
```

**主题切换逻辑**（SettingsContext）：
- `xuanqing` → `document.documentElement.removeAttribute('data-theme')`
- `dailan`/`mojin` → `setAttribute('data-theme', theme)`

---

## 六、组件设计原则

**单一职责**：每个文件只做一件事

| 组件 | 职责 |
|------|------|
| `HexagramSymbol` | 仅渲染图标（图片加载失败 → emoji fallback）|
| `HexagramBadge` | 组合 Symbol + 名称 + 符号文字 |
| `HexagramCard` | 大卡展示 + 浮动动画 |
| `MoodSelector` | 仅处理心境按钮交互 |
| `InspirationText` | 仅处理打字机动画 |
| `InspirationDisplay` | 组合 InspirationText + Disclaimer |
| `PageLayout` | 仅布局骨架 + TabBar 条件渲染 |

---

## 七、图片加载机制

```
HexagramSymbol 组件:
1. 尝试加载 /hexagrams/{hexagramId}.png
2. onError → setImgError(true)
3. imgError=true → 渲染 emoji（EMOJI_MAP[symbol] ?? '✨'）

更换图片：只需替换 public/hexagrams/ 下的 PNG 文件，无需改代码
```

**Emoji Map**：
```typescript
const EMOJI_MAP = {
  龙: '🐉', 牛: '🐂', 麒麟: '🦒', 龟: '🐢',
  鹿: '🦌', 鲲: '🐋', 虎: '🐅', 狐: '🦊',
  凤: '🦅', 鹤: '🦢', 狮: '🦁', 虹: '🌈',
};
```

---

## 八、Context 设计

### InspirationContext
- **State**: `{ currentHexagram, selectedMood, inspiration, alreadyAdoptedToday, isLoading }`
- **Actions**: LOAD, SELECT_MOOD, ADOPT_SUCCESS, SET_LOADING
- **loadToday**: 检查 localStorage 是否有今日卦象；有则恢复，无则随机
- **selectMood**: 异步创建 Inspiration 对象
- **adopt**: 保存到 COLLECTION

### CollectionContext
- **State**: `{ adoptedIds }`
- **adoptedHexagrams**: 通过 getAllHexagrams() 映射 ID → Hexagram 对象

### SettingsContext
- **State**: `{ theme, simplified }`
- **setTheme**: 持久化 + 操作 DOM `data-theme` 属性
- **toggleSimplified**: 切换布尔值

---

## 九、Mock 函数（异步）

```typescript
// 所有 mock 函数都是 async，返回 Promise
getAllHexagrams(): Promise<Hexagram[]>
getHexagramById(id: string): Promise<Hexagram | undefined>
getRandomHexagram(): Promise<Hexagram>
createInspiration(hexagram: Hexagram, mood: Mood): Promise<Inspiration>
```

**调用处需 await**：
- `HomePage`: `selectMood` 是 async callback
- `StudyPage`: `useEffect` 中调用 `getAllHexagrams()`（返回 Promise）

---

## 十、合规要求

**禁用词**：占卜、算命、预测、运势、风水、命理、玄学

**语气**：使用"或许"、"可能"、"启发"等非确定性词汇

**免责声明**（每条絮语底部必显示）：
> 本小程序所有内容均基于《周易》等传统文化典籍进行现代化、趣味化解读，旨在传播国学知识，提供文化视角的启发。所有内容仅供娱乐与文化学习参考，不涉及任何命运预测，亦不构成任何决策建议。请理性看待，专注现实生活。

---

## 十一、运行命令

```bash
npm install      # 安装依赖
npm run dev      # 开发服务器（port 5173）
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

---

## 十二、已验证问题修复记录

1. **JSON 结构不匹配**：hexagrams.json 使用 `{hexagrams: [...]}` 包装数组，解析时需用 `data.hexagrams.map()` 而非 `Object.entries()`

2. **Mock 函数需 async**：API 接口声明返回 `Promise`，实际实现也必须是 `async`

3. **selectMood 需创建 Inspiration**：不仅更新 mood 状态，还需调用 `createInspiration()` 生成絮语

4. **getAllHexagrams 在 StudyPage 中需处理异步**：使用 `useState` + `useEffect` 模式

---

## 十三、后续扩展

| 阶段 | 内容 |
|------|------|
| MVP 后 | 接入 LLM API 动态生成絮语 |
| 扩展一期 | 神兽家园（喂食、学习等养成互动）|
| 扩展二期 | 64 卦完整上线 |
| 长期 | Tauri 打包为 App |

---

## 十四、相关文档

- 设计文档：`/Users/mac/github/yiban/docs/superpowers/specs/2026-04-02-yiban-web-design.md`
- 实现计划：`/Users/mac/github/yiban/docs/superpowers/plans/2026-04-02-yiban-web-plan.md`
- Flutter 原型：`/Users/mac/github/yiban/`（同一仓库，main 分支）
