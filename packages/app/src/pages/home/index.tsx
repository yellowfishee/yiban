import { View, Text } from '@tarojs/components';
import Taro, { useShareAppMessage } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useInspiration } from '../../context/InspirationContext';
import { useSettings } from '../../context/SettingsContext';
import { useCollection } from '../../context/CollectionContext';
import { useAuth } from '../../context/AuthContext';
import HexagramCard from '../../components/hexagram/HexagramCard';
import MeihuaDisplay from '../../components/hexagram/MeihuaDisplay';
import MoodSelector from '../../components/inspiration/MoodSelector';
import InspirationDisplay from '../../components/inspiration/InspirationDisplay';
import ShareButton from '../../components/share/ShareButton';

import type { Mood } from '@yiban/core';
import './index.scss';

const SCENES = [
  { key: 'suitable_for', label: '今日适合' },
  { key: 'advice', label: '处事建议' },
  { key: 'companionship', label: '情绪陪同' },
  { key: 'career', label: '工作发展' },
  { key: 'emotion', label: '情感沟通' },
  { key: 'fortune', label: '财运参考' },
];

const MOOD_LABELS: Record<string, string> = {
  work: '工作协作',
  emotion: '情感沟通',
  inspiration: '寻找灵感',
  encouragement: '需要鼓励',
};

export default function HomePage() {
  const {
    currentHexagram,
    selectedMood,
    inspiration,
    isLoading,
    checkedInToday,
    meihuaResult,
    agentContents,
    error,
    loadToday,
    selectMood,
    handleCheckIn,
    resetCheckIn,
    handleAdviceClick,
  } = useInspiration();
  const { devMode } = useSettings();
  const { reload } = useCollection();
  const { isLoggedIn, isLoading: authLoading, loginWithWeapp } = useAuth();
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  // 小程序分享菜单配置
  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.showShareMenu({
        withShareTicket: true,
      });
    }
  }, []);

  // 小程序分享内容配置
  useShareAppMessage(() => {
    if (!currentHexagram || !inspiration) {
      return {
        title: '易伴·卦象神兽',
        path: '/pages/home/index',
      };
    }
    return {
      title: `易伴·${currentHexagram.symbol}今日指引`,
      path: '/pages/home/index',
    };
  });

  // 打卡处理 - 未登录时先登录再打卡
  const onCheckIn = async () => {
    setCheckInLoading(true);
    try {
      // 未登录？先拉起微信登录
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      await handleCheckIn();
      await reload();
    } catch (err) {
      console.error('Checkin error:', err);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setCheckInLoading(false);
    }
  };

  // 加载状态
  if (isLoading || checkInLoading || authLoading) {
    return (
      <View className="home-page home-page--loading">
        <View className="home-page__spinner" />
        <Text className="home-page__loading-text">正在遇见神兽...</Text>
      </View>
    );
  }

  // 错误状态
  if (error) {
    return (
      <View className="home-page home-page--error">
        <Text className="home-page__error-text">{error}</Text>
        <View
          className="home-page__btn home-page__btn--secondary"
          onClick={loadToday}
        >
          <Text className="home-page__btn-text--secondary">重试</Text>
        </View>
      </View>
    );
  }

  // 今日已打卡：展示主卦
  if (checkedInToday && currentHexagram) {
    return (
      <View className="home-page">
        <View className="home-page__header">
          <Text className="home-page__title">今日灵感</Text>
        </View>

        <HexagramCard hexagram={currentHexagram} />

        {selectedMood && (
          <View className="home-page__mood-hint">
            <Text className="home-page__mood-text">
              今日心境：{MOOD_LABELS[selectedMood] || selectedMood}
            </Text>
          </View>
        )}

        <MoodSelector selected={selectedMood} onSelect={selectMood} />

        {inspiration && <InspirationDisplay inspiration={inspiration} />}

        {meihuaResult && (
          <MeihuaDisplay
            upperGua={meihuaResult.upperGua}
            lowerGua={meihuaResult.lowerGua}
            movingLine={meihuaResult.movingLine}
            hasMovingLine={meihuaResult.hasMovingLine}
            mainHexagram={meihuaResult.mainHexagram}
          />
        )}

        {/* 神兽建议 - 6个场景 */}
        <View className="agent-advice-section">
          <Text className="agent-advice-title">神兽今日建议</Text>

          <View className="agent-scenes">
            {SCENES.map((scene) => {
              const content = agentContents.find(c => c.scene === scene.key);
              const isUnlocked = !!content;

              return (
                <View
                  key={scene.key}
                  className={`agent-scene-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => !isUnlocked && handleAdviceClick(scene.key as any)}
                >
                  <Text className="scene-label">{scene.label}</Text>
                  {isUnlocked ? (
                    <Text className="scene-content">{content.content}</Text>
                  ) : (
                    <View className="scene-locked">
                      <Text className="scene-lock-icon">🔒</Text>
                      <Text className="scene-lock-text">点击解锁</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {devMode ? (
          <View
            className="home-page__btn home-page__btn--danger"
            onClick={() => {
              resetCheckIn();
              loadToday();
            }}
          >
            <Text className="home-page__btn-text">再次起卦</Text>
          </View>
        ) : (
          <View className="home-page__tip">
            <Text className="home-page__tip-text">今日已打卡，明日再来遇见新伙伴吧</Text>
          </View>
        )}

        {/* 分享按钮 */}
        {currentHexagram && inspiration && (
          <ShareButton
            hexagram={currentHexagram}
            mood={(selectedMood as Mood) || 'work'}
            inspirationText={inspiration.text}
          />
        )}
      </View>
    );
  }

  // 今日未打卡：初始状态
  return (
    <View className="home-page">
      <View className="home-page__header">
        <Text className="home-page__title">今日灵感</Text>
      </View>

      <View className="home-page__welcome">
        <Text className="home-page__taiji">☯</Text>
        <Text className="home-page__subtitle">梅花易数起卦</Text>
        <Text className="home-page__desc">以此刻为锚，感而遂通天下之故</Text>
      </View>

      <View className="home-page__guide">
        <Text className="home-page__guide-text">
          点击下方按钮，以梅花易数起卦，获得今日专属卦象神兽
        </Text>
      </View>

      <View
        className="home-page__btn home-page__btn--primary"
        onClick={onCheckIn}
      >
        <Text className="home-page__btn-text">梅花起卦 · 打卡领养</Text>
      </View>
    </View>
  );
}
