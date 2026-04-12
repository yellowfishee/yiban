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

    // Reduced motion: skip animation entirely
    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setPhase('done');
      onComplete();
      return;
    }

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
