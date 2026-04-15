# 收藏页增强设计文档

**日期**: 2026-04-16  
**状态**: 待实现

## 概述

为收藏页添加筛选和分类功能，帮助用户更好地管理和浏览已收藏的神兽。

**功能范围**：
1. 出处筛选 - 按神兽来源过滤
2. 搜索功能 - 按卦名或神兽名搜索
3. 时间排序 - 按收藏时间排序
4. 神兽分类 - 按神兽类别分类

---

## 一、数据扩展

### 1.1 新增 category 字段

在 `hexagrams.json` 中为每个卦象添加 `category` 字段：

```typescript
// packages/core/src/types/hexagram.ts

export type BeastCategory = '龙类' | '鸟类' | '兽类' | '龟类' | '神马类' | '其他';

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

### 1.2 分类映射表

64 个神兽按类别分组：

| 分类 | 神兽列表 |
|------|----------|
| **龙类** | 应龙、烛龙、蛟龙、螭吻、鸱吻、腾蛇、飞廉 |
| **鸟类** | 凤凰、朱雀、重明鸟、青鸟、青鸾、比翼鸟、毕方、三足金乌、鸿鹄、鸾鸟、精卫 |
| **兽类** | 白虎、麒麟、貔、貔貅、狴、貔貅、狴犴、狻、貔貅、狴犴、狻猊、饕餮、穷奇、梼杌、獬豸、角端、陆吾、开明兽、当康、朱厌、犼、傲因、蛊雕 |
| **龟类** | 灵龟、玄龟、赑屃、霸下、玄武 |
| **神马类** | 天马、飞马、赤骥、騊駼、驺吾、驺虞、乘黄 |
| **其他** | 谛听、白泽、屏翳、雷神、雷电兽、夔牛、化蛇、冉遗鱼、文鳐、皋陶、英招 |

### 1.3 出处列表

11 个唯一出处值：

```
《山海经》
《山海经》《楚辞》
《云笈七签》
《拾遗记》
《神异经》
《述异记》
《庄子》
《说苑》
《地藏十轮经》
四象
龙生九子
```

---

## 二、UI 结构

### 2.1 布局设计

```
┌─────────────────────────────────┐
│ 搜索框 [🔍 搜索卦名或神兽]      │
├─────────────────────────────────┤
│ [全部] [龙类] [鸟类] [兽类]...  │ ← 分类 Tabs（横向滚动）
├─────────────────────────────────┤
│ 出处: 全部 ▼    排序: 最新 ▼   │ ← 筛选器行
├─────────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐              │
│ │应龙│ │白虎│ │凤凰│ ...        │ ← 神兽网格
│ │乾 │ │履 │ │同人│              │
│ └───┘ └───┘ └───┘              │
│                                 │
│ 共 12 只神兽                    │
└─────────────────────────────────┘
```

### 2.2 组件拆分

```
pages/collection/
├── index.tsx              # 主页面（筛选逻辑）
├── index.scss             # 样式
├── index.config.ts        # 页面配置
└── components/
    ├── SearchBar.tsx      # 搜索框组件
    ├── SearchBar.scss
    ├── CategoryTabs.tsx   # 分类标签组件
    ├── CategoryTabs.scss
    ├── FilterBar.tsx      # 出处/排序筛选器
    └── FilterBar.scss
```

### 2.3 组件设计

#### SearchBar

```tsx
interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

// 功能：
// - 输入框实时更新
// - 清除按钮（有内容时显示）
// - 自动聚焦（可选）
```

#### CategoryTabs

```tsx
interface CategoryTabsProps {
  categories: BeastCategory[];
  active: BeastCategory | 'all';
  onChange: (category: BeastCategory | 'all') => void;
}

// 功能：
// - 横向滚动标签
// - 选中高亮
// - 使用 CSS 变量适配主题
```

#### FilterBar

```tsx
interface FilterBarProps {
  sources: string[];           // 所有出处选项
  selectedSources: string[];   // 已选出处
  onSourceChange: (sources: string[]) => void;
  sortBy: 'newest' | 'oldest' | 'name';
  onSortChange: (sort: 'newest' | 'oldest' | 'name') => void;
}

