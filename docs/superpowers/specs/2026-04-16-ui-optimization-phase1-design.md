# UI 优化第一阶段设计文档

**日期**: 2026-04-16  
**状态**: 待实现

## 概述

第一阶段 UI 优化聚焦两个核心目标：
1. **主题系统**：统一设计 Token，实现三套主题切换
2. **首页沉浸感**：增加传统美学背景装饰和动效

---

## 一、主题系统

### 目标

- 统一所有设计 Token 到 CSS 变量
- 实现三套主题切换：玄青（默认）、黛蓝、墨金
- 确保主题切换即时生效，无需刷新

### 文件结构

```
packages/app/src/styles/
├── tokens.scss      # CSS 变量定义（新建）
└── animations.scss  # 全局动画（从 app.scss 抽离）
```

### CSS 变量定义

```scss
// tokens.scss

:root {
  /* 玄青主题 - 默认 */
  --color-primary: #C73E3A;
  --color-primary-light: rgba(199, 62, 58, 0.1);
  --color-primary-dark: #A52F2C;
  --color-secondary: #D4AF37;
  --color-text: #1A2B3C;
  --color-text-secondary: rgba(26, 43, 60, 0.6);
  --color-text-hint: rgba(26, 43, 60, 0.35);
  --color-bg: #F5F0E8;
  --color-bg-light: #FDFCF9;
  --color-bg-card: #FFFFFF;
  --color-border: rgba(26, 43, 60, 0.1);
  --color-glow: rgba(199, 62, 58, 0.3);
  
  /* 字体 */
  --font-serif: 'STSong', 'SimSun', serif;
  --font-sans: system-ui, -apple-system, sans-serif;
  
  /* 间距 */
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  
  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* 黛蓝主题 */
[data-theme="dailan"] {
  --color-primary: #D4A5A5;
  --color-primary-light: rgba(212, 165, 165, 0.15);
  --color-primary-dark: #B88A8A;
  --color-secondary: #7BA3B8;
  --color-text: #3D5A73;
  --color-text-secondary: rgba(61, 90, 115, 0.6);
  --color-text-hint: rgba(61, 90, 115, 0.35);
  --color-bg: #FAF8F5;
  --color-bg-light: #FDFCFA;
  --color-bg-card: #FFFFFF;
  --color-border: rgba(61, 90, 115, 0.1);
  --color-glow: rgba(212, 165, 165, 0.4);
}

/* 墨金主题 */
[data-theme="mojin"] {
  --color-primary: #C9A84C;
  --color-primary-light: rgba(201, 168, 76, 0.15);
  --color-primary-dark: #A88A2E;
  --color-secondary: #8B7355;
  --color-text: #1C1C1C;
  --color-text-secondary: rgba(28, 28, 28, 0.6);
  --color-text-hint: rgba(28, 28, 28, 0.35);
  --color-bg: #EDE8DC;
  --color-bg-light: #F5F2EA;
  --color-bg-card: #FAF8F3;
  --color-border: rgba(28, 28, 28, 0.1);
  --color-glow: rgba(201, 168, 76, 0.4);
}
```

### 主题切换实现

**修改 app.tsx**:

```typescript
// 在 App 组件中，从 SettingsContext 读取主题
const { theme } = useSettings();

// 在最外层 View 添加 data-theme 属性
<View className="app" data-theme={theme}>
  {children}
</View>
```

**主题名称映射**:

| SettingsContext 值 | data-theme 属性 |
|-------------------|-----------------|
| `xuanqing` | 无（默认） |
| `dailan` | `dailan` |
| `mojin` | `mojin` |

### 页面迁移

需要迁移的页面 SCSS：

| 文件 | 改动 |
|------|------|
| `pages/home/index.scss` | 替换 `$color-*` 变量为 `var(--color-*)` |
| `pages/login/index.scss` | 替换硬编码颜色 |
| `pages/settings/index.scss` | 替换硬编码颜色 |
| `pages/collection/index.scss` | 替换硬编码颜色 |
| `pages/agreement/index.scss` | 替换硬编码颜色 |
| `pages/privacy/index.scss` | 无需改动（引用 agreement） |
| `components/agreement/*.scss` | 替换硬编码颜色 |
| `app.scss` | 引入 tokens.scss |

