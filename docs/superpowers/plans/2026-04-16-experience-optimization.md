# 体验优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为易伴添加骨架屏、触觉反馈、页面过渡、手势交互四项体验优化

**Architecture:** 创建通用 Skeleton 组件、haptic 工具函数、AnimatedModal 组件、SwipeableItem 组件，在各页面集成

**Tech Stack:** Taro 3.6.39 + React + TypeScript + SCSS

---

## 文件结构

```
packages/app/src/
├── components/
│   ├── skeleton/
│   │   ├── Skeleton.tsx      # 新建
│   │   └── Skeleton.scss     # 新建
│   ├── modal/
│   │   ├── AnimatedModal.tsx # 新建
│   │   └── AnimatedModal.scss # 新建
│   └── swipeable/
│       ├── SwipeableItem.tsx # 新建
│       └── SwipeableItem.scss # 新建
├── utils/
│   └── haptic.ts             # 新建
└── pages/
    ├── home/
    │   ├── index.tsx         # 修改
    │   └── index.scss        # 修改
    ├── collection/
    │   ├── index.tsx         # 修改
    │   └── index.scss        # 修改
    └── settings/
        ├── index.tsx         # 修改
        └── index.scss        # 修改
```

---

## 阶段 1：骨架屏

### Task 1: 创建 Skeleton 组件

**Files:**
- Create: `packages/app/src/components/skeleton/Skeleton.tsx`
- Create: `packages/app/src/components/skeleton/Skeleton.scss`

- [ ] **Step 1: 创建 Skeleton.tsx**

```tsx
import { View } from '@tarojs/components';
import './Skeleton.scss';

interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
}

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  circle = false,
  className = ''
}: SkeletonProps) {
  return (
    <View 
      className={`skeleton ${circle ? 'skeleton--circle' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}
