# 体验优化设计文档

**日期**: 2026-04-16  
**状态**: 待实现

## 概述

为易伴·卦象神兽添加四个方面的体验优化：骨架屏、触觉反馈、页面过渡、手势交互。

---

## 一、骨架屏

### 1.1 实现页面

- 首页（今日页）
- 收藏页
- 设置页

### 1.2 首页骨架屏

**触发时机**: 初始加载、下拉刷新

**布局**:
```
┌─────────────────────────────────┐
│        ████████████             │ ← 神兽图标占位 (120x120)
│        ██████                   │ ← 卦名占位 (200x36)
│        ████                     │ ← 属性占位 (160x24)
│  ─────────────────────────      │ ← 分隔线
│  █████████████████████████████  │ ← 文字行占位 (全宽x20)
│  ████████████████████           │ ← 文字行占位 (70%x20)
│  █████████████████████████      │ ← 文字行占位 (85%x20)
└─────────────────────────────────┘
```

**样式**:
```scss
.skeleton {
  background: linear-gradient(90deg, 
    var(--color-bg-light) 25%, 
    var(--color-bg-card) 50%, 
    var(--color-bg-light) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 1.3 收藏页骨架屏

**触发时机**: 页面进入、筛选变更

**布局**:
```
┌─────────────────────────────────┐
│  ███  ███  ███                  │ ← 搜索栏占位
│  █ ██ █ ██ █ ██ █ ██ █ ██       │ ← 分类标签占位
│  ┌───┐ ┌───┐ ┌───┐              │
│  │███│ │███│ │███│              │ ← 网格项占位
│  └───┘ └───┘ └───┘              │
└─────────────────────────────────┘
```

### 1.4 设置页骨架屏

**触发时机**: 用户信息加载中

**布局**:
```
┌─────────────────────────────────┐
│  ○ ██████                       │ ← 头像+昵称占位
│  ██████                         │ ← 用户ID占位
│  ─────────────────────────      │
│  ██████████████████             │ ← 卡片标题占位
│  ██████    ██████               │ ← 主题预览占位
│  ██████    ██████               │
└─────────────────────────────────┘
```

### 1.5 组件实现

创建通用骨架屏组件：

```tsx
// components/skeleton/Skeleton.tsx
interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  count?: number;
  className?: string;
}

