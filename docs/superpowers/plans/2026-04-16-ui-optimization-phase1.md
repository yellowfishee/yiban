# UI 优化第一阶段实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现主题系统 + 首页沉浸感增强

**Architecture:** 创建 tokens.scss 定义 CSS 变量，通过 data-theme 属性切换主题；首页添加水墨晕染背景和呼吸动效。

**Tech Stack:** Taro 3.6.39, SCSS, CSS Variables, CSS Animations

---

## 文件结构

### 新建文件

| 文件 | 职责 |
|------|------|
| `packages/app/src/styles/tokens.scss` | CSS 变量定义（3套主题） |

### 修改文件

| 文件 | 改动 |
|------|------|
| `packages/app/src/app.scss` | 引入 tokens.scss，移除硬编码颜色 |
| `packages/app/src/app.tsx` | 添加 data-theme 属性支持 |
| `packages/app/src/pages/home/index.scss` | 使用 CSS 变量 + 添加沉浸感增强 |
| `packages/app/src/pages/login/index.scss` | 使用 CSS 变量 |
| `packages/app/src/pages/settings/index.scss` | 使用 CSS 变量 |
| `packages/app/src/pages/collection/index.scss` | 使用 CSS 变量 |
| `packages/app/src/components/agreement/*.scss` | 使用 CSS 变量 |

---

## Task 1: 创建 tokens.scss

**Files:**
- Create: `packages/app/src/styles/tokens.scss`

- [ ] **Step 1: 创建 styles 目录和 tokens.scss**

```scss
/* 易伴·卦象神兽 - 设计 Token */

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

---

## Task 2: 修改 app.scss 引入 tokens

**Files:**
- Modify: `packages/app/src/app.scss`

- [ ] **Step 1: 在文件顶部引入 tokens.scss**

在第一行前添加：

```scss
@import './styles/tokens.scss';
```

- [ ] **Step 2: 替换硬编码颜色为 CSS 变量**

将 body 样式改为：

```scss
body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  overflow-x: hidden;
}
```

- [ ] **Step 3: 替换 .page-container 颜色**

```scss
.page-container {
  min-height: 100vh;
  padding: 32px 32px 64px;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-light) 100%);
  position: relative;
  overflow: hidden;
}
```

- [ ] **Step 4: 替换 .title 颜色**

```scss
.title {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  margin-bottom: 24px;
}
```

- [ ] **Step 5: 替换 .text 颜色**

```scss
.text {
  font-family: var(--font-sans);
  color: var(--color-text);
}

.text-light {
  color: var(--color-text-secondary);
}

.text-lighter {
  color: var(--color-text-hint);
}
```

- [ ] **Step 6: 替换 .btn 颜色**

```scss
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  box-shadow: 0 8px 24px var(--color-glow);
}

.btn-primary:active {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--color-glow);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-secondary:active {
  background: var(--color-primary-light);
}
```

- [ ] **Step 7: 替换 .card 颜色**

```scss
.card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  transition: all 0.4s ease;
}

