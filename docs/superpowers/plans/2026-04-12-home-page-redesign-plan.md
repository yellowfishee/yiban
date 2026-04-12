# 首页全面重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's carousel-flip interaction with an immersive beast display + tab-based scene content layout, add a draw-lot opening animation, and unify the color system.

**Architecture:** The home page is restructured into three states (not-checked-in → draw-lot animation → checked-in). The checked-in state splits into an upper immersive zone (beast image + hexagram info + inspiration text) and a lower tab-content zone (6 agent scenes as horizontal tabs). The InspirationContext is unchanged; all data flows remain the same. Components are simplified: MeihuaDisplay, MysticParticles, RevealText, Disclaimer, and carousel-flip styles are removed; HexagramCard and InspirationDisplay are inlined into the home page; ShareButton gets a color fix.

**Tech Stack:** Taro 3.6 + React 18 + TypeScript + SCSS

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Rewrite | `packages/app/src/pages/home/index.tsx` | New home page with 3 states + tabs |
| Rewrite | `packages/app/src/pages/home/index.scss` | New home page styles |
| Create | `packages/app/src/components/hexagram/DrawLotAnimation.tsx` | Draw-lot animation overlay |
| Create | `packages/app/src/components/hexagram/DrawLotAnimation.scss` | Animation styles |
| Modify | `packages/app/src/components/inspiration/InspirationText.tsx` | Speed up + add skip |
| Modify | `packages/app/src/components/inspiration/InspirationText.scss` | Cursor style update |
| Modify | `packages/app/src/components/share/ShareButton.tsx` | Color: purple → red |
| Modify | `packages/app/src/components/share/ShareButton.scss` | Red gradient styles |
| Delete | `packages/app/src/components/hexagram/MeihuaDisplay.tsx` | Removed per spec |
| Delete | `packages/app/src/components/hexagram/MeihuaDisplay.scss` | Removed per spec |
| Delete | `packages/app/src/components/hexagram/MysticParticles.tsx` | Removed per spec |
| Delete | `packages/app/src/components/hexagram/MysticParticles.scss` | Removed per spec |
| Delete | `packages/app/src/components/inspiration/RevealText.tsx` | Removed per spec |
| Delete | `packages/app/src/components/inspiration/RevealText.scss` | Removed per spec |
| Delete | `packages/app/src/components/ui/Disclaimer.tsx` | Removed per spec |
| Delete | `packages/app/src/components/ui/Disclaimer.scss` | Removed per spec |
| Delete | `packages/app/src/components/agent/AgentContentList.tsx` | Removed per spec |
| Delete | `packages/app/src/components/agent/AgentContentList.scss` | Removed per spec |

---

### Task 1: Delete obsolete components

**Files:**
- Delete: `packages/app/src/components/hexagram/MeihuaDisplay.tsx`
- Delete: `packages/app/src/components/hexagram/MeihuaDisplay.scss`
- Delete: `packages/app/src/components/hexagram/MysticParticles.tsx`
- Delete: `packages/app/src/components/hexagram/MysticParticles.scss`
- Delete: `packages/app/src/components/inspiration/RevealText.tsx`
- Delete: `packages/app/src/components/inspiration/RevealText.scss`
- Delete: `packages/app/src/components/ui/Disclaimer.tsx`
- Delete: `packages/app/src/components/ui/Disclaimer.scss`
- Delete: `packages/app/src/components/agent/AgentContentList.tsx`
- Delete: `packages/app/src/components/agent/AgentContentList.scss`

- [ ] **Step 1: Delete the files**

```bash
cd /Users/mac/github/yiban-web
rm packages/app/src/components/hexagram/MeihuaDisplay.tsx
rm packages/app/src/components/hexagram/MeihuaDisplay.scss
rm packages/app/src/components/hexagram/MysticParticles.tsx
rm packages/app/src/components/hexagram/MysticParticles.scss
rm packages/app/src/components/inspiration/RevealText.tsx
rm packages/app/src/components/inspiration/RevealText.scss
rm packages/app/src/components/ui/Disclaimer.tsx
rm packages/app/src/components/ui/Disclaimer.scss
rm packages/app/src/components/agent/AgentContentList.tsx
rm packages/app/src/components/agent/AgentContentList.scss
```

