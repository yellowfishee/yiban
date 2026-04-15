# 收藏页增强实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为收藏页添加搜索、分类筛选、出处过滤、时间排序功能

**Architecture:** 前端筛选，通过 useMemo 实现多条件过滤。扩展 CollectionContext 支持 adoptedAtMap。新建 SearchBar、CategoryTabs、FilterBar 三个组件。

**Tech Stack:** Taro 3.6.39 + React + TypeScript + SCSS + CSS Variables

---

## 文件结构

```
packages/
├── core/
│   └── src/
│       ├── types/hexagram.ts     # 新增 BeastCategory 类型
│       └── data/hexagrams.json   # 新增 category 字段
└── app/
    └── src/
        ├── styles/tokens.scss    # 新增 danger 颜色变量
        ├── context/CollectionContext.tsx  # 新增 adoptedAtMap
        └── pages/
            ├── settings/index.scss        # 重写（阶段0）
            └── collection/
                ├── index.tsx              # 添加筛选逻辑
                ├── index.scss             # 新增筛选组件样式
                └── components/
                    ├── SearchBar.tsx      # 新建
                    ├── SearchBar.scss
                    ├── CategoryTabs.tsx   # 新建
                    ├── CategoryTabs.scss
                    ├── FilterBar.tsx      # 新建
                    └── FilterBar.scss
```

---

## 阶段 0：Settings 页面 CSS 重写

### Task 0.1: 新增 danger 颜色变量

**Files:**
- Modify: `packages/app/src/styles/tokens.scss`

- [ ] **Step 1: 添加 danger 颜色变量**

在 `:root` 中添加：

```scss
:root {
  /* ... existing variables ... */
  
  /* 危险操作颜色 */
  --color-danger: #ef4444;
  --color-danger-light: rgba(239, 68, 68, 0.2);
  --color-danger-muted: rgba(239, 68, 68, 0.6);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/styles/tokens.scss
git commit -m "feat: add danger color variables to tokens"
```

### Task 0.2: 重写 Settings 页面 SCSS

**Files:**
- Modify: `packages/app/src/pages/settings/index.scss`

- [ ] **Step 1: 重写整个 SCSS 文件**

```scss
.settings-page {
  min-height: 100vh;
  padding: var(--spacing-xl) var(--spacing-xl) 120px;
  background: var(--color-bg);

  &__header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  &__title {
    font-family: var(--font-serif);
    font-size: 48px;
    font-weight: bold;
    color: var(--color-text);
  }

  &__card {
    background-color: var(--color-bg-card);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);

    &--danger {
      border: 4px solid var(--color-danger-light);
    }
  }

  &__card-title {
    display: block;
    font-size: 28px;
    font-weight: bold;
    color: var(--color-text);
    margin-bottom: var(--spacing-lg);
  }

  &__user {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  &__user-avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__user-avatar-text {
    font-size: 40px;
    font-weight: bold;
    color: #fff;
  }

  &__user-info {
    flex: 1;
  }

  &__user-name {
    display: block;
    font-size: 36px;
    font-weight: bold;
    color: var(--color-text);
    margin-bottom: var(--spacing-xs);
  }

  &__user-id {
    display: block;
    font-size: 24px;
    color: var(--color-text-hint);
  }

  &__themes {
    display: flex;
    gap: 32px;
    justify-content: center;
  }

  &__theme-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    position: relative;

    &--active {
      .settings-page__theme-preview {
        box-shadow: var(--shadow-md);
        border-color: var(--color-primary);
      }
    }
  }

  &__theme-preview {
    width: 96px;
    height: 120px;
    border-radius: var(--radius-md);
    border: 4px solid transparent;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  &__theme-preview-header {
    height: 32px;
  }

  &__theme-preview-body {
    padding: var(--spacing-sm);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__theme-preview-text {
    height: 8px;
    border-radius: 4px;
    opacity: 0.6;

    &--short {
      width: 60%;
    }
  }

  &__theme-name {
    font-size: 24px;
    color: var(--color-text-hint);

    &--active {
      font-weight: bold;
      color: var(--color-text);
    }
  }

  &__theme-check {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    background: var(--color-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) 0;

    &--clickable {
      cursor: pointer;
      
      &:active {
        opacity: 0.7;
      }
    }
  }

  &__item-left {
    flex: 1;
  }

  &__item-label {
    display: block;
    font-size: 28px;
    font-weight: bold;
    color: var(--color-text);

    &--danger {
      color: var(--color-danger);
    }
  }

  &__item-hint {
    display: block;
    font-size: 24px;
    color: var(--color-text-hint);
    margin-top: 4px;
  }

  &__item-arrow {
    font-size: 32px;
    color: var(--color-text-hint);
  }

  &__toggle {
    width: 96px;
    height: 48px;
    border-radius: 24px;
    background-color: var(--color-border);
    position: relative;
    transition: all 0.2s ease;

    &--on {
      background-color: var(--color-primary);
    }
  }

  &__toggle-knob {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--color-bg-card);
    transition: all 0.2s ease;

    &--on {
      left: auto;
      right: 4px;
    }
  }

  &__font-sizes {
    display: flex;
    gap: var(--spacing-sm);
  }

  &__font-size {
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-sm);
    background: var(--color-bg-light);
    transition: all 0.2s ease;

    &--active {
      background: var(--color-primary-light);
    }
  }

  &__font-size-text {
    font-size: 24px;
    color: var(--color-text);
  }

  &__about {
    background-color: var(--color-primary-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    text-align: center;
    margin-top: var(--spacing-xl);
  }

  &__about-text {
    font-size: 26px;
    color: var(--color-text-secondary);
    line-height: 1.8;
    white-space: pre-line;
  }

  &__version {
    display: block;
    font-size: 24px;
    color: var(--color-text-hint);
    margin-top: var(--spacing-md);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/pages/settings/index.scss
git commit -m "fix: rewrite settings page SCSS to match new TSX structure"
```

