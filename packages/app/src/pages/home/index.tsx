import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useInspiration } from '../../context/InspirationContext';
import { useCollection } from '../../context/CollectionContext';
import { useAuth } from '../../context/AuthContext';
import HexagramSymbol from '../../components/hexagram/HexagramSymbol';
import InspirationText from '../../components/inspiration/InspirationText';
import ShareButton from '../../components/share/ShareButton';
import DrawLotAnimation from '../../components/hexagram/DrawLotAnimation';
import { AgreementModal } from '../../components/agreement';
import Skeleton from '../../components/skeleton/Skeleton';
import AnimatedModal from '../../components/modal/AnimatedModal';
import { haptic } from '../../utils/haptic';
import { storage, STORAGE_KEYS } from '../../adapters/storage';
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
    generatingScene,
    currentCheckinId,
    error,
    loadToday,
    handleCheckIn,
    generateAgentContent,
  } = useInspiration();
  const { reload } = useCollection();
  const { isLoggedIn, isLoading: authLoading, loginWithWeapp, hasProfile } = useAuth();
  const [showDrawLot, setShowDrawLot] = useState(false);
  const [activeScene, setActiveScene] = useState<AgentScene>('suitable_for');
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !hasProfile)) {
      Taro.redirectTo({ url: '/pages/authorize/index' });
    }
  }, [authLoading, isLoggedIn, hasProfile]);

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

  const checkAgreement = useCallback((): boolean => {
    const agreement = storage.get<{ accepted: boolean }>(STORAGE_KEYS.AGREEMENT_ACCEPTED);
    return agreement?.accepted === true;
  }, []);

  const handleAgreementConfirm = useCallback(() => {
    storage.set(STORAGE_KEYS.AGREEMENT_ACCEPTED, {
      accepted: true,
      acceptedAt: new Date().toISOString(),
    });
    setShowAgreementModal(false);
  }, []);

  const onCheckIn = useCallback(async () => {
    if (!checkAgreement()) {
      setShowAgreementModal(true);
      return;
    }

    haptic.medium();

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
  }, [isLoggedIn, loginWithWeapp, handleCheckIn, reload, checkAgreement]);

  const onDrawLotComplete = useCallback(() => {
    setShowDrawLot(false);
  }, []);

  const handleSceneChange = useCallback((scene: AgentScene) => {
    haptic.light();
    setActiveScene(scene);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadToday();
    setRefreshing(false);
  }, [loadToday]);

  const handleBeastTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setShowDetailModal(true);
    }
    lastTapRef.current = now;
  }, []);

  // Tab 切换时按需加载：如果当前场景没有内容且不在生成中，触发请求
  useEffect(() => {
    if (!checkedInToday || !currentCheckinId) return;
    const hasContent = agentContents.some((c) => c.scene === activeScene && c.content);
    const isGenerating = generatingScene === activeScene;
    if (!hasContent && !isGenerating) {
      generateAgentContent(currentCheckinId, activeScene);
    }
  }, [activeScene, checkedInToday, currentCheckinId, agentContents, generatingScene, generateAgentContent]);

  const meihuaSummary = meihuaResult
    ? `上${GUA_NAME_MAP[meihuaResult.upperGua] || '?'}下${GUA_NAME_MAP[meihuaResult.lowerGua] || '?'} · 动爻${MOVING_LINE_NAMES[meihuaResult.movingLine - 1] || meihuaResult.movingLine}`
    : '';

  const currentSceneContent = agentContents.find((c) => c.scene === activeScene);

  // Loading state
  if ((isLoading || authLoading) && !checkedInToday) {
    return (
      <View className="home-page home-page--loading">
        <View className="home-page__skeleton">
          <Skeleton width="180px" height="180px" circle className="home-page__skeleton-icon" />
          <Skeleton width="120px" height="36px" className="home-page__skeleton-name" />
          <Skeleton width="200px" height="24px" className="home-page__skeleton-nature" />
          <View className="home-page__skeleton-lines">
            <Skeleton width="80%" height="20px" />
            <Skeleton width="70%" height="20px" />
            <Skeleton width="60%" height="20px" />
          </View>
        </View>
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
        <AgreementModal
          visible={showAgreementModal}
          onConfirm={handleAgreementConfirm}
        />
      </View>
    );
  }

  // Checked in — main view
  return (
    <ScrollView
      className="home-page"
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      {/* 沉浸区 */}
      <View className="home-page__immersive">
        <View className="home-page__beast-glow" onClick={handleBeastTap}>
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
            onClick={() => handleSceneChange(scene.key)}
          >
            <Text className="home-page__tab-text">{scene.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 内容区 */}
      <View className="home-page__content">
        {(generatingScene === activeScene && !currentSceneContent) ? (
          <View className="home-page__loading">
            <View className="home-page__loading-beast">
              <Text className="home-page__loading-symbol">{currentHexagram?.symbol || '☯'}</Text>
              <View className="home-page__loading-ring" />
            </View>
            <Text className="home-page__loading-text">神兽正在为你解读卦象...</Text>
            <View className="home-page__loading-dots">
              <View className="home-page__loading-dot" />
              <View className="home-page__loading-dot" />
              <View className="home-page__loading-dot" />
            </View>
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
            <Text className="home-page__empty-scene-text">神兽正在思考，请稍候...</Text>
            {currentCheckinId && (
              <View className="home-page__empty-scene-btn" onClick={() => generateAgentContent(currentCheckinId, activeScene)}>
                <Text className="home-page__empty-scene-btn-text">请求神兽</Text>
              </View>
            )}
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

      {/* Detail modal */}
      <AnimatedModal visible={showDetailModal} onClose={() => setShowDetailModal(false)}>
        <View className="home-page__detail-modal">
          <Text className="home-page__detail-symbol">{currentHexagram?.symbol}</Text>
          <Text className="home-page__detail-name">{currentHexagram?.name}</Text>
          <Text className="home-page__detail-nature">{currentHexagram?.nature}</Text>
          {meihuaSummary && (
            <Text className="home-page__detail-meihua">{meihuaSummary}</Text>
          )}
          <View className="home-page__detail-close" onClick={() => setShowDetailModal(false)}>
            <Text className="home-page__detail-close-text">关闭</Text>
          </View>
        </View>
      </AnimatedModal>
    </ScrollView>
  );
}
