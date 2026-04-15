# 梅花易数每日打卡实施方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将梅花易数起卦接入每日打卡流程，打卡时间戳作为种子计算主卦，打卡即领养，有动爻时展示变卦/互卦作为参考。

**Architecture:** 起卦算法封装为纯函数 `src/utils/meihua.ts`，InspirationContext 新增 check-in 状态管理，HomePage 根据已打卡/未打卡状态分别渲染，MeihuaDisplay 组件展示起卦过程。

**Tech Stack:** 纯 TypeScript + React，无新依赖。

---

## 文件结构

```
新建:
  src/utils/meihua.ts                    # 梅花起卦算法
  src/components/hexagram/MeihuaDisplay.tsx  # 起卦过程展示组件

修改:
  src/types/hexagram.ts                  # 新增 MeihuaResult 类型
  src/utils/storage.ts                    # 新增 STORAGE_KEYS
  src/context/InspirationContext.tsx      # 集成打卡逻辑
  src/pages/HomePage.tsx                  # 打卡 UI 改造
```

---

## Task 1: 梅花起卦算法

**Files:**
- Create: `src/utils/meihua.ts`

- [ ] **Step 1: 创建 `src/utils/meihua.ts`**

```typescript
/**
 * 梅花易数起卦算法
 * 以时间戳末两位 × 三位随机小数，取积的小数部分×1000前三位为种子
 */

// 八卦基础数组（按 0-7 顺序对应余数）
const GUA_MAP = ['qian', 'kun', 'zhun', 'meng', 'xu', 'song', 'shi', 'bi'] as const;
type GuaIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * 梅花易数起卦
 * @param timestamp 打卡时间戳（毫秒）
 * @returns { upperGua, lowerGua, movingLine, seed }
 */
export function meihuaDivination(timestamp: number): {
  upperGua: GuaIndex;
  lowerGua: GuaIndex;
  movingLine: number; // 1-6
  seed: number;
} {
  // 1. 取时间戳末两位
  const lastTwo = Number(String(timestamp).slice(-2));

  // 2. 生成随机三位小数 [0.000, 0.999]
  const randomThree = Math.random();

  // 3. 乘积
  const product = lastTwo * randomThree;

  // 4. 取小数部分 × 1000，取前三位（不足三位补齐）
  const decimalPart = product - Math.floor(product);
  const seed = Math.floor(decimalPart * 1000) % 1000;

  // 上卦：种子 % 8
  const upperGua = (seed % 8) as GuaIndex;

  // 下卦：(种子 + 年份%8) % 8
  const year = new Date().getFullYear();
  const lowerGua = ((seed + year % 8) % 8) as GuaIndex;

  // 动爻：种子 % 6 + 1（结果 1-6）
  const movingLine = (seed % 6) + 1;

  return { upperGua, lowerGua, movingLine, seed };
}

/**
 * 根据上卦+下卦索引获取卦象 ID
 */
export function getGuaId(upperGua: number, lowerGua: number): string {
  return GUA_MAP[upperGua] + '_' + GUA_MAP[lowerGua];
}

/**
 * 获取单个卦的 ID（0-7 → qian/kun/zhun/meng/xu/song/shi/bi）
 */
export function getSingleGuaId(index: number): string {
  return GUA_MAP[index % 8];
}

/**
 * 获取上/下卦名称（中文）
 */
export const GUA_NAMES: Record<number, string> = {
  0: '乾', 1: '坤', 2: '屯', 3: '蒙',
  4: '需', 5: '讼', 6: '师', 7: '比',
};
```

- [ ] **Step 2: 验证算法输出可预测**

