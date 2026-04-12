import { View, Text, ScrollView } from '@tarojs/components';
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

const MOVING_LINE_NAMES = ['一', '二', '三', '四', '五', '六'];

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
  const [showDrawLot, setShowDrawLot] = useState(false);
  const [activeScene, setActiveScene] = useState<AgentScene>('suitable_for');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

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

  const onCheckIn = useCallback(async () => {
    try {
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      setShowDrawLot(true);
      await handleCheckIn();
      await reload();
    } catch (err) {
      console.error('Checkin error:', err);
      setShowDrawLot(false);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  }, [isLoggedIn, loginWithWeapp, handleCheckIn, reload]);

  const onDrawLotComplete = useCallback(() => {
    setShowDrawLot(false);
  }, []);

  const meihuaSummary = meihuaResult
    ? `上${GUA_NAME_MAP[meihuaResult.upperGua] || '?'}下${GUA_NAME_MAP[meihuaResult.lowerGua] || '?'} · 动爻${MOVING_LINE_NAMES[meihuaResult.movingLine - 1] || meihuaResult.movingLine}`
    : '';

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
        <Text className="home-page__app-name">易伴</Text>
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
      <ScrollView className="home-page__tabs" scrollX enableFlex>
        {SCENES.map((scene) => (
          <View
            key={scene.key}
            className={`home-page__tab ${activeScene === scene.key ? 'home-page__tab--active' : ''}`}
            onClick={() => setActiveScene(scene.key)}
          >
            <Text className="home-page__tab-text">{scene.label}</Text>
          </View>
        ))}
      </ScrollView>

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
