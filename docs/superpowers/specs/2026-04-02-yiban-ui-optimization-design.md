# 易伴·卦象神兽 UI 优化设计方案

> 日期：2026-04-02
> 状态：已批准实施

---

## 一、目标

在现有组件基础上，通过 SVG 图标替换、卡片质感升级、背景纹理叠加、动效增强四项改动，实现水墨国风调性。改动范围精准控制在 6 个文件，无新依赖，零破坏性风险。

---

## 二、改动清单

### 2.1 TabBar（src/components/ui/TabBar.tsx）

emoji → 内联 SVG 水墨线条图标：

| Tab | 原 | 新 SVG 风格 |
|-----|-----|------------|
| 今日 | ✨ | 毛笔点墨，圆点略偏心 |
| 收藏 | 📖 | 简笔线装书，侧开页 |
| 书斋 | 📚 | 简笔横匾/卷轴 |
| 设置 | ⚙️ | 墨盘，圆盘工字格 |

SVG 规格：`width/height=20`，`stroke="currentColor"`，`stroke-width=1.5`，`fill="none"`（选中时 `fill="currentColor"`）

### 2.2 HexagramCard（src/components/hexagram/HexagramCard.tsx）

- 底色：`#FFFFFF` → `#FDFCF9`
- 加 1px 边框：`rgba(26,43,60,0.12)`
- 外阴影减弱，加底部内阴影
- 右上角 SVG 云纹装饰（absolute 定位）
- 背景加淡墨点阵纹理（radial-gradient，透明度 0.03）
- 神兽圆形容器加淡墨描边

### 2.3 MoodSelector（src/components/inspiration/MoodSelector.tsx）

- 未选中背景：`#F3F4F6` → `rgba(26,43,60,0.06)`
- 选中态加 1px 淡墨描边
- Hover：`transform: scale(1.03)` + `transition: 150ms`

### 2.4 InspirationDisplay（src/components/inspiration/InspirationDisplay.tsx）

- 白色卡面
- 顶部加 2px 淡墨上边框 `border-top: 2px solid rgba(26,43,60,0.08)`
- 底部内阴影 `box-shadow: inset 0 -2px 8px rgba(26,43,60,0.04)`

### 2.5 index.css（src/index.css）

- 新增 `fadeInUp` 入场动画
- 新增 `.page-texture` 背景云纹纹理类

### 2.6 PageLayout（src/components/layout/PageLayout.tsx）

- `<main>` 外层包裹纹理层 `.page-texture`

---

## 三、无新依赖

所有效果均通过 CSS 变量 + 内联 SVG 实现，无需安装任何新包。