export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  circle = false,
  count = 1,
  className 
}: SkeletonProps) {
  return (
    <View className={`skeleton ${circle ? 'skeleton--circle' : ''} ${className || ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={{ width, height }} className="skeleton__item" />
      ))}
    </View>
  );
}
```

---

## 二、触觉反馈

### 2.1 API 封装

```ts
// utils/haptic.ts
import Taro from '@tarojs/taro';

export const haptic = {
  light: () => {
    Taro.vibrateShort({ type: 'light' });
  },
  medium: () => {
    Taro.vibrateShort({ type: 'medium' });
  },
  heavy: () => {
    Taro.vibrateShort({ type: 'heavy' });
  },
  success: () => {
    Taro.vibrateShort({ type: 'medium' });
  },
  error: () => {
    Taro.vibrateLong();
  },
};
```

### 2.2 触发场景

| 操作 | 反馈类型 | API 调用 |
|------|----------|----------|
| 打卡按钮点击 | medium | `haptic.medium()` |
| Tab 切换 | light | `haptic.light()` |
| 分类/筛选切换 | light | `haptic.light()` |
| 加载成功 | medium | `haptic.medium()` |
| 加载失败 | long | `haptic.error()` |
| 弹窗打开 | light | `haptic.light()` |
| 弹窗关闭 | light | `haptic.light()` |
| 删除操作 | heavy | `haptic.heavy()` |
| 收藏成功 | medium | `haptic.medium()` |

### 2.3 实现位置

```tsx
// 首页打卡按钮
const onCheckIn = async () => {
  haptic.medium();
  // ... existing logic
};

// Tab 切换
onClick={() => {
  haptic.light();
  setActiveScene(scene.key);
}}

// 弹窗
const openModal = () => {
  haptic.light();
  setVisible(true);
};

const closeModal = () => {
  haptic.light();
  setVisible(false);
};
```

---

## 三、页面过渡

### 3.1 TabBar 切换动画

小程序 TabBar 切换由微信控制，可自定义的是 Tab 图标动画。

**实现**: 在自定义 TabBar 组件中添加图标缩放动画

```scss
.tab-bar__item {
  &--active {
    .tab-bar__icon {
      transform: scale(1.2);
      transition: transform 0.2s ease;
    }
  }
}
```

### 3.2 Modal 弹窗动画

收藏页详情弹窗添加滑入/滑出动画：

```scss
.collection-page__modal {
  &--enter {
    animation: slide-up 0.3s ease-out;
  }
  
  &--leave {
    animation: slide-down 0.3s ease-in;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
```

### 3.3 弹窗动画通用组件

```tsx
// components/modal/AnimatedModal.tsx
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

---

## 四、手势交互

### 4.1 下拉刷新

首页添加下拉刷新功能：

```tsx
// pages/home/index.tsx
<ScrollView
  scrollY
  refresherEnabled
  refresherTriggered={refreshing}
  onRefresherRefresh={handleRefresh}
  className="home-page__scroll"
>
  {/* content */}
</ScrollView>

const handleRefresh = async () => {
  haptic.light();
  await loadToday();
  setRefreshing(false);
};
```

### 4.2 长按操作

收藏页长按显示操作菜单：

```tsx
// pages/collection/index.tsx
<View
  className="collection-page__grid-item"
  onLongPress={() => showItemMenu(hex)}
  onClick={() => setSelected(hex)}
>
  {/* content */}
</View>

const showItemMenu = (hex: RawHexagram) => {
  haptic.medium();
  Taro.showActionSheet({
    itemList: ['分享', '取消收藏'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 分享
      } else if (res.tapIndex === 1) {
        // 取消收藏
        handleRemove(hex.id);
      }
    },
  });
};
```

### 4.3 左滑删除

使用 MovableView 实现左滑删除：

```tsx
// components/swipeable/SwipeableItem.tsx
interface SwipeableItemProps {
  onDelete: () => void;
  children: ReactNode;
}

export default function SwipeableItem({ onDelete, children }: SwipeableItemProps) {
  const [offsetX, setOffsetX] = useState(0);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const diff = startX.current - e.touches[0].clientX;
    if (diff > 60) {
      setOffsetX(-80);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <View className="swipeable-item">
      <View 
        className="swipeable-item__content"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {}}
      >
        {children}
      </View>
      <View className="swipeable-item__action" onClick={onDelete}>
        <Text className="swipeable-item__action-text">删除</Text>
      </View>
    </View>
  );
}
```

### 4.4 双击放大

首页神兽图标双击放大查看：

```tsx
// pages/home/index.tsx
const lastTap = useRef(0);

const handleDoubleTap = () => {
  const now = Date.now();
  if (now - lastTap.current < 300) {
    haptic.medium();
    setShowBeastDetail(true);
  }
  lastTap.current = now;
};

<View 
  className="home-page__beast-glow"
  onClick={handleDoubleTap}
>
  <HexagramSymbol symbol={currentHexagram.symbol} size="lg" />
</View>
```

---

## 五、文件结构

```
packages/app/src/
├── components/
│   ├── skeleton/
│   │   ├── Skeleton.tsx
│   │   └── Skeleton.scss
│   ├── modal/
│   │   ├── AnimatedModal.tsx
│   │   └── AnimatedModal.scss
│   └── swipeable/
│       ├── SwipeableItem.tsx
│       └── SwipeableItem.scss
├── utils/
│   └── haptic.ts
└── pages/
    ├── home/
    │   ├── index.tsx      # 添加下拉刷新、双击放大
    │   └── index.scss     # 骨架屏样式
    ├── collection/
    │   ├── index.tsx      # 添加长按、左滑删除
    │   └── index.scss     # 弹窗动画、骨架屏
    └── settings/
        ├── index.tsx      # 添加骨架屏
        └── index.scss     # 骨架屏样式
```

---

## 六、验收标准

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

---

## 七、实现顺序

1. **骨架屏** - 基础组件 + 各页面集成
2. **触觉反馈** - 工具函数 + 各操作集成
3. **弹窗动画** - 组件 + 集成
4. **手势交互** - 下拉刷新 → 长按 → 左滑 → 双击