- [ ] **Step 2: Verify no remaining imports of deleted files**

Run: `grep -r "MeihuaDisplay\|MysticParticles\|RevealText\|Disclaimer\|AgentContentList" packages/app/src/ --include="*.ts" --include="*.tsx" -l`

Expected: No results (only the home page imported MeihuaDisplay, MysticParticles, RevealText; only InspirationDisplay imported Disclaimer; AgentContentList was unused). If any results appear, remove those import lines.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove obsolete components (MeihuaDisplay, MysticParticles, RevealText, Disclaimer, AgentContentList)"
```

---

### Task 2: Update InspirationText (speed up + skip)

**Files:**
- Modify: `packages/app/src/components/inspiration/InspirationText.tsx`
- Modify: `packages/app/src/components/inspiration/InspirationText.scss`

- [ ] **Step 1: Rewrite InspirationText.tsx**

Replace the entire file with:

```tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import './InspirationText.scss';

interface Props {
  text: string;
  speed?: number; // ms per character, default 30
}

export default function InspirationText({ text, speed = 30 }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const skip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayed(text);
    setDone(true);
  }, [text]);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current!);
        setDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed]);

  return (
    <View className="inspiration-text" onClick={!done ? skip : undefined}>
      <Text className="inspiration-text__content">{displayed}</Text>
      {!done && <Text className="inspiration-text__cursor">|</Text>}
    </View>
  );
}
```

- [ ] **Step 2: Update InspirationText.scss**

Replace the entire file with:

```scss
.inspiration-text {
  line-height: 1.8;
  letter-spacing: 0.5px;
  cursor: pointer;

  &__content {
    font-size: 22px;
    color: #1A2B3C;
  }

  &__cursor {
    font-size: 22px;
    color: rgba(199, 62, 58, 0.6);
    animation: pulse 1s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/mac/github/yiban-web/packages/app && pnpm typecheck`

Expected: No errors related to InspirationText.

- [ ] **Step 4: Commit**

```bash
git add packages/app/src/components/inspiration/InspirationText.tsx packages/app/src/components/inspiration/InspirationText.scss
git commit -m "feat: speed up InspirationText typewriter (30ms) and add click-to-skip"
```

---

### Task 3: Fix ShareButton color (purple → red)

**Files:**
- Modify: `packages/app/src/components/share/ShareButton.scss`

- [ ] **Step 1: Update ShareButton.scss**

Replace the `background` line:

```scss
.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #C73E3A 0%, #E64843 100%);
  border-radius: 16px;
  margin: 16px;

  &__text {
    color: #fff;
    font-size: 28px;
    font-weight: 500;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/src/components/share/ShareButton.scss
git commit -m "fix: unify ShareButton color from purple to red-gold palette"
```

---

### Task 4: Create DrawLotAnimation component

**Files:**
- Create: `packages/app/src/components/hexagram/DrawLotAnimation.tsx`
- Create: `packages/app/src/components/hexagram/DrawLotAnimation.scss`

This is a full-screen overlay animation that plays when the user checks in. It shows a lot-stick shaking out of a container, then expanding to reveal the hexagram. It can be skipped by tapping.

- [ ] **Step 1: Create DrawLotAnimation.tsx**

```tsx
import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import './DrawLotAnimation.scss';

interface Props {
  visible: boolean;
  hexagramName?: string;
  onComplete: () => void;
}

type Phase = 'enter' | 'shaking' | 'flying' | 'expanding' | 'done';

const PHASE_DURATIONS: Record<Phase, number> = {
  enter: 300,
  shaking: 700,
  flying: 800,
  expanding: 700,
  done: 0,
};

export default function DrawLotAnimation({ visible, hexagramName, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('enter');

  useEffect(() => {
    if (!visible) return;

    setPhase('enter');

    const t1 = setTimeout(() => setPhase('shaking'), PHASE_DURATIONS.enter);
    const t2 = setTimeout(() => setPhase('flying'), PHASE_DURATIONS.enter + PHASE_DURATIONS.shaking);
    const t3 = setTimeout(() => setPhase('expanding'), PHASE_DURATIONS.enter + PHASE_DURATIONS.shaking + PHASE_DURATIONS.flying);
    const t4 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, PHASE_DURATIONS.enter + PHASE_DURATIONS.shaking + PHASE_DURATIONS.flying + PHASE_DURATIONS.expanding);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [visible, onComplete]);

  // Skip animation on tap
  const handleSkip = () => {
    if (phase !== 'done') {
      setPhase('done');
      onComplete();
    }
  };

  if (!visible || phase === 'done') return null;

  return (
    <View className="draw-lot" onClick={handleSkip}>
      <View className={`draw-lot__container draw-lot__container--${phase}`}>
        {/* 签筒 SVG */}
        <View className="draw-lot__tube">
          <View className="draw-lot__tube-body" />
          <View className="draw-lot__tube-rim" />
          {/* 签 */}
          <View className={`draw-lot__stick draw-lot__stick--${phase}`}>
            <View className="draw-lot__stick-body" />
            <View className="draw-lot__stick-tip" />
          </View>
          {/* 粒子 */}
          {phase === 'shaking' && (
            <View className="draw-lot__particles">
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} className={`draw-lot__particle draw-lot__particle--${i}`} />
              ))}
            </View>
          )}
        </View>
        {/* 展开卡片 */}
        {phase === 'expanding' && (
          <View className="draw-lot__card">
            <Text className="draw-lot__card-name">{hexagramName || '...'}</Text>
          </View>
        )}
      </View>
      <Text className="draw-lot__skip-hint">点击跳过</Text>
    </View>
  );
}
```

- [ ] **Step 2: Create DrawLotAnimation.scss**

```scss
.draw-lot {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 26, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;

  &__container {
    position: relative;
    width: 200px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &--enter {
      animation: bounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  }

  // 签筒
  &__tube {
    position: relative;
    width: 80px;
    height: 120px;
  }

  &__tube-body {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 100px;
    background: linear-gradient(180deg, #8B6914 0%, #6B4F10 100%);
    border-radius: 4px 4px 8px 8px;
    border: 1px solid #D4AF37;
  }

  &__tube-rim {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: 68px;
    height: 12px;
    background: linear-gradient(180deg, #D4AF37 0%, #B8941E 100%);
    border-radius: 4px;
    border: 1px solid #F5DEB3;
  }

  // 签
  &__stick {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;

    &--enter {
      top: 10px;
    }

    &--shaking {
      animation: stickShake 0.15s ease-in-out infinite alternate;
    }

    &--flying {
      animation: stickFlyOut 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    &--expanding {
      opacity: 0;
    }
  }

  &__stick-body {
    width: 6px;
    height: 80px;
    background: linear-gradient(180deg, #F5DEB3 0%, #D4AF37 100%);
    border-radius: 3px;
  }

  &__stick-tip {
    width: 10px;
    height: 10px;
    background: #C73E3A;
    border-radius: 50%;
    margin-top: -2px;
  }

  // 粒子
  &__particles {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
  }

  &__particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #D4AF37;
    border-radius: 50%;
    opacity: 0;

    &--0 { animation: particleDrift 0.5s 0.05s ease-out forwards; }
    &--1 { animation: particleDrift 0.5s 0.1s ease-out forwards; transform: rotate(72deg); }
    &--2 { animation: particleDrift 0.5s 0.15s ease-out forwards; transform: rotate(144deg); }
    &--3 { animation: particleDrift 0.5s 0.2s ease-out forwards; transform: rotate(216deg); }
    &--4 { animation: particleDrift 0.5s 0.25s ease-out forwards; transform: rotate(288deg); }
  }

  // 展开卡片
  &__card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 280px;
    background: linear-gradient(145deg, #FDFCF9 0%, #F5F0E8 100%);
    border-radius: 16px;
    border: 2px solid #D4AF37;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: cardExpand 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  &__card-name {
    font-family: 'STSong', 'SimSun', serif;
    font-size: 48px;
    font-weight: bold;
    color: #C73E3A;
  }

  &__skip-hint {
    position: absolute;
    bottom: 80px;
    font-size: 20px;
    color: rgba(212, 175, 55, 0.5);
  }
}

// Keyframes
@keyframes bounceIn {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes stickShake {
  0% { transform: translateX(-50%) rotate(-5deg); }
  100% { transform: translateX(-50%) rotate(5deg); }
}

@keyframes stickFlyOut {
  0% { transform: translateX(-50%) translateY(0) rotate(0deg); opacity: 1; }
  60% { transform: translateX(-50%) translateY(-120px) rotate(-15deg); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-160px) rotate(-10deg); opacity: 0; }
}

@keyframes particleDrift {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-30px) scale(0); }
}

@keyframes cardExpand {
  0% { opacity: 0; transform: translate(-50%, -50%) scaleX(0.1) scaleY(0.5); }
  50% { opacity: 1; transform: translate(-50%, -50%) scaleX(1.05) scaleY(1); }
  100% { opacity: 1; transform: translate(-50%, -50%) scaleX(1) scaleY(1); }
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/mac/github/yiban-web/packages/app && pnpm typecheck`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/app/src/components/hexagram/DrawLotAnimation.tsx packages/app/src/components/hexagram/DrawLotAnimation.scss
git commit -m "feat: add DrawLotAnimation component for check-in opening ceremony"
```

---

### Task 5: Rewrite home page — structure and state management

**Files:**
- Rewrite: `packages/app/src/pages/home/index.tsx`
- Rewrite: `packages/app/src/pages/home/index.scss`

This is the core task. The home page is rewritten with three states:
1. **Not checked in** — simple welcome + check-in button
2. **Draw-lot animation** — full-screen overlay during check-in
3. **Checked in** — immersive zone + tab-based scene content

- [ ] **Step 1: Rewrite index.tsx**

```tsx
import { View, Text } from '@tarojs/components';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { useEffect, useState, useCallback } from 'react';
import { useInspiration } from '../../context/InspirationContext';
import { useCollection } from '../../context/CollectionContext';
import { useAuth } from '../../context/AuthContext';
import HexagramSymbol from '../../components/hexagram/HexagramSymbol';
import InspirationText from '../../components/inspiration/InspirationText';
import ShareButton from '../../components/share/ShareButton';
import DrawLotAnimation from '../../components/hexagram/DrawLotAnimation';
import { GUA_NAME_MAP } from '@yiban/core';
import type { AgentScene } from '@yiban/core';
import './index.scss';

const SCENES: { key: AgentScene; label: string }[] = [
  { key: 'suitable_for', label: '今日适合' },
  { key: 'advice', label: '处事建议' },
  { key: 'companionship', label: '情绪陪同' },
  { key: 'career', label: '工作发展' },
  { key: 'emotion', label: '情感沟通' },
  { key: 'fortune', label: '财运参考' },
];

const DISCLAIMER_TEXT = '本应用内容基于国学文化视角的灵感启发，仅供娱乐参考，不构成任何决策建议。不预测命运，不提供占卜算命服务。';

export default function HomePage() {
  const {
    currentHexagram,
    inspiration,
    isLoading,
    checkedInToday,
    meihuaResult,
    agentContents,
    agentLoading,
    error,
    loadToday,
    handleCheckIn,
  } = useInspiration();
  const { reload } = useCollection();
  const { isLoggedIn, isLoading: authLoading, loginWithWeapp } = useAuth();
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showDrawLot, setShowDrawLot] = useState(false);
  const [activeScene, setActiveScene] = useState<AgentScene>('suitable_for');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  // Load today's data on mount
  useEffect(() => {
    loadToday();
  }, [loadToday]);

  // WeChat share menu
  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.showShareMenu({ withShareTicket: true });
    }
  }, []);

  useShareAppMessage(() => {
    if (!currentHexagram || !inspiration) {
      return { title: '易伴·卦象神兽', path: '/pages/home/index' };
    }
    return { title: `易伴·${currentHexagram.symbol}今日指引`, path: '/pages/home/index' };
  });

  // Check-in handler
  const onCheckIn = useCallback(async () => {
    setCheckInLoading(true);
    try {
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      // Show draw-lot animation
      setShowDrawLot(true);
      await handleCheckIn();
      await reload();
    } catch (err) {
      console.error('Checkin error:', err);
      setShowDrawLot(false);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setCheckInLoading(false);
    }
  }, [isLoggedIn, loginWithWeapp, handleCheckIn, reload]);

  const onDrawLotComplete = useCallback(() => {
    setShowDrawLot(false);
  }, []);

  // Build meihua summary line
  const meihuaSummary = meihuaResult
    ? `上${GUA_NAME_MAP[meihuaResult.upperGua] || '?'}下${GUA_NAME_MAP[meihuaResult.lowerGua] || '?'} · 动爻${['一','二','三','四','五','六'][meihuaResult.movingLine - 1] || meihuaResult.movingLine}`
    : '';

  // Find current scene content
  const currentSceneContent = agentContents.find((c) => c.scene === activeScene);

  // Loading state
  if ((isLoading || authLoading) && !checkedInToday) {
    return (
      <View className="home-page home-page--loading">
        <View className="home-page__spinner" />
        <Text className="home-page__loading-text">正在遇见神兽...</Text>
      </View>
    );
  }

  // Error state
  if (error && !checkedInToday) {
    return (
      <View className="home-page home-page--error">
        <Text className="home-page__error-text">{error}</Text>
        <View className="home-page__btn home-page__btn--secondary" onClick={loadToday}>
          <Text className="home-page__btn-text--secondary">重试</Text>
        </View>
      </View>
    );
  }

  // Draw-lot animation overlay
  const drawLotOverlay = (
    <DrawLotAnimation
      visible={showDrawLot}
      hexagramName={currentHexagram?.name}
      onComplete={onDrawLotComplete}
    />
  );

  // Not checked in
  if (!checkedInToday) {
    return (
      <View className="home-page">
        <View className="home-page__welcome">
          <Text className="home-page__taiji">☯</Text>
          <Text className="home-page__subtitle">梅花易数起卦</Text>
          <Text className="home-page__desc">以此刻为锚，感而遂通天下之故</Text>
        </View>
        <View
          className="home-page__btn home-page__btn--primary"
          onClick={onCheckIn}
        >
          <Text className="home-page__btn-text">梅花起卦 · 打卡领养</Text>
        </View>
        {drawLotOverlay}
      </View>
    );
  }

  // Checked in — main view
  return (
    <View className="home-page">
      {/* 沉浸区 */}
      <View className="home-page__immersive">
        <View className="home-page__beast-glow">
          <HexagramSymbol symbol={currentHexagram!.symbol} size="lg" />
        </View>
        <Text className="home-page__hexagram-name">{currentHexagram!.name}</Text>
        <Text className="home-page__hexagram-nature">{currentHexagram!.nature}</Text>
        {meihuaSummary && (
          <Text className="home-page__meihua-line">{meihuaSummary}</Text>
        )}
        {inspiration && (
          <>
            <View className="home-page__divider" />
            <InspirationText text={inspiration.text} speed={30} />
          </>
        )}
      </View>

      {/* 标签栏 */}
      <View className="home-page__tabs">
        {SCENES.map((scene) => (
          <View
            key={scene.key}
            className={`home-page__tab ${activeScene === scene.key ? 'home-page__tab--active' : ''}`}
            onClick={() => setActiveScene(scene.key)}
          >
            <Text className="home-page__tab-text">{scene.label}</Text>
          </View>
        ))}
      </View>

      {/* 内容区 */}
      <View className="home-page__content">
        {agentLoading && !currentSceneContent ? (
          <View className="home-page__skeleton">
            <View className="home-page__skeleton-line" style={{ width: '80%' }} />
            <View className="home-page__skeleton-line" style={{ width: '60%' }} />
            <View className="home-page__skeleton-line" style={{ width: '70%' }} />
          </View>
        ) : currentSceneContent ? (
          <View className="home-page__scene">
            <Text className="home-page__scene-label">
              {SCENES.find((s) => s.key === activeScene)?.label}
            </Text>
            <View className="home-page__scene-divider" />
            <Text className="home-page__scene-text">{currentSceneContent.content}</Text>
          </View>
        ) : (
          <View className="home-page__empty-scene">
            <Text className="home-page__empty-scene-text">神兽暂时沉默，请稍后再试</Text>
            <View className="home-page__empty-scene-btn" onClick={() => loadToday()}>
              <Text className="home-page__empty-scene-btn-text">重试</Text>
            </View>
          </View>
        )}
      </View>

      {/* 底部操作区 */}
      <View className="home-page__footer">
        {currentHexagram && inspiration && (
          <ShareButton
            hexagram={currentHexagram}
            mood={inspiration.mood}
            inspirationText={inspiration.text}
          />
        )}
        <View className="home-page__disclaimer" onClick={() => setDisclaimerOpen(!disclaimerOpen)}>
          <Text className="home-page__disclaimer-toggle">
            免责声明 {disclaimerOpen ? '▲' : '▼'}
          </Text>
        </View>
        {disclaimerOpen && (
          <Text className="home-page__disclaimer-text">{DISCLAIMER_TEXT}</Text>
        )}
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Rewrite index.scss**

```scss
/* 首页样式 - 沉浸开签 + 标签卡组 */
$color-primary: #C73E3A;
$color-gold: #D4AF37;
$color-text: #1A2B3C;
$color-text-secondary: rgba(26, 43, 60, 0.6);
$color-text-hint: rgba(26, 43, 60, 0.35);
$color-bg: #F5F0E8;
$color-bg-light: #FDFCF9;

.home-page {
  min-height: 100vh;
  padding: 24px 24px 48px;
  background: linear-gradient(135deg, $color-bg 0%, $color-bg-light 100%);
  display: flex;
  flex-direction: column;
  align-items: center;

  &--loading,
  &--error {
    justify-content: center;
  }

  &__spinner {
    width: 64px;
    height: 64px;
    border: 3px solid rgba($color-text, 0.1);
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__loading-text {
    margin-top: 20px;
    font-size: 24px;
    color: $color-text-hint;
    font-family: 'STSong', 'SimSun', serif;
  }

  &__error-text {
    font-size: 26px;
    color: $color-text;
    margin-bottom: 24px;
    text-align: center;
    padding: 0 32px;
    font-family: 'STSong', 'SimSun', serif;
  }

  // === 未打卡态 ===

  &__welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 25vh;
  }

  &__taiji {
    font-size: 100px;
    opacity: 0.5;
    animation: spin 20s linear infinite;
  }

  &__subtitle {
    font-family: 'STSong', 'SimSun', serif;
    font-size: 32px;
    font-weight: 700;
    color: $color-primary;
    opacity: 0.85;
  }

  &__desc {
    font-size: 20px;
    color: $color-text-secondary;
    text-align: center;
    line-height: 1.6;
  }

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
      background: linear-gradient(135deg, $color-primary 0%, #E64843 100%);
      box-shadow: 0 6px 20px rgba($color-primary, 0.3);
    }

    &--secondary {
      background: transparent;
      border: 1px solid rgba($color-text, 0.1);
    }
  }

  &__btn-text {
    font-size: 28px;
    font-weight: 600;
    color: #fff;
    font-family: 'STSong', 'SimSun', serif;
    letter-spacing: 1px;

    &--secondary {
      font-size: 24px;
      font-weight: 500;
      color: $color-text-secondary;
    }
  }

  // === 已打卡态 — 沉浸区 ===

  &__immersive {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0 24px;
  }

  &__beast-glow {
    position: relative;
    margin-bottom: 16px;
    border-radius: 50%;
    box-shadow: 0 0 40px rgba($color-primary, 0.12), 0 0 80px rgba($color-primary, 0.06);

    .hexagram-symbol {
      border: 2px solid rgba($color-gold, 0.3);
      background-color: rgba(255, 255, 255, 0.6);
    }
  }

  &__hexagram-name {
    font-family: 'STSong', 'SimSun', serif;
    font-size: 36px;
    font-weight: 700;
    color: $color-primary;
  }

  &__hexagram-nature {
    font-size: 20px;
    color: $color-text-secondary;
    margin-top: 4px;
  }

  &__meihua-line {
    font-size: 18px;
    color: $color-text-hint;
    margin-top: 8px;
    font-family: 'STSong', 'SimSun', serif;
  }

  &__divider {
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba($color-gold, 0.3), transparent);
    margin: 20px 0 16px;
  }

  // === 标签栏 ===

  &__tabs {
    display: flex;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 8px;
    gap: 0;
    margin-top: 8px;
    border-bottom: 1px solid rgba($color-text, 0.06);

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
        color: $color-primary;
        font-weight: 600;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 24px;
        height: 3px;
        background: $color-primary;
        border-radius: 2px;
      }
    }
  }

  &__tab-text {
    font-size: 22px;
    color: $color-text-hint;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  // === 内容区 ===

  &__content {
    width: 100%;
    min-height: 200px;
    padding: 20px 8px;
  }

  &__scene {
    display: flex;
    flex-direction: column;
  }

  &__scene-label {
    font-size: 20px;
    color: $color-gold;
    font-weight: 600;
    font-family: 'STSong', 'SimSun', serif;
    letter-spacing: 2px;
  }

  &__scene-divider {
    height: 1px;
    background: rgba($color-gold, 0.3);
    margin: 12px 0 16px;
  }

  &__scene-text {
    font-size: 24px;
    color: $color-text;
    line-height: 1.8;
  }

  // 骨架屏
  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;
  }

  &__skeleton-line {
    height: 20px;
    background: linear-gradient(90deg, rgba($color-gold, 0.08) 25%, rgba($color-gold, 0.15) 50%, rgba($color-gold, 0.08) 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  // 空态
  &__empty-scene {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
    gap: 16px;
  }

  &__empty-scene-text {
    font-size: 22px;
    color: $color-text-hint;
  }

  &__empty-scene-btn {
    padding: 12px 32px;
    border: 1px solid rgba($color-text, 0.1);
    border-radius: 12px;
  }

  &__empty-scene-btn-text {
    font-size: 20px;
    color: $color-text-secondary;
  }

  // === 底部操作区 ===

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
    color: $color-text-hint;
  }

  &__disclaimer-text {
    font-size: 18px;
    color: $color-text-hint;
    line-height: 1.6;
    padding: 12px 16px;
    text-align: center;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 3: Verify typecheck**

Run: `cd /Users/mac/github/yiban-web/packages/app && pnpm typecheck`

Expected: No errors. The home page no longer imports MeihuaDisplay, MysticParticles, RevealText, Disclaimer, HexagramCard, or AgentContentList. It directly imports HexagramSymbol, InspirationText, ShareButton, and the new DrawLotAnimation.

- [ ] **Step 4: Verify build**

Run: `cd /Users/mac/github/yiban-web/packages/app && pnpm build:h5`

Expected: Build succeeds. Open the output in a browser to verify the three states render correctly.

- [ ] **Step 5: Commit**

```bash
git add packages/app/src/pages/home/
git commit -m "feat: rewrite home page with immersive display + tab-based scene content"
```

---

### Task 6: Visual polish and responsive tweaks

**Files:**
- Modify: `packages/app/src/pages/home/index.scss`

- [ ] **Step 1: Add responsive adjustments to index.scss**

Append to the bottom of `index.scss`:

```scss
/* 响应式：小屏手机 */
@media (max-width: 375px) {
  .home-page {
    &__immersive {
      padding: 24px 0 16px;
    }

    &__beast-glow {
      .hexagram-symbol--lg {
        width: 180px;
        height: 180px;
      }
    }

    &__hexagram-name {
      font-size: 32px;
    }

    &__tab {
      padding: 10px 12px;
    }

    &__tab-text {
      font-size: 20px;
    }
  }
}

/* 响应式：大屏/平板 */
@media (min-width: 768px) {
  .home-page {
    max-width: 600px;
    margin: 0 auto;
  }
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/mac/github/yiban-web/packages/app && pnpm build:h5`

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/app/src/pages/home/index.scss
git commit -m "feat: add responsive adjustments for home page"
```

---

### Task 7: Clean up dead code from InspirationContext

The context exposes `showRewardedVideoAd` and `handleAdviceClick` which are unused after the redesign (the old carousel-flip called them). These remain in the context for future paid-advice-flow integration, so we keep them but note they're unused by the home page now. No changes needed — just verification.

- [ ] **Step 1: Verify no broken references**

Run: `grep -r "showRewardedVideoAd\|handleAdviceClick" packages/app/src/ --include="*.ts" --include="*.tsx"`

Expected: Only `InspirationContext.tsx` defines them, and `app.tsx`/other pages don't reference them. If any reference exists in the home page (should have been removed in Task 5), clean it up.

- [ ] **Step 2: Final typecheck**

Run: `cd /Users/mac/github/yiban-web && pnpm --filter @yiban/app typecheck && pnpm --filter @yiban/core typecheck`

Expected: Both pass with no errors.

- [ ] **Step 3: Final build test**

Run: `cd /Users/mac/github/yiban-web/packages/app && pnpm build:h5`

Expected: Build succeeds.

- [ ] **Step 4: Commit (only if changes were needed)**

Only commit if Step 1 required any cleanups. If everything is clean, skip this step.

---

## Self-Review

**1. Spec coverage:**

| Spec section | Task |
|---|---|
| 未打卡态 | Task 5 (index.tsx not-checked-in branch) |
| 开签动画 | Task 4 + Task 5 (DrawLotAnimation + state wiring) |
| 已打卡态·沉浸区 | Task 5 (index.tsx checked-in branch, immersive zone) |
| 已打卡态·标签栏 | Task 5 (index.tsx tabs section) |
| 已打卡态·场景内容区 | Task 5 (index.tsx content section with skeleton/empty states) |
| 底部操作区·分享 | Task 3 (ShareButton color) + Task 5 (footer in index.tsx) |
| 底部操作区·免责声明 | Task 5 (inline disclaimer with toggle) |
| 色彩体系统一 | Task 5 (SCSS variables) + Task 3 (ShareButton) |
| 组件清理 | Task 1 (deletions) |
| InspirationText 优化 | Task 2 |
| 响应式 | Task 6 |

**2. Placeholder scan:** No TBD/TODO/fill-in-later found. All code blocks contain complete implementations.

**3. Type consistency:** `AgentScene` type from `@yiban/core` used consistently. `GUA_NAME_MAP` imported from `@yiban/core` (verified exists in `packages/core/src/constants/gua.ts`). `InspirationText` props updated with optional `speed` param. `DrawLotAnimation` receives `visible`, `hexagramName`, `onComplete` — all used correctly in Task 5.