---

## 阶段 1：数据扩展

### Task 1.1: 新增 BeastCategory 类型

**Files:**
- Modify: `packages/core/src/types/hexagram.ts`

- [ ] **Step 1: 添加 BeastCategory 类型**

在文件开头添加：

```typescript
export type BeastCategory = '龙类' | '鸟类' | '兽类' | '龟类' | '神马类' | '其他';
```

在 `RawHexagram` 接口中添加：

```typescript
export interface RawHexagram {
  id: string;
  name: string;
  symbol: string;
  category?: BeastCategory;  // 新增
  nature: string;
  concept: string;
  source: string;
  description: string;
  rationale?: string;
  moods: Record<Mood, RawMoodData>;
}
```

- [ ] **Step 2: 更新 core 导出**

在 `packages/core/src/index.ts` 中确保导出：

```typescript
export type { BeastCategory } from './types/hexagram';
```

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/types/hexagram.ts packages/core/src/index.ts
git commit -m "feat: add BeastCategory type to core"
```

### Task 1.2: 为 hexagrams.json 添加 category 字段

**Files:**
- Modify: `packages/core/src/data/hexagrams.json`

- [ ] **Step 1: 为每个卦象添加 category 字段**

分类映射：

| 神兽 | category | 神兽 | category | 神兽 | category |
|------|----------|------|----------|------|----------|
| 应龙 | 龙类 | 烛龙 | 龙类 | 蛟龙 | 龙类 |
| 螭吻 | 龙类 | 鸱吻 | 龙类 | 腾蛇 | 龙类 |
| 飞廉 | 龙类 | 凤凰 | 鸟类 | 朱雀 | 鸟类 |
| 重明鸟 | 鸟类 | 青鸟 | 鸟类 | 青鸾 | 鸟类 |
| 比翼鸟 | 鸟类 | 毕方 | 鸟类 | 三足金乌 | 鸟类 |
| 鸿鹄 | 鸟类 | 鸾鸟 | 鸟类 | 精卫 | 鸟类 |
| 白虎 | 兽类 | 麒麟 | 兽类 | 貔貅 | 兽类 |
| 狴犴 | 兽类 | 狻猊 | 兽类 | 饕餮 | 兽类 |
| 穷奇 | 兽类 | 梼杌 | 兽类 | 獬豸 | 兽类 |
| 角端 | 兽类 | 陆吾 | 兽类 | 开明兽 | 兽类 |
| 当康 | 兽类 | 朱厌 | 兽类 | 犼 | 兽类 |
| 傲因 | 兽类 | 蛊雕 | 兽类 | 灵龟 | 龟类 |
| 玄龟 | 龟类 | 赑屃 | 龟类 | 霸下 | 龟类 |
| 玄武 | 龟类 | 天马 | 神马类 | 飞马 | 神马类 |
| 赤骥 | 神马类 | 騊駼 | 神马类 | 驺吾 | 神马类 |
| 驺虞 | 神马类 | 乘黄 | 神马类 | 谛听 | 其他 |
| 白泽 | 其他 | 屏翳 | 其他 | 雷神 | 其他 |
| 雷电兽 | 其他 | 夔牛 | 其他 | 化蛇 | 其他 |
| 冉遗鱼 | 其他 | 文鳐 | 其他 | 皋陶 | 其他 |
| 英招 | 其他 | | | | |

示例修改：

```json
{
  "id": "qian_qian",
  "name": "乾为天",
  "symbol": "应龙",
  "category": "龙类",
  "nature": "刚健与刚健",
  ...
}
```

- [ ] **Step 2: 验证 JSON 格式**

```bash
cat packages/core/src/data/hexagrams.json | jq . > /dev/null && echo "JSON valid"
```

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/data/hexagrams.json
git commit -m "feat: add category field to all hexagrams"
```