```typescript
// 临时测试：在 meihua.ts 底部加
console.log('seed test:', meihuaDivination(1745302471832));
// 期望：根据随机数不同，每次 seed 在 0-999 之间
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 58 modules transformed, 零 error

---

## Task 2: 类型扩展

**Files:**
- Modify: `src/types/hexagram.ts`

- [ ] **Step 1: 新增 `MeihuaResult` 接口到 `src/types/hexagram.ts`**

在文件末尾追加：

```typescript
export interface MeihuaResult {
  mainHexagramId: string;
  upperGua: number;      // 0-7
  lowerGua: number;      // 0-7
  movingLine: number;     // 1-6
  hasMovingLine: boolean;
  mainHexagram: Hexagram;
  bianHexagramId?: string;   // 变卦 ID
  huHexagramId?: string;     // 互卦 ID
}
```

---

## Task 3: Storage Keys 扩展

**Files:**
- Modify: `src/utils/storage.ts`

- [ ] **Step 1: 在 `STORAGE_KEYS` 对象末尾追加新字段**

```typescript
CHECKIN_TIMESTAMP: 'yiban_checkin_timestamp',
MAIN_HEXAGRAM_ID: 'yiban_main_hexagram_id',
HAS_MOVING_LINE: 'yiban_has_moving_line',
MOVING_LINE: 'yiban_moving_line',
BIAN_HEXAGRAM_ID: 'yiban_bian_hexagram_id',
HU_HEXAGRAM_ID: 'yiban_hu_hexagram_id',
```

---

## Task 4: MeihuaDisplay 组件

**Files:**
- Create: `src/components/hexagram/MeihuaDisplay.tsx`

- [ ] **Step 1: 创建 `src/components/hexagram/MeihuaDisplay.tsx`**

```typescript
import type { Hexagram } from '../../types/hexagram';
import { GUA_NAMES } from '../../utils/meihua';
import HexagramSymbol from './HexagramSymbol';

interface Props {
  upperGua: number;
  lowerGua: number;
  movingLine: number;
  hasMovingLine: boolean;
  mainHexagram: Hexagram;
  bianHexagram?: Hexagram;
  huHexagram?: Hexagram;
}