---

## 二、首页沉浸感增强

### 目标

- 增加传统美学背景装饰
- 添加微动效提升体验
- 确保性能不受影响

### 背景装饰

#### 1. 水墨晕染层

在首页沉浸区添加两个水墨晕染圆形：

```scss
.home-page__immersive {
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  
  // 左上水墨晕染
  &::before {
    width: 300px;
    height: 300px;
    top: -50px;
    left: -80px;
    background: radial-gradient(
      circle,
      var(--color-text) 0%,
      transparent 70%
    );
    opacity: 0.03;
    filter: blur(40px);
    animation: ink-float 20s ease-in-out infinite;
  }
  
  // 右下水墨晕染
  &::after {
    width: 250px;
    height: 250px;
    bottom: -30px;
    right: -60px;
    background: radial-gradient(
      circle,
      var(--color-primary) 0%,
      transparent 70%
    );
    opacity: 0.05;
    filter: blur(30px);
    animation: ink-float 25s ease-in-out infinite reverse;
  }
}
```

#### 2. 神兽光晕增强

扩展现有光晕效果：

```scss
.home-page__beast-glow {
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(
      circle,
      var(--color-glow) 0%,
      transparent 70%
    );
    animation: glow-pulse 4s ease-in-out infinite;
  }
}
```

### 动效定义

```scss
// 水墨浮动
@keyframes ink-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, -15px) scale(1.05);
  }
}

// 光晕呼吸
@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

// 符号呼吸
@keyframes symbol-breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

// 文字渐现
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 动效应用

| 元素 | 动效 | 时长 |
|------|------|------|
| 水墨晕染 | `ink-float` | 20-25s |
| 神兽光晕 | `glow-pulse` | 4s |
| 神兽符号 | `symbol-breathe` | 6s |
| 卦象名称 | `fade-in-up` | 0.5s（一次性） |

### 减弱动效支持

```scss
@media (prefers-reduced-motion: reduce) {
  .home-page__immersive::before,
  .home-page__immersive::after,
  .home-page__beast-glow::before {
    animation: none;
  }
  
  .home-page__beast-glow {
    animation: none;
  }
}
```

### 小程序兼容性

小程序端需注意：
- `filter: blur()` 在部分机型性能较差，使用 `transform: translateZ(0)` 优化
- 伪元素动画在小程序中可能有限制，考虑降级方案
- 复杂动画可简化为仅保留光晕呼吸

```scss
/* 小程序端简化方案 */
.home-page__immersive--weapp {
  &::before,
  &::after {
    animation: none; /* 禁用水墨动画 */
    opacity: 0.02;   /* 降低透明度 */
  }
}
```

---

## 三、实现计划

### 阶段 1: 主题系统

1. 创建 `styles/tokens.scss`
2. 修改 `app.scss` 引入 tokens
3. 修改 `app.tsx` 添加 data-theme 属性
4. 迁移 `home/index.scss`
5. 迁移其他页面 SCSS
6. 测试三套主题切换

### 阶段 2: 沉浸感增强

1. 添加水墨晕染背景
2. 增强神兽光晕效果
3. 添加动效定义
4. 应用动效到各元素
5. 添加减弱动效支持
6. 小程序端测试和优化

---

## 四、验收标准

### 主题系统

- [ ] 切换主题后所有页面颜色同步变化
- [ ] 切换无闪烁
- [ ] 重启应用后主题保持

### 沉浸感增强

- [ ] 水墨晕染效果自然不突兀
- [ ] 动效流畅，不影响交互
- [ ] 开启减弱动效后无动画
- [ ] 小程序端性能正常（FPS > 50）

---

## 五、后续阶段（不在本次范围）

- 第二阶段：收藏页优化（筛选/分类）
- 第三阶段：无障碍支持（ARIA 标签）
- 第四阶段：响应式优化（平板布局）