```

- [ ] **Step 2: 创建 Skeleton.scss**

```scss
.skeleton {
  background: linear-gradient(90deg, 
    var(--color-bg-light) 25%, 
    var(--color-bg-card) 50%, 
    var(--color-bg-light) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: var(--radius-sm);

  &--circle {
    border-radius: 50%;
  }
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/components/skeleton/
git commit -m "feat: add Skeleton component"
```

### Task 2: 首页骨架屏

**Files:**
- Modify: `packages/app/src/pages/home/index.tsx`
- Modify: `packages/app/src/pages/home/index.scss`

- [ ] **Step 1: 在 home/index.tsx 添加骨架屏**

在文件顶部添加导入：

```tsx
import Skeleton from '../../components/skeleton/Skeleton';
```

在 `HomePage` 组件中，修改 loading 状态的返回：

```tsx
// Loading state with skeleton
if ((isLoading || authLoading) && !checkedInToday) {
  return (
    <View className="home-page home-page--loading">
      <View className="home-page__skeleton">
        <Skeleton width="120px" height="120px" circle className="home-page__skeleton-icon" />
        <Skeleton width="200px" height="36px" className="home-page__skeleton-title" />
        <Skeleton width="160px" height="24px" className="home-page__skeleton-nature" />
        <View className="home-page__skeleton-divider" />
        <Skeleton width="100%" height="20px" className="home-page__skeleton-line" />
        <Skeleton width="70%" height="20px" className="home-page__skeleton-line" />
        <Skeleton width="85%" height="20px" className="home-page__skeleton-line" />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 在 home/index.scss 添加骨架屏样式**

```scss
.home-page__skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 48px;
  gap: 16px;

  &-icon {
    margin-bottom: 16px;
  }

  &-title {
    margin-bottom: 8px;
  }

  &-nature {
    margin-bottom: 24px;
  }

  &-divider {
    width: 60%;
    height: 1px;
    background: var(--color-border);
    margin: 16px 0;
  }

  &-line {
    margin-bottom: 12px;
  }
}

// 减弱动效支持
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/home/
git commit -m "feat: add skeleton loading to home page"
```

### Task 3: 收藏页骨架屏

**Files:**
- Modify: `packages/app/src/pages/collection/index.tsx`
- Modify: `packages/app/src/pages/collection/index.scss`

- [ ] **Step 1: 在 collection/index.tsx 添加骨架屏**

添加导入：

```tsx
import Skeleton from '../../components/skeleton/Skeleton';
import { useCollection } from '../../context/CollectionContext';

// 在组件内部
const { adoptedHexagrams, adoptedAtMap, isLoading } = useCollection();

// 在 return 前
if (isLoading) {
  return (
    <View className="collection-page">
      <View className="collection-page__header">
        <Text className="collection-page__title">神兽收藏</Text>
      </View>
      <View className="collection-page__skeleton">
        <View className="collection-page__skeleton-row">
          <Skeleton width="100%" height="48px" />
        </View>
        <View className="collection-page__skeleton-row">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} width="80px" height="40px" />
          ))}
        </View>
        <View className="collection-page__skeleton-grid">
          {[1,2,3,4,5,6].map(i => (
            <View key={i} className="collection-page__skeleton-item">
              <Skeleton width="80px" height="80px" circle />
              <Skeleton width="80px" height="24px" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 在 collection/index.scss 添加骨架屏样式**

```scss
.collection-page__skeleton {
  padding: 16px;

  &-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px 0;
  }

  &-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/collection/
git commit -m "feat: add skeleton loading to collection page"
```

### Task 4: 设置页骨架屏

**Files:**
- Modify: `packages/app/src/pages/settings/index.tsx`
- Modify: `packages/app/src/pages/settings/index.scss`

- [ ] **Step 1: 在 settings/index.tsx 添加骨架屏**

添加导入和加载状态：

```tsx
import Skeleton from '../../components/skeleton/Skeleton';

// 在组件内部
const { isLoggedIn, user, logout, isLoading } = useAuth();

// 在 return 前
if (isLoading) {
  return (
    <View className="settings-page">
      <View className="settings-page__header">
        <Text className="settings-page__title">设置</Text>
      </View>
      <View className="settings-page__card">
        <View className="settings-page__skeleton-user">
          <Skeleton width="96px" height="96px" circle />
          <View className="settings-page__skeleton-user-info">
            <Skeleton width="150px" height="36px" />
            <Skeleton width="100px" height="24px" />
          </View>
        </View>
      </View>
      <View className="settings-page__card">
        <Skeleton width="120px" height="28px" />
        <View className="settings-page__skeleton-themes">
          {[1,2,3].map(i => (
            <Skeleton key={i} width="96px" height="120px" />
          ))}
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 在 settings/index.scss 添加骨架屏样式**

```scss
.settings-page__skeleton {
  &-user {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  &-user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &-themes {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: var(--spacing-lg);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/settings/
git commit -m "feat: add skeleton loading to settings page"
```

---

## 阶段 2：触觉反馈

### Task 5: 创建 haptic 工具函数

**Files:**
- Create: `packages/app/src/utils/haptic.ts`

- [ ] **Step 1: 创建 haptic.ts**

```ts
import Taro from '@tarojs/taro';

export const haptic = {
  light: () => {
    try {
      Taro.vibrateShort({ type: 'light' });
    } catch (e) {
      // ignore
    }
  },
  medium: () => {
    try {
      Taro.vibrateShort({ type: 'medium' });
    } catch (e) {
      // ignore
    }
  },
  heavy: () => {
    try {
      Taro.vibrateShort({ type: 'heavy' });
    } catch (e) {
      // ignore
    }
  },
  error: () => {
    try {
      Taro.vibrateLong();
    } catch (e) {
      // ignore
    }
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/utils/haptic.ts
git commit -m "feat: add haptic feedback utility"
```

### Task 6: 首页触觉反馈

**Files:**
- Modify: `packages/app/src/pages/home/index.tsx`

- [ ] **Step 1: 添加 haptic 导入和调用**

添加导入：

```tsx
import { haptic } from '../../utils/haptic';
```

在 `onCheckIn` 函数开头添加：

```tsx
const onCheckIn = useCallback(async () => {
  haptic.medium();
  // ... existing code
}, [isLoggedIn, loginWithWeapp, handleCheckIn, reload, checkAgreement]);
```

在 `setActiveScene` 调用处添加：

```tsx
onClick={() => {
  haptic.light();
  setActiveScene(scene.key);
}}
```

在 `loadToday` 成功后添加：

```tsx
// 在 useEffect 中 loadToday() 成功后
useEffect(() => {
  loadToday().then(() => {
    if (!error) {
      haptic.medium(); // 加载成功反馈
    }
  });
}, [loadToday]);
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/pages/home/index.tsx
git commit -m "feat: add haptic feedback to home page"
```

### Task 7: 收藏页触觉反馈

**Files:**
- Modify: `packages/app/src/pages/collection/index.tsx`

- [ ] **Step 1: 添加 haptic 导入和调用**

添加导入：

```tsx
import { haptic } from '../../utils/haptic';
```

在分类切换时添加：

```tsx
<CategoryTabs 
  active={activeCategory} 
  onChange={(cat) => {
    haptic.light();
    setActiveCategory(cat);
  }} 
/>
```

在筛选器变更时添加：

```tsx
<FilterBar
  sources={uniqueSources}
  selectedSource={selectedSource}
  onSourceChange={(src) => {
    haptic.light();
    setSelectedSource(src);
  }}
  sortBy={sortBy}
  onSortChange={(sort) => {
    haptic.light();
    setSortBy(sort);
  }}
/>
```

在弹窗打开/关闭时添加：

```tsx
onClick={() => {
  haptic.light();
  setSelected(hex);
}}

// 关闭弹窗
onClick={() => {
  haptic.light();
  setSelected(null);
}}
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/pages/collection/index.tsx
git commit -m "feat: add haptic feedback to collection page"
```

### Task 8: 设置页触觉反馈

**Files:**
- Modify: `packages/app/src/pages/settings/index.tsx`

- [ ] **Step 1: 添加 haptic 导入和调用**

添加导入：

```tsx
import { haptic } from '../../utils/haptic';
```

在主题切换时添加：

```tsx
onClick={() => {
  haptic.light();
  setTheme(t.id);
}}
```

在开关切换时添加：

```tsx
onClick={() => {
  haptic.light();
  toggleSimplified();
}}
```

在字体大小切换时添加：

```tsx
onClick={() => {
  haptic.light();
  setFontSize(fs.id as 'small' | 'medium' | 'large');
}}
```

在退出登录时添加：

```tsx
const handleLogout = () => {
  haptic.heavy();
  Taro.showModal({
    // ... existing code
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/pages/settings/index.tsx
git commit -m "feat: add haptic feedback to settings page"
```

---

## 阶段 3：页面过渡

### Task 9: 创建 AnimatedModal 组件

**Files:**
- Create: `packages/app/src/components/modal/AnimatedModal.tsx`
- Create: `packages/app/src/components/modal/AnimatedModal.scss`

- [ ] **Step 1: 创建 AnimatedModal.tsx**

```tsx
import { View } from '@tarojs/components';
import { useState, useEffect, type ReactNode } from 'react';
import './AnimatedModal.scss';

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function AnimatedModal({ visible, onClose, children }: AnimatedModalProps) {
  const [render, setRender] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setRender(true);
      setTimeout(() => setAnimating(true), 10);
    } else if (render) {
      setAnimating(false);
      setTimeout(() => setRender(false), 300);
    }
  }, [visible]);

  if (!render) return null;

  return (
    <View className={`animated-modal ${animating ? 'animated-modal--visible' : ''}`}>
      <View className="animated-modal__mask" onClick={onClose} />
      <View className="animated-modal__content">
        {children}
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 创建 AnimatedModal.scss**

```scss
.animated-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0);
    transition: background 0.3s ease;
  }

  &__content {
    position: relative;
    width: 100%;
    background: var(--color-bg-card);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    padding: var(--spacing-lg);
    max-height: 70vh;
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  &--visible {
    .animated-modal__mask {
      background: rgba(0, 0, 0, 0.5);
    }

    .animated-modal__content {
      transform: translateY(0);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-modal__mask,
  .animated-modal__content {
    transition: none;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/components/modal/
git commit -m "feat: add AnimatedModal component"
```

### Task 10: 收藏页弹窗动画集成

**Files:**
- Modify: `packages/app/src/pages/collection/index.tsx`

- [ ] **Step 1: 使用 AnimatedModal 替换现有弹窗**

添加导入：

```tsx
import AnimatedModal from '../../components/modal/AnimatedModal';
```

替换弹窗代码：

```tsx
{selected && (
  <AnimatedModal visible={!!selected} onClose={() => setSelected(null)}>
    <View className="collection-page__modal-header">
      <View className="collection-page__modal-icon">
        <HexagramSymbol symbol={selected.symbol} size="md" />
      </View>
      <View className="collection-page__modal-info">
        <Text className="collection-page__modal-name">{selected.name}</Text>
        <Text className="collection-page__modal-nature">
          {selected.symbol} · {selected.nature}
        </Text>
      </View>
      <View className="collection-page__modal-close" onClick={() => setSelected(null)}>
        <Text className="collection-page__modal-close-text">×</Text>
      </View>
    </View>

    <View className="collection-page__modal-section">
      <Text className="collection-page__modal-label">卦象</Text>
      <Text className="collection-page__modal-text">{selected.concept}</Text>
    </View>

    <View className="collection-page__modal-section">
      <Text className="collection-page__modal-label">出处</Text>
      <Text className="collection-page__modal-text--secondary">{selected.source}</Text>
    </View>

    <View className="collection-page__modal-section">
      <Text className="collection-page__modal-label">关联阐释</Text>
      <Text className="collection-page__modal-text--secondary">
        {selected.description}
      </Text>
    </View>
  </AnimatedModal>
)}
```

- [ ] **Step 2: 移除旧的弹窗样式**

在 collection/index.scss 中删除 `&__modal`, `&__modal-mask`, `&__modal-content` 等样式（这些已由 AnimatedModal 提供）。

保留以下样式：

```scss
.collection-page__modal-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

// ... 其他 modal 内部样式保持不变
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/collection/
git commit -m "feat: integrate AnimatedModal into collection page"
```

---

## 阶段 4：手势交互

### Task 11: 首页下拉刷新

**Files:**
- Modify: `packages/app/src/pages/home/index.tsx`

- [ ] **Step 1: 添加下拉刷新状态和处理**

添加状态：

```tsx
const [refreshing, setRefreshing] = useState(false);
```

添加刷新处理函数：

```tsx
const handleRefresh = useCallback(async () => {
  haptic.light();
  setRefreshing(true);
  try {
    await loadToday();
    haptic.medium(); // 刷新成功反馈
  } catch (e) {
    haptic.error();
  } finally {
    setRefreshing(false);
  }
}, [loadToday]);
```

- [ ] **Step 2: 使用 ScrollView 包裹内容**

在已打卡状态的 return 中，用 ScrollView 包裹：

```tsx
return (
  <View className="home-page">
    <ScrollView
      scrollY
      className="home-page__scroll"
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      {/* 沉浸区 */}
      <View className="home-page__immersive">
        {/* ... existing code */}
      </View>

      {/* 标签栏 */}
      <ScrollView className="home-page__tabs" scrollX enableFlex>
        {/* ... existing code */}
      </ScrollView>

      {/* 内容区 */}
      <View className="home-page__content">
        {/* ... existing code */}
      </View>

      {/* 底部操作区 */}
      <View className="home-page__footer">
        {/* ... existing code */}
      </View>
    </ScrollView>
  </View>
);
```

- [ ] **Step 3: 添加 ScrollView 样式**

在 home/index.scss 添加：

```scss
.home-page__scroll {
  height: 100vh;
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/app/src/pages/home/
git commit -m "feat: add pull-to-refresh to home page"
```

### Task 12: 收藏页长按菜单

**Files:**
- Modify: `packages/app/src/pages/collection/index.tsx`

- [ ] **Step 1: 添加长按处理函数**

添加导入：

```tsx
import Taro from '@tarojs/taro';
```

添加处理函数：

```tsx
const handleLongPress = useCallback((hex: RawHexagram) => {
  haptic.medium();
  Taro.showActionSheet({
    itemList: ['分享', '取消收藏'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 分享功能
        Taro.showShareMenu({ withShareTicket: true });
      } else if (res.tapIndex === 1) {
        // 取消收藏
        handleRemoveCollect(hex.id);
      }
    },
  });
}, []);

const handleRemoveCollect = useCallback(async (hexagramId: string) => {
  try {
    haptic.heavy();
    // TODO: 调用取消收藏 API
    Taro.showToast({ title: '已取消收藏', icon: 'success' });
    haptic.medium();
  } catch (e) {
    haptic.error();
    Taro.showToast({ title: '操作失败', icon: 'none' });
  }
}, []);
```

- [ ] **Step 2: 在 HexagramGridItem 上添加长按事件**

```tsx
<HexagramGridItem
  key={hex.id}
  hexagram={hex}
  onClick={() => {
    haptic.light();
    setSelected(hex);
  }}
  onLongPress={() => handleLongPress(hex)}
/>
```

需要修改 HexagramGridItem 组件添加 onLongPress prop。

- [ ] **Step 3: 修改 HexagramGridItem 组件**

修改 `packages/app/src/components/hexagram/HexagramGridItem.tsx`：

```tsx
interface Props {
  hexagram: RawHexagram;
  onClick?: () => void;
  onLongPress?: () => void;
}

export default function HexagramGridItem({ hexagram, onClick, onLongPress }: Props) {
  return (
    <View 
      className="hexagram-grid-item" 
      onClick={onClick}
      onLongPress={onLongPress}
    >
      <HexagramSymbol symbol={hexagram.symbol} size="md" />
      <Text className="hexagram-grid-item__name">{hexagram.name}</Text>
    </View>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/app/src/pages/collection/ packages/app/src/components/hexagram/
git commit -m "feat: add long-press menu to collection items"
```

### Task 13: 创建 SwipeableItem 组件

**Files:**
- Create: `packages/app/src/components/swipeable/SwipeableItem.tsx`
- Create: `packages/app/src/components/swipeable/SwipeableItem.scss`

- [ ] **Step 1: 创建 SwipeableItem.tsx**

```tsx
import { View, Text } from '@tarojs/components';
import { useState, useRef, type ReactNode } from 'react';
import { haptic } from '../../utils/haptic';
import './SwipeableItem.scss';

interface SwipeableItemProps {
  onDelete: () => void;
  children: ReactNode;
}

export default function SwipeableItem({ onDelete, children }: SwipeableItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: any) => {
    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: any) => {
    if (!isSwiping.current) return;
    const diff = startX.current - e.touches[0].clientX;
    if (diff > 30 && offsetX === 0) {
      haptic.light();
      setOffsetX(-80);
    } else if (diff < -30 && offsetX < 0) {
      setOffsetX(0);
    }
  };

  const handleTouchEnd = () => {
    isSwiping.current = false;
  };

  const handleDelete = () => {
    haptic.heavy();
    setOffsetX(0);
    onDelete();
  };

  return (
    <View className="swipeable-item">
      <View 
        className="swipeable-item__content"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </View>
      <View className="swipeable-item__action" onClick={handleDelete}>
        <Text className="swipeable-item__action-text">删除</Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: 创建 SwipeableItem.scss**

```scss
.swipeable-item {
  position: relative;
  overflow: hidden;

  &__content {
    position: relative;
    z-index: 1;
    background: var(--color-bg-card);
    transition: transform 0.2s ease;
  }

  &__action {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 80px;
    background: var(--color-danger);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 0;
  }

  &__action-text {
    color: #fff;
    font-size: 28px;
    font-weight: 500;
  }
}

@media (prefers-reduced-motion: reduce) {
  .swipeable-item__content {
    transition: none;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/components/swipeable/
git commit -m "feat: add SwipeableItem component"
```

### Task 14: 收藏页左滑删除集成

**Files:**
- Modify: `packages/app/src/pages/collection/index.tsx`

- [ ] **Step 1: 使用 SwipeableItem 包裹收藏项**

添加导入：

```tsx
import SwipeableItem from '../../components/swipeable/SwipeableItem';
```

修改网格渲染：

```tsx
<View className="collection-page__grid">
  {filteredHexagrams.map((hex) => (
    <SwipeableItem key={hex.id} onDelete={() => handleRemoveCollect(hex.id)}>
      <HexagramGridItem
        hexagram={hex}
        onClick={() => {
          haptic.light();
          setSelected(hex);
        }}
      />
    </SwipeableItem>
  ))}
</View>
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/pages/collection/index.tsx
git commit -m "feat: integrate swipe-to-delete into collection page"
```

### Task 15: 首页双击放大

**Files:**
- Modify: `packages/app/src/pages/home/index.tsx`

- [ ] **Step 1: 添加双击检测和放大弹窗**

添加状态：

```tsx
const [showBeastDetail, setShowBeastDetail] = useState(false);
const lastTap = useRef(0);
```

添加双击处理：

```tsx
const handleBeastTap = useCallback(() => {
  const now = Date.now();
  if (now - lastTap.current < 300) {
    haptic.medium();
    setShowBeastDetail(true);
  }
  lastTap.current = now;
}, []);
```

- [ ] **Step 2: 在神兽图标上添加点击事件**

```tsx
<View 
  className="home-page__beast-glow"
  onClick={handleBeastTap}
>
  <HexagramSymbol symbol={currentHexagram!.symbol} size="lg" />
</View>
```

- [ ] **Step 3: 添加放大弹窗**

在 return 的末尾添加：

```tsx
{showBeastDetail && currentHexagram && (
  <AnimatedModal visible={showBeastDetail} onClose={() => setShowBeastDetail(false)}>
    <View className="home-page__beast-detail">
      <View className="home-page__beast-detail-icon">
        <HexagramSymbol symbol={currentHexagram.symbol} size="xl" />
      </View>
      <Text className="home-page__beast-detail-name">{currentHexagram.name}</Text>
      <Text className="home-page__beast-detail-symbol">{currentHexagram.symbol}</Text>
      <Text className="home-page__beast-detail-nature">{currentHexagram.nature}</Text>
      <View className="home-page__beast-detail-divider" />
      <Text className="home-page__beast-detail-concept">{currentHexagram.concept}</Text>
      <Text className="home-page__beast-detail-source">出处：{currentHexagram.source}</Text>
    </View>
  </AnimatedModal>
)}
```

- [ ] **Step 4: 添加放大弹窗样式**

在 home/index.scss 添加：

```scss
.home-page__beast-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &-icon {
    margin-bottom: var(--spacing-lg);
  }

  &-name {
    font-family: var(--font-serif);
    font-size: 36px;
    font-weight: bold;
    color: var(--color-primary);
    margin-bottom: 8px;
  }

  &-symbol {
    font-size: 28px;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  &-nature {
    font-size: 24px;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
  }

  &-divider {
    width: 60%;
    height: 1px;
    background: var(--color-border);
    margin: var(--spacing-md) 0;
  }

  &-concept {
    font-size: 26px;
    color: var(--color-text);
    line-height: 1.8;
    margin-bottom: var(--spacing-md);
  }

  &-source {
    font-size: 22px;
    color: var(--color-text-hint);
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/app/src/pages/home/
git commit -m "feat: add double-tap to enlarge beast icon on home page"
```

---

## 阶段 5：测试

### Task 16: 类型检查和构建测试

- [ ] **Step 1: 运行类型检查**

```bash
pnpm --filter @yiban/app typecheck
```

Expected: No errors

- [ ] **Step 2: 构建 H5**

```bash
pnpm --filter @yiban/app build:h5
```

Expected: Build success

- [ ] **Step 3: 构建小程序**

```bash
pnpm --filter @yiban/app build:weapp
```

Expected: Build success

- [ ] **Step 4: 最终提交**

确认所有改动已提交。

---

## 验收清单

- [ ] 首页加载时显示骨架屏
- [ ] 收藏页加载时显示骨架屏
- [ ] 设置页加载时显示骨架屏
- [ ] 打卡按钮有触觉反馈
- [ ] Tab 切换有触觉反馈
- [ ] 弹窗打开/关闭有触觉反馈
- [ ] 操作成功/失败有触觉反馈
- [ ] 弹窗有滑入/滑出动画
- [ ] 首页支持下拉刷新
- [ ] 收藏项支持长按菜单
- [ ] 收藏项支持左滑删除
- [ ] 神兽图标支持双击放大
- [ ] 所有动效支持 `prefers-reduced-motion`