.card:active {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

---

## Task 3: 修改 app.tsx 支持主题

**Files:**
- Modify: `packages/app/src/app.tsx`

- [ ] **Step 1: 添加 useSettings hook 导入和调用**

修改导入：

```typescript
import { type ReactNode } from 'react';
import { useLaunch } from '@tarojs/taro';
import { View } from '@tarojs/components';
import './app.scss';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { CollectionProvider } from './context/CollectionContext';
import { InspirationProvider } from './context/InspirationContext';
```

- [ ] **Step 2: 创建内部组件使用主题**

在 App 组件前添加：

```typescript
function AppContent({ children }: { children?: ReactNode }) {
  const { theme } = useSettings();
  
  return (
    <View className="app" data-theme={theme === 'xuanqing' ? undefined : theme}>
      {children}
    </View>
  );
}
```

- [ ] **Step 3: 修改 App 组件使用 AppContent**

```typescript
function App({ children }: AppProps) {
  useLaunch(() => {
    // App launched
  });

  return (
    <AuthProvider>
      <SettingsProvider>
        <CollectionProvider>
          <InspirationProvider>
            <AppContent>{children}</AppContent>
          </InspirationProvider>
        </CollectionProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
```

---

## Task 4: 迁移 home/index.scss 使用 CSS 变量

**Files:**
- Modify: `packages/app/src/pages/home/index.scss`

- [ ] **Step 1: 删除 SCSS 变量定义**

删除第 2-8 行的变量定义：

```scss
/* 首页样式 - 沉浸开签 + 标签卡组 */
// 删除以下行：
// $color-primary: #C73E3A;
// $color-gold: #D4AF37;
// $color-text: #1A2B3C;
// $color-text-secondary: rgba(26, 43, 60, 0.6);
// $color-text-hint: rgba(26, 43, 60, 0.35);
// $color-bg: #F5F0E8;
// $color-bg-light: #FDFCF9;
```

- [ ] **Step 2: 替换 .home-page 颜色**

```scss
.home-page {
  min-height: 100vh;
  padding: 24px 24px 48px;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-light) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  // ...其余不变
```

- [ ] **Step 3: 替换 .home-page__app-name 颜色**

```scss
&__app-name {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--color-text-hint);
  margin-top: 16px;
  letter-spacing: 4px;
}
```

- [ ] **Step 4: 替换 .home-page__spinner 颜色**

```scss
&__spinner {
  width: 64px;
  height: 64px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

- [ ] **Step 5: 替换 .home-page__loading-text 颜色**

```scss
&__loading-text {
  margin-top: 20px;
  font-size: 24px;
  color: var(--color-text-hint);
  font-family: var(--font-serif);
}
```

- [ ] **Step 6: 替换 .home-page__error-text 颜色**

```scss
&__error-text {
  font-size: 26px;
  color: var(--color-text);
  margin-bottom: 24px;
  text-align: center;
  padding: 0 32px;
  font-family: var(--font-serif);
}
```

- [ ] **Step 7: 替换 .home-page__subtitle 颜色**

```scss
&__subtitle {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--color-primary);
  opacity: 0.85;
}
```

- [ ] **Step 8: 替换 .home-page__desc 颜色**

```scss
&__desc {
  font-size: 20px;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.6;
}
```

- [ ] **Step 9: 替换 .home-page__btn 颜色**

```scss
&__btn {
  width: 100%;
  max-width: 400px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  margin-top: 40px;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.98);
  }

  &--primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    box-shadow: 0 6px 20px var(--color-glow);
  }

  &--secondary {
    background: transparent;
    border: 1px solid var(--color-border);
  }
}
```

- [ ] **Step 10: 替换 .home-page__btn-text 颜色**

```scss
&__btn-text {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  font-family: var(--font-serif);
  letter-spacing: 1px;

  &--secondary {
    font-size: 24px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }
}
```

- [ ] **Step 11: 替换沉浸区颜色**

```scss
&__immersive {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px;
  min-height: 45vh;
}

&__beast-glow {
  position: relative;
  margin-bottom: 16px;
  border-radius: 50%;
  box-shadow: 0 0 40px var(--color-glow), 0 0 80px var(--color-glow);

  .hexagram-symbol {
    border: 2px solid var(--color-border);
    background-color: var(--color-bg-card);
  }
}

&__hexagram-name {
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
}

&__hexagram-nature {
  font-size: 20px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

&__meihua-line {
  font-size: 18px;
  color: var(--color-text-hint);
  margin-top: 8px;
  font-family: var(--font-serif);
}

&__divider {
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-secondary), transparent);
  margin: 20px 0 16px;
}
```

- [ ] **Step 12: 替换标签栏颜色**

```scss
&__tabs {
  display: flex;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 8px;
  gap: 0;
  margin-top: 8px;
  border-bottom: 1px solid var(--color-border);

  &::-webkit-scrollbar {
    display: none;
  }
}

&__tab {
  flex-shrink: 0;
  padding: 12px 16px;
  position: relative;
  cursor: pointer;

  &--active {
    .home-page__tab-text {
      color: var(--color-primary);
      font-weight: 600;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--color-primary);
      border-radius: 2px;
    }
  }
}

&__tab-text {
  font-size: 22px;
  color: var(--color-text-hint);
  white-space: nowrap;
  transition: color 0.2s ease;
}
```

- [ ] **Step 13: 替换内容区颜色**

```scss
&__scene {
  display: flex;
  flex-direction: column;
}

&__scene-label {
  font-size: 20px;
  color: var(--color-secondary);
  font-weight: 600;
  font-family: var(--font-serif);
  letter-spacing: 2px;
}