### Task 1.3: 构建 core 包

**Files:**
- N/A（构建产物）

- [ ] **Step 1: 构建 core**

```bash
pnpm --filter @yiban/core build
```

- [ ] **Step 2: 验证类型导出**

```bash
cd packages/app && npx tsc --noEmit
```

---

## 阶段 2：组件开发

### Task 2.1: 创建 SearchBar 组件

**Files:**
- Create: `packages/app/src/pages/collection/components/SearchBar.tsx`
- Create: `packages/app/src/pages/collection/components/SearchBar.scss`

- [ ] **Step 1: 创建 SearchBar.tsx**

```tsx
import { View, Input, Text } from '@tarojs/components';
import './SearchBar.scss';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = '搜索卦名或神兽' }: SearchBarProps) {
  return (
    <View className="search-bar">
      <Text className="search-bar__icon">🔍</Text>
      <Input
        className="search-bar__input"
        placeholder={placeholder}
        placeholderClass="search-bar__placeholder"
        value={value}
        onInput={(e) => onChange(e.detail.value)}
      />
      {value && (
        <View className="search-bar__clear" onClick={() => onChange('')}>
          <Text className="search-bar__clear-text">×</Text>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: 创建 SearchBar.scss**

```scss
.search-bar {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  margin: var(--spacing-md);
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);

  &__icon {
    font-size: 16px;
    margin-right: var(--spacing-sm);
  }

  &__input {
    flex: 1;
    font-size: 15px;
    color: var(--color-text);
    background: transparent;
  }

  &__placeholder {
    color: var(--color-text-hint);
  }

  &__clear {
    padding: var(--spacing-xs);
    
    &:active {
      opacity: 0.7;
    }
  }

  &__clear-text {
    font-size: 18px;
    color: var(--color-text-secondary);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/collection/components/
git commit -m "feat: create SearchBar component"
```

### Task 2.2: 创建 CategoryTabs 组件

**Files:**
- Create: `packages/app/src/pages/collection/components/CategoryTabs.tsx`
- Create: `packages/app/src/pages/collection/components/CategoryTabs.scss`

- [ ] **Step 1: 创建 CategoryTabs.tsx**

```tsx
import { View, Text, ScrollView } from '@tarojs/components';
import type { BeastCategory } from '@yiban/core';
import './CategoryTabs.scss';

const CATEGORIES: { id: BeastCategory | 'all'; name: string }[] = [
  { id: 'all', name: '全部' },
  { id: '龙类', name: '龙类' },
  { id: '鸟类', name: '鸟类' },
  { id: '兽类', name: '兽类' },
  { id: '龟类', name: '龟类' },
  { id: '神马类', name: '神马类' },
  { id: '其他', name: '其他' },
];

interface CategoryTabsProps {
  active: BeastCategory | 'all';
  onChange: (category: BeastCategory | 'all') => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <ScrollView scrollX className="category-tabs" enhanced showScrollbar={false}>
      <View className="category-tabs__inner">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === active;
          return (
            <View
              key={cat.id}
              className={`category-tabs__item ${isActive ? 'category-tabs__item--active' : ''}`}
              onClick={() => onChange(cat.id)}
            >
              <Text className={`category-tabs__text ${isActive ? 'category-tabs__text--active' : ''}`}>
                {cat.name}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: 创建 CategoryTabs.scss**

```scss
.category-tabs {
  padding: 0 var(--spacing-md);
  white-space: nowrap;

  &__inner {
    display: inline-flex;
    gap: var(--spacing-sm);
  }

  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-lg);
    background: var(--color-bg-light);
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;

    &--active {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
    }
  }

  &__text {
    font-size: 14px;
    color: var(--color-text-secondary);

    &--active {
      color: var(--color-primary);
      font-weight: 500;
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/collection/components/
git commit -m "feat: create CategoryTabs component"
```

### Task 2.3: 创建 FilterBar 组件

**Files:**
- Create: `packages/app/src/pages/collection/components/FilterBar.tsx`
- Create: `packages/app/src/pages/collection/components/FilterBar.scss`

- [ ] **Step 1: 创建 FilterBar.tsx**

```tsx
import { View, Text, Picker } from '@tarojs/components';
import { useState } from 'react';
import './FilterBar.scss';

const SORT_OPTIONS = [
  { value: 'newest', label: '最新收藏' },
  { value: 'oldest', label: '最早收藏' },
  { value: 'name', label: '名称排序' },
];

interface FilterBarProps {
  sources: string[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
  sortBy: 'newest' | 'oldest' | 'name';
  onSortChange: (sort: 'newest' | 'oldest' | 'name') => void;
}

export default function FilterBar({
  sources,
  selectedSource,
  onSourceChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  const sourceOptions = ['全部出处', ...sources];
  const sourceIndex = selectedSource ? sourceOptions.indexOf(selectedSource) : 0;
  const sortIndex = SORT_OPTIONS.findIndex((s) => s.value === sortBy);

  return (
    <View className="filter-bar">
      <Picker
        mode="selector"
        range={sourceOptions}
        value={sourceIndex >= 0 ? sourceIndex : 0}
        onChange={(e) => {
          const idx = e.detail.value;
          onSourceChange(idx === 0 ? '' : sourceOptions[idx]);
        }}
      >
        <View className="filter-bar__item">
          <Text className="filter-bar__label">出处</Text>
          <Text className="filter-bar__value">{selectedSource || '全部'}</Text>
          <Text className="filter-bar__arrow">▼</Text>
        </View>
      </Picker>

      <Picker
        mode="selector"
        range={SORT_OPTIONS.map((s) => s.label)}
        value={sortIndex >= 0 ? sortIndex : 0}
        onChange={(e) => {
          const option = SORT_OPTIONS[e.detail.value];
          if (option) onSortChange(option.value as 'newest' | 'oldest' | 'name');
        }}
      >
        <View className="filter-bar__item">
          <Text className="filter-bar__label">排序</Text>
          <Text className="filter-bar__value">
            {SORT_OPTIONS.find((s) => s.value === sortBy)?.label || '最新收藏'}
          </Text>
          <Text className="filter-bar__arrow">▼</Text>
        </View>
      </Picker>
    </View>
  );
}
```

- [ ] **Step 2: 创建 FilterBar.scss**

```scss
.filter-bar {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-sm);

  &__item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-bg-light);
    border-radius: var(--radius-sm);
    
    &:active {
      opacity: 0.7;
    }
  }

  &__label {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__value {
    font-size: 13px;
    color: var(--color-text);
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__arrow {
    font-size: 10px;
    color: var(--color-text-hint);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/collection/components/
git commit -m "feat: create FilterBar component"
```

---

## 阶段 3：页面集成

### Task 3.1: 扩展 CollectionContext

**Files:**
- Modify: `packages/app/src/context/CollectionContext.tsx`

- [ ] **Step 1: 添加 adoptedAtMap 到 context**

修改 `CollectionContext.tsx`：

```tsx
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { collectionApi, type CollectionItem } from '../api/collection';
import { useAuth } from './AuthContext';
import type { RawHexagram } from '@yiban/core';

interface CollectionContextValue {
  adoptedIds: string[];
  adoptedHexagrams: RawHexagram[];
  adoptedAtMap: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [adoptedIds, setAdoptedIds] = useState<string[]>([]);
  const [adoptedHexagrams, setAdoptedHexagrams] = useState<RawHexagram[]>([]);
  const [adoptedAtMap, setAdoptedAtMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  const loadCollection = useCallback(async () => {
    if (!isLoggedIn) {
      setAdoptedIds([]);
      setAdoptedHexagrams([]);
      setAdoptedAtMap({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await collectionApi.getAll();
      
      const ids = response.collections.map((item: CollectionItem) => item.hexagramId);
      const hexagrams = response.collections.map((item: CollectionItem) => item.hexagram);
      const atMap: Record<string, number> = {};
      
      response.collections.forEach((item: CollectionItem) => {
        atMap[item.hexagramId] = new Date(item.adoptedAt).getTime();
      });

      setAdoptedIds(ids);
      setAdoptedHexagrams(hexagrams);
      setAdoptedAtMap(atMap);
    } catch (error: any) {
      console.error('Load collection failed:', error);
      setError(error.message || '加载收藏失败');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const reload = useCallback(async () => {
    await loadCollection();
  }, [loadCollection]);

  return (
    <CollectionContext.Provider
      value={{
        adoptedIds,
        adoptedHexagrams,
        adoptedAtMap,
        isLoading,
        error,
        reload,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection(): CollectionContextValue {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/context/CollectionContext.tsx
git commit -m "feat: add adoptedAtMap to CollectionContext"
```

### Task 3.2: 重写 CollectionPage

**Files:**
- Modify: `packages/app/src/pages/collection/index.tsx`
- Modify: `packages/app/src/pages/collection/index.scss`

- [ ] **Step 1: 重写 index.tsx**

```tsx
import { View, Text } from '@tarojs/components';
import { useState, useMemo } from 'react';
import { useCollection } from '../../context/CollectionContext';
import HexagramGridItem from '../../components/hexagram/HexagramGridItem';
import HexagramSymbol from '../../components/hexagram/HexagramSymbol';
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import FilterBar from './components/FilterBar';
import type { RawHexagram, BeastCategory } from '@yiban/core';
import './index.scss';

export default function CollectionPage() {
  const { adoptedHexagrams, adoptedAtMap } = useCollection();
  const [selected, setSelected] = useState<RawHexagram | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<BeastCategory | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const uniqueSources = useMemo(() => {
    const sources = new Set(adoptedHexagrams.map((h) => h.source));
    return Array.from(sources);
  }, [adoptedHexagrams]);

  const filteredHexagrams = useMemo(() => {
    return adoptedHexagrams
      .filter((hex) => {
        if (searchText) {
          const query = searchText.toLowerCase();
          const matchesName = hex.name.toLowerCase().includes(query);
          const matchesSymbol = hex.symbol.toLowerCase().includes(query);
          if (!matchesName && !matchesSymbol) return false;
        }

        if (activeCategory !== 'all' && hex.category !== activeCategory) {
          return false;
        }

        if (selectedSource && hex.source !== selectedSource) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aTime = adoptedAtMap[a.id] || 0;
        const bTime = adoptedAtMap[b.id] || 0;

        switch (sortBy) {
          case 'newest':
            return bTime - aTime;
          case 'oldest':
            return aTime - bTime;
          case 'name':
            return a.name.localeCompare(b.name, 'zh-CN');
          default:
            return 0;
        }
      });
  }, [adoptedHexagrams, adoptedAtMap, searchText, activeCategory, selectedSource, sortBy]);

  return (
    <View className="collection-page">
      <View className="collection-page__header">
        <Text className="collection-page__title">神兽收藏</Text>
        <Text className="collection-page__count">已领养 {adoptedHexagrams.length} 只神兽</Text>
      </View>

      <SearchBar value={searchText} onChange={setSearchText} />
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <FilterBar
        sources={uniqueSources}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {filteredHexagrams.length === 0 ? (
        <View className="collection-page__empty">
          {adoptedHexagrams.length === 0 ? (
            <>
              <Text className="collection-page__empty-icon">🌟</Text>
              <Text className="collection-page__empty-text">还没有领养过神兽</Text>
              <Text className="collection-page__empty-hint">去今日页遇见你的第一只神兽吧</Text>
            </>
          ) : (
            <>
              <Text className="collection-page__empty-icon">🔍</Text>
              <Text className="collection-page__empty-text">没有匹配的神兽</Text>
              <Text className="collection-page__empty-hint">试试其他筛选条件</Text>
            </>
          )}
        </View>
      ) : (
        <>
          <View className="collection-page__grid">
            {filteredHexagrams.map((hex) => (
              <HexagramGridItem
                key={hex.id}
                hexagram={hex}
                onClick={() => setSelected(hex)}
              />
            ))}
          </View>
          <View className="collection-page__footer">
            <Text className="collection-page__total">共 {filteredHexagrams.length} 只神兽</Text>
          </View>
        </>
      )}

      {selected && (
        <View className="collection-page__modal">
          <View className="collection-page__modal-mask" onClick={() => setSelected(null)} />
          <View className="collection-page__modal-content">
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
          </View>
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: 更新 index.scss**

在现有样式中添加：

```scss
.collection-page {
  min-height: 100vh;
  background: var(--color-bg);

  &__header {
    padding: var(--spacing-lg) var(--spacing-md);
    text-align: center;
    background: var(--color-bg-light);
  }

  &__title {
    display: block;
    font-family: var(--font-serif);
    font-size: 36px;
    font-weight: bold;
    color: var(--color-text);
    margin-bottom: var(--spacing-xs);
  }

  &__count {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
  }

  &__footer {
    padding: var(--spacing-lg);
    text-align: center;
  }

  &__total {
    font-size: 14px;
    color: var(--color-text-hint);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) * 2;
    min-height: 400px;
  }

  &__empty-icon {
    font-size: 64px;
    margin-bottom: var(--spacing-lg);
  }

  &__empty-text {
    font-size: 18px;
    color: var(--color-text);
    margin-bottom: var(--spacing-sm);
  }

  &__empty-hint {
    font-size: 14px;
    color: var(--color-text-hint);
  }

  // Modal styles (keep existing)
  &__modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: flex-end;
  }

  &__modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  &__modal-content {
    position: relative;
    width: 100%;
    background: var(--color-bg-card);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    padding: var(--spacing-lg);
    max-height: 70vh;
    overflow-y: auto;
  }

  &__modal-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  &__modal-icon {
    margin-right: var(--spacing-md);
  }

  &__modal-info {
    flex: 1;
  }

  &__modal-name {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: var(--color-text);
  }

  &__modal-nature {
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__modal-close {
    padding: var(--spacing-sm);
  }

  &__modal-close-text {
    font-size: 28px;
    color: var(--color-text-hint);
  }

  &__modal-section {
    margin-bottom: var(--spacing-md);
  }

  &__modal-label {
    display: block;
    font-size: 14px;
    color: var(--color-text-hint);
    margin-bottom: var(--spacing-xs);
  }

  &__modal-text {
    font-size: 16px;
    color: var(--color-text);
    line-height: 1.6;
  }

  &__modal-text--secondary {
    font-size: 15px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/collection/
git commit -m "feat: integrate search, category, and filter to collection page"
```

---

## 阶段 4：测试

### Task 4.1: 类型检查

- [ ] **Step 1: 运行类型检查**

```bash
pnpm --filter @yiban/app typecheck
pnpm --filter @yiban/core typecheck
```

Expected: No errors

### Task 4.2: H5 测试

- [ ] **Step 1: 启动开发服务器**

```bash
pnpm --filter @yiban/app dev:h5
```

- [ ] **Step 2: 手动测试**

1. 访问收藏页
2. 测试搜索功能（输入卦名、神兽名）
3. 测试分类切换
4. 测试出处筛选
5. 测试排序切换
6. 测试空状态显示
7. 测试主题切换后样式

### Task 4.3: 最终提交

- [ ] **Step 1: 确认所有改动已提交**

```bash
git status
```

Expected: working tree clean

---

## 验收清单

- [ ] Settings 页面样式正常
- [ ] 搜索功能正常，支持卦名和神兽名
- [ ] 分类切换即时生效
- [ ] 出处筛选正确过滤
- [ ] 排序功能正常
- [ ] 筛选结果计数正确
- [ ] 空状态显示友好提示
- [ ] H5 和小程序端表现一致
- [ ] 使用 CSS 变量适配主题