export default function MeihuaDisplay({
  upperGua,
  lowerGua,
  movingLine,
  hasMovingLine,
  mainHexagram,
  bianHexagram,
  huHexagram,
}: Props) {
  return (
    <div className="flex flex-col gap-3 animate-fade-in-up">
      {/* 起卦过程 */}
      <div className="bg-white/60 rounded-xl p-3 text-center border border-primary/5">
        <p className="text-xs text-primary/50 mb-2">起卦过程</p>
        <div className="flex items-center justify-center gap-2 text-sm text-primary/70">
          <span>上卦：{GUA_NAMES[upperGua]}</span>
          <span className="text-primary/30">|</span>
          <span>下卦：{GUA_NAMES[lowerGua]}</span>
          {hasMovingLine && (
            <>
              <span className="text-primary/30">|</span>
              <span className="text-accent">动爻：第{movingLine}爻</span>
            </>
          )}
        </div>
      </div>

      {/* 变卦/互卦参考 */}
      {hasMovingLine && (bianHexagram || huHexagram) && (
        <div className="flex gap-3">
          {huHexagram && (
            <div className="flex-1 bg-white/40 rounded-xl p-3 flex flex-col items-center gap-2 border border-primary/5 opacity-70">
              <p className="text-xs text-primary/50">互卦参考</p>
              <HexagramSymbol symbol={huHexagram.symbol} hexagramId={huHexagram.id} size="sm" />
              <p className="text-xs text-primary/60 font-medium">{huHexagram.name}</p>
              <p className="text-xs text-primary/40">{huHexagram.nature}</p>
            </div>
          )}
          {bianHexagram && (
            <div className="flex-1 bg-white/40 rounded-xl p-3 flex flex-col items-center gap-2 border border-primary/5 opacity-70">
              <p className="text-xs text-primary/50">变卦参考</p>
              <HexagramSymbol symbol={bianHexagram.symbol} hexagramId={bianHexagram.id} size="sm" />
              <p className="text-xs text-primary/60 font-medium">{bianHexagram.name}</p>
              <p className="text-xs text-primary/40">{bianHexagram.nature}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 零 error，meihuaDisplay 正常编译

---

## Task 5: InspirationContext 集成

**Files:**
- Modify: `src/context/InspirationContext.tsx`

- [ ] **Step 1: 更新 state 类型**

在 `InspirationState` 中新增：
```typescript
interface InspirationState {
  // ... 现有字段
  checkedInToday: boolean;    // 今日是否已打卡
  meihuaResult: MeihuaResult | null;  // 起卦结果
}
```

- [ ] **Step 2: 更新 Action 类型**

```typescript
type InspirationAction =
  | { type: 'LOAD'; payload: { currentHexagram: Hexagram; inspiration: Inspiration; meihuaResult: MeihuaResult } }
  | { type: 'SELECT_MOOD'; payload: { mood: Mood; inspiration: Inspiration } }
  | { type: 'ADOPT_SUCCESS' }
  | { type: 'SET_LOADING'; payload: boolean };
```

- [ ] **Step 3: 更新 reducer 的 LOAD case**

```typescript
case 'LOAD':
  return {
    ...state,
    currentHexagram: action.payload.currentHexagram,
    inspiration: action.payload.inspiration,
    alreadyAdoptedToday: false,
    checkedInToday: true,        // 加载即说明已打卡
    meihuaResult: action.payload.meihuaResult,
    isLoading: false,
  };
```

- [ ] **Step 4: 更新 loadToday 逻辑**

```typescript
const loadToday = useCallback(async () => {
  dispatch({ type: 'SET_LOADING', payload: true });

  const savedDate = getItem(STORAGE_KEYS.TODAY_DATE);
  const today = getToday();

  if (savedDate && isToday(savedDate)) {
    // 今日已打卡：恢复缓存
    const savedMainId = getJSON<string | null>(STORAGE_KEYS.MAIN_HEXAGRAM_ID, null);
    if (savedMainId) {
      const hexagram = await getHexagramById(savedMainId);
      if (hexagram) {
        const mood: Mood = 'work';
        const inspiration = await createInspiration(hexagram, mood);
        const meihuaResult: MeihuaResult = {
          mainHexagramId: hexagram.id,
          upperGua: 0, lowerGua: 0, movingLine: 1, hasMovingLine: false,
          mainHexagram: hexagram,
        };
        dispatch({ type: 'LOAD', payload: { currentHexagram: hexagram, inspiration, meihuaResult } });
        const collection = getJSON<{ hexagramId: string; adoptedAt: string }[]>(STORAGE_KEYS.COLLECTION, []);
        const alreadyAdopted = collection.some((item) => item.hexagramId === hexagram.id && isToday(item.adoptedAt));
        if (alreadyAdopted) dispatch({ type: 'ADOPT_SUCCESS' });
        return;
      }
    }
  }

  // 今日未打卡：梅花起卦
  const ts = Date.now();
  const { upperGua, lowerGua, movingLine } = meihuaDivination(ts);
  const hasMovingLine = movingLine > 0;
  const mainId = getSingleGuaId(upperGua) + '_' + getSingleGuaId(lowerGua);
  const mainHexagram = await getHexagramById(mainId) ?? await getRandomHexagram();

  const mood: Mood = 'work';
  const inspiration = await createInspiration(mainHexagram, mood);
  const meihuaResult: MeihuaResult = {
    mainHexagramId: mainHexagram.id,
    upperGua, lowerGua, movingLine, hasMovingLine,
    mainHexagram,
  };

  dispatch({ type: 'LOAD', payload: { currentHexagram: mainHexagram, inspiration, meihuaResult } });
}, []);
```

- [ ] **Step 5: 更新 ContextValue 接口**

```typescript
interface InspirationContextValue extends InspirationState {
  loadToday: () => Promise<void>;
  selectMood: (mood: Mood) => Promise<void>;
  adopt: () => Promise<void>;
  checkIn: (meihuaResult: MeihuaResult) => Promise<void>;  // 新增
}
```

- [ ] **Step 6: 实现 checkIn 函数**

```typescript
const checkIn = useCallback(async (result: MeihuaResult) => {
  const today = getToday();
  setItem(STORAGE_KEYS.TODAY_DATE, today);
  setItem(STORAGE_KEYS.TODAY_HEXAGRAM, result.mainHexagram.id);
  setJSON(STORAGE_KEYS.MAIN_HEXAGRAM_ID, result.mainHexagramId);
  setItem(STORAGE_KEYS.CHECKIN_TIMESTAMP, String(Date.now()));
  setItem(STORAGE_KEYS.HAS_MOVING_LINE, String(result.hasMovingLine));
  setItem(STORAGE_KEYS.MOVING_LINE, String(result.movingLine));

  // 打卡即领养
  const collection = getJSON<{ hexagramId: string; adoptedAt: string }[]>(STORAGE_KEYS.COLLECTION, []);
  collection.push({ hexagramId: result.mainHexagramId, adoptedAt: today });
  setJSON(STORAGE_KEYS.COLLECTION, collection);

  dispatch({ type: 'ADOPT_SUCCESS' });
}, []);
```

- [ ] **Step 7: 构建验证**

Run: `npm run build`
Expected: 零 error

---

## Task 6: HomePage 打卡 UI

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: 重写 HomePage，区分已打卡/未打卡状态**

```typescript
import { useEffect, useState } from 'react';
import { useInspiration } from '../context/InspirationContext';
import { useCollection } from '../context/CollectionContext';
import HexagramCard from '../components/hexagram/HexagramCard';
import MoodSelector from '../components/inspiration/MoodSelector';
import InspirationDisplay from '../components/inspiration/InspirationDisplay';
import MeihuaDisplay from '../components/hexagram/MeihuaDisplay';
import { meihuaDivination, getSingleGuaId, getHexagramById } from '../utils/meihua';
import type { MeihuaResult } from '../types/hexagram';

export default function HomePage() {
  const { currentHexagram, selectedMood, inspiration, alreadyAdoptedToday, isLoading, loadToday, selectMood, checkIn } = useInspiration();
  const { reload } = useCollection();
  const [pendingResult, setPendingResult] = useState<MeihuaResult | null>(null);
  const [showMeihua, setShowMeihua] = useState(false);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  // 未打卡：点击"打卡领养"触发起卦
  const handleCheckIn = async () => {
    const ts = Date.now();
    const { upperGua, lowerGua, movingLine } = meihuaDivination(ts);
    const hasMovingLine = movingLine > 0;
    const mainId = getSingleGuaId(upperGua) + '_' + getSingleGuaId(lowerGua);
    const mainHex = await getHexagramById(mainId);
    if (!mainHex) return;

    const result: MeihuaResult = {
      mainHexagramId: mainHex.id,
      upperGua, lowerGua, movingLine, hasMovingLine,
      mainHexagram: mainHex,
    };
    setPendingResult(result);
    setShowMeihua(true);
  };

  // 确认打卡
  const handleConfirmCheckIn = async () => {
    if (!pendingResult) return;
    await checkIn(pendingResult);
    await reload();
    setShowMeihua(false);
    setPendingResult(null);
  };

  if (isLoading || !currentHexagram) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">正在遇见神兽...</div>
      </div>
    );
  }

  // 已打卡：直接展示今日卦象
  if (alreadyAdoptedToday && !showMeihua) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-primary">今日灵感</h1>
        </div>
        <HexagramCard hexagram={currentHexagram} />
        <MoodSelector selected={selectedMood} onSelect={selectMood} />
        {inspiration && <InspirationDisplay inspiration={inspiration} />}
        <p className="text-center text-sm text-gray-400 py-3">
          今日已打卡，明日再来遇见新伙伴吧
        </p>
      </div>
    );
  }

  // 打卡流程：展示起卦结果 → 确认领养
  const displayHex = pendingResult?.mainHexagram ?? currentHexagram;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold text-primary">今日灵感</h1>
      </div>

      <HexagramCard hexagram={displayHex} />

      {pendingResult && (
        <MeihuaDisplay
          upperGua={pendingResult.upperGua}
          lowerGua={pendingResult.lowerGua}
          movingLine={pendingResult.movingLine}
          hasMovingLine={pendingResult.hasMovingLine}
          mainHexagram={pendingResult.mainHexagram}
        />
      )}

      {pendingResult ? (
        <button
          onClick={handleConfirmCheckIn}
          className="w-full py-3 bg-accent text-white rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
        >
          确认打卡领养
        </button>
      ) : (
        <button
          onClick={handleCheckIn}
          className="w-full py-3 bg-accent text-white rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
        >
          打卡领养今日神兽
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 零 error

---

## Task 7: 收尾

- [ ] **Step 1: 全量构建**

Run: `npm run build`
Expected: ✓ 58 modules transformed, 零 error

- [ ] **Step 2: 提交**

```bash
git add -A
git commit -m "feat: 梅花易数每日打卡，打卡即领养，有动爻时展示变卦互卦参考"
```