// 功能：
// - 出处下拉选择器（单选或多选）
// - 排序下拉选择器
```

---

## 三、状态管理

### 3.1 筛选状态

```typescript
// CollectionPage 内部状态
const [searchText, setSearchText] = useState('');
const [activeCategory, setActiveCategory] = useState<BeastCategory | 'all'>('all');
const [selectedSource, setSelectedSource] = useState<string>('');  // 单选出处
const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
```

### 3.2 过滤逻辑

```typescript
const filteredHexagrams = useMemo(() => {
  // 1. 从 CollectionContext 获取 adoptedHexagrams 和 adoptedAt 映射
  const { adoptedHexagrams, adoptedAtMap } = useCollection();
  
  return adoptedHexagrams
    .filter(hex => {
      // 搜索过滤
      if (searchText) {
        const query = searchText.toLowerCase();
        const matchesName = hex.name.toLowerCase().includes(query);
        const matchesSymbol = hex.symbol.toLowerCase().includes(query);
        if (!matchesName && !matchesSymbol) return false;
      }
      
      // 分类过滤
      if (activeCategory !== 'all' && hex.category !== activeCategory) {
        return false;
      }
      
      // 出处过滤
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
```

### 3.3 CollectionContext 扩展

需要扩展 `CollectionContext` 以支持 `adoptedAt` 时间：

```typescript
interface CollectionContextValue {
  adoptedIds: string[];
  adoptedHexagrams: RawHexagram[];
  adoptedAtMap: Record<string, number>;  // 新增：hexagramId -> timestamp
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}
```

---

## 四、API 适配

### 4.1 现有 API 检查

检查 `/api/collection` 是否返回 `adoptedAt`：

```typescript
// packages/app/src/api/collection.ts
export interface CollectionItem {
  hexagramId: string;
  adoptedAt: string;  // ISO 时间戳
  hexagram: RawHexagram;
}
```

### 4.2 确认 API 返回格式

API 已返回 `adoptedAt` 字段，无需修改后端。

---

## 五、样式设计

### 5.1 使用 CSS 变量

所有颜色使用 `tokens.scss` 中定义的 CSS 变量：

```scss
.collection-page__search {
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.collection-page__tab {
  &--active {
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
}
```

### 5.2 分类标签样式

```scss
.category-tabs {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  overflow-x: auto;
  white-space: nowrap;
  
  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
  
  &__item {
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-lg);
    font-size: 14px;
    transition: all 0.2s ease;
    
    &--active {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
  }
}
```

### 5.3 搜索框样式

```scss
.search-bar {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  margin: var(--spacing-md);
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  
  &__input {
    flex: 1;
    background: transparent;
    border: none;
    font-size: 15px;
    color: var(--color-text);
    
    &::placeholder {
      color: var(--color-text-hint);
    }
  }
  
  &__clear {
    padding: var(--spacing-xs);
    color: var(--color-text-secondary);
  }
}
```

### 5.4 空状态优化

当筛选结果为空时显示友好提示：

```scss
.collection-page__empty-filter {
  padding: var(--spacing-xl);
  text-align: center;
  
  &-icon {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
  }
  
  &-text {
    color: var(--color-text-secondary);
    font-size: 15px;
  }
}
```

---

## 六、交互细节

### 6.1 搜索交互

- 输入时实时过滤（无 debounce，数据量小）
- 清除按钮在输入内容时显示
- 空搜索等同于无筛选

### 6.2 分类切换

- 点击分类标签立即切换
- 动画过渡 0.2s

### 6.3 筛选器

- 出处下拉：单选，默认"全部"
- 排序下拉：三选一，默认"最新"

### 6.4 结果计数

- 在底部显示"共 X 只神兽"
- 筛选后实时更新

---

## 七、小程序兼容性

### 7.1 滚动优化

分类标签横向滚动使用 `scroll-x`：

```tsx
<ScrollView scrollX className="category-tabs">
  ...
</ScrollView>
```

### 7.2 输入框

搜索框使用 Taro 的 `Input` 组件：

```tsx
<Input
  className="search-bar__input"
  placeholder="搜索卦名或神兽"
  value={searchText}
  onInput={e => setSearchText(e.detail.value)}
/>
```

### 7.3 下拉选择

使用 Taro 的 `Picker` 组件：

```tsx
<Picker
  mode="selector"
  range={sourceOptions}
  value={sourceIndex}
  onChange={e => setSelectedSource(sourceOptions[e.detail.value])}
>
  <View className="filter-bar__item">
    出处: {selectedSource || '全部'} ▼
  </View>
</Picker>
```

---

## 八、实现计划

### 阶段 1：数据扩展

1. 为 `hexagrams.json` 添加 `category` 字段
2. 更新 `RawHexagram` 类型定义
3. 运行 `pnpm --filter @yiban/core build`

### 阶段 2：组件开发

1. 创建 `SearchBar` 组件
2. 创建 `CategoryTabs` 组件
3. 创建 `FilterBar` 组件

### 阶段 3：页面集成

1. 扩展 `CollectionContext` 支持 `adoptedAtMap`
2. 修改 `CollectionPage` 添加筛选逻辑
3. 集成新组件

### 阶段 4：测试

1. H5 端测试
2. 小程序端测试
3. 边界情况测试（空收藏、无匹配结果等）

---

## 九、验收标准

- [ ] 搜索功能正常，支持卦名和神兽名
- [ ] 分类切换即时生效
- [ ] 出处筛选正确过滤
- [ ] 排序功能正常
- [ ] 筛选结果计数正确
- [ ] 空状态显示友好提示
- [ ] H5 和小程序端表现一致
- [ ] 使用 CSS 变量适配主题

---

## 十、后续优化（不在本次范围）

- 多选出处筛选
- 收藏分组功能
- 导出收藏列表
- 分享收藏海报