&__scene-divider {
  height: 1px;
  background: var(--color-border);
  margin: 12px 0 16px;
}

&__scene-text {
  font-size: 24px;
  color: var(--color-text);
  line-height: 1.8;
}

&__skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

&__skeleton-line {
  height: 20px;
  background: linear-gradient(90deg, var(--color-primary-light) 25%, var(--color-border) 50%, var(--color-primary-light) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s ease-in-out infinite;
}

&__empty-scene {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  gap: 16px;
}

&__empty-scene-text {
  font-size: 22px;
  color: var(--color-text-hint);
}

&__empty-scene-btn {
  padding: 12px 32px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

&__empty-scene-btn-text {
  font-size: 20px;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 14: 替换底部区域颜色**

```scss
&__footer {
  width: 100%;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

&__disclaimer {
  padding: 8px 0;
  cursor: pointer;
}

&__disclaimer-toggle {
  font-size: 20px;
  color: var(--color-text-hint);
}

&__disclaimer-text {
  font-size: 18px;
  color: var(--color-text-hint);
  line-height: 1.6;
  padding: 12px 16px;
  text-align: center;
}
```

---

## Task 5: 添加沉浸感增强效果

**Files:**
- Modify: `packages/app/src/pages/home/index.scss`

- [ ] **Step 1: 添加水墨晕染背景**

在 `.home-page__immersive` 中添加伪元素：

```scss
&__immersive {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px;
  min-height: 45vh;
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  &::before {
    width: 300px;
    height: 300px;
    top: -50px;
    left: -80px;
    background: radial-gradient(circle, var(--color-text) 0%, transparent 70%);
    opacity: 0.03;
    animation: ink-float 20s ease-in-out infinite;
  }

  &::after {
    width: 250px;
    height: 250px;
    bottom: -30px;
    right: -60px;
    background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
    opacity: 0.05;
    animation: ink-float 25s ease-in-out infinite reverse;
  }
}
```

- [ ] **Step 2: 增强 .home-page__beast-glow 光晕效果**

```scss
&__beast-glow {
  position: relative;
  margin-bottom: 16px;
  border-radius: 50%;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, var(--color-glow) 0%, transparent 70%);
    animation: glow-pulse 4s ease-in-out infinite;
    z-index: -1;
  }

  .hexagram-symbol {
    border: 2px solid var(--color-border);
    background-color: var(--color-bg-card);
    animation: symbol-breathe 6s ease-in-out infinite;
  }
}
```

- [ ] **Step 3: 添加卦象名称渐现动画**

```scss
&__hexagram-name {
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
  animation: fade-in-up 0.5s ease-out;
}
```

- [ ] **Step 4: 添加动画定义**

在文件末尾 `@media` 之前添加：

```scss
@keyframes ink-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, -15px) scale(1.05);
  }
}

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

@keyframes symbol-breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

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

- [ ] **Step 5: 添加减弱动效支持**

在动画定义后添加：

```scss
@media (prefers-reduced-motion: reduce) {
  .home-page__immersive::before,
  .home-page__immersive::after {
    animation: none;
  }
  
  .home-page__beast-glow::before,
  .home-page__beast-glow .hexagram-symbol {
    animation: none;
  }
  
  .home-page__hexagram-name {
    animation: none;
  }
}
```

---

## Task 6: 迁移 login/index.scss 使用 CSS 变量

**Files:**
- Modify: `packages/app/src/pages/login/index.scss`

- [ ] **Step 1: 读取文件并替换颜色**

将所有 `#C73E3A` 替换为 `var(--color-primary)`
将所有 `#1A2B3C` 替换为 `var(--color-text)`
将所有 `rgba(26, 43, 60, 0.6)` 替换为 `var(--color-text-secondary)`
将所有 `rgba(26, 43, 60, 0.35)` 替换为 `var(--color-text-hint)`
将所有 `#F5F0E8` 替换为 `var(--color-bg)`
将所有 `#FDFCF9` 替换为 `var(--color-bg-light)`

---

## Task 7: 迁移 settings/index.scss 使用 CSS 变量

**Files:**
- Modify: `packages/app/src/pages/settings/index.scss`

- [ ] **Step 1: 读取文件并替换颜色**

将所有 `#C73E3A` 替换为 `var(--color-primary)`
将所有 `#1A2B3C` 替换为 `var(--color-text)`
将所有 `rgba(26, 43, 60, 0.6)` 替换为 `var(--color-text-secondary)`
将所有 `rgba(26, 43, 60, 0.35)` 替换为 `var(--color-text-hint)`
将所有 `#F5F0E8` 替换为 `var(--color-bg)`
将所有 `#FDFCF9` 替换为 `var(--color-bg-light)`

---

## Task 8: 迁移 collection/index.scss 使用 CSS 变量

**Files:**
- Modify: `packages/app/src/pages/collection/index.scss`

- [ ] **Step 1: 读取文件并替换颜色**

将所有 `#C73E3A` 替换为 `var(--color-primary)`
将所有 `#D4AF37` 替换为 `var(--color-secondary)`
将所有 `#1A2B3C` 替换为 `var(--color-text)`
将所有 `rgba(26, 43, 60, 0.6)` 替换为 `var(--color-text-secondary)`
将所有 `rgba(26, 43, 60, 0.35)` 替换为 `var(--color-text-hint)`
将所有 `#F5F0E8` 替换为 `var(--color-bg)`
将所有 `#FDFCF9` 替换为 `var(--color-bg-light)`

---

## Task 9: 迁移 agreement 组件 SCSS 使用 CSS 变量

**Files:**
- Modify: `packages/app/src/components/agreement/AgreementCheckbox.scss`
- Modify: `packages/app/src/components/agreement/AgreementModal.scss`
- Modify: `packages/app/src/pages/agreement/index.scss`

- [ ] **Step 1: 替换 AgreementCheckbox.scss 颜色**

```scss
.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  cursor: pointer;

  &__box {
    width: 18px;
    height: 18px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;

    &--checked {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  &__check {
    color: #fff;
    font-size: 12px;
    font-weight: bold;
  }

  &__text {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  &__link {
    color: var(--color-primary);
  }
}
```

- [ ] **Step 2: 替换 AgreementModal.scss 颜色**

```scss
.agreement-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  &__container {
    position: relative;
    width: 85%;
    max-width: 320px;
    background: var(--color-bg-light);
    border-radius: 12px;
    padding: 24px 20px;
    box-shadow: var(--shadow-lg);
  }

  &__title {
    display: block;
    font-size: 18px;
    font-weight: bold;
    color: var(--color-text);
    text-align: center;
    margin-bottom: 16px;
  }

  &__desc {
    display: block;
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  &__content {
    margin-bottom: 20px;
  }

  &__btn {
    padding: 12px 0;
    border-radius: 8px;
    background: var(--color-primary-light);
    text-align: center;
    cursor: pointer;

    &--active {
      background: var(--color-primary);
    }
  }

  &__btn-text {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
  }
}
```

- [ ] **Step 3: 替换 agreement/index.scss 颜色**

```scss
.agreement-page {
  min-height: 100vh;
  padding: 20px 16px 40px;
  background: var(--color-bg-light);

  &__title {
    display: block;
    font-size: 20px;
    font-weight: bold;
    color: var(--color-text);
    text-align: center;
    margin-bottom: 8px;
  }

  &__update {
    display: block;
    font-size: 12px;
    color: var(--color-text-hint);
    text-align: center;
    margin-bottom: 24px;
  }

  &__section {
    margin-bottom: 20px;
  }

  &__section-title {
    display: block;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  &__section-content {
    display: block;
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: 1.8;
    white-space: pre-wrap;
  }
}
```

---

## Task 10: 类型检查和验证

- [ ] **Step 1: 运行类型检查**

```bash
pnpm --filter @yiban/app typecheck
```

Expected: 无错误

---

## Task 11: 构建验证

- [ ] **Step 1: 构建微信小程序**

```bash
pnpm --filter @yiban/core build && pnpm --filter @yiban/app build:weapp
```

Expected: 编译成功

---

## Task 12: 提交更改

- [ ] **Step 1: 查看更改**

```bash
git status
git diff --stat
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat: 实现主题系统 + 首页沉浸感增强

- 新增 tokens.scss 定义 CSS 变量（3套主题）
- app.tsx 支持 data-theme 属性切换主题
- 所有页面迁移到 CSS 变量
- 首页添加水墨晕染背景和呼吸动效
- 支持 prefers-reduced-motion 减弱动效"
```
