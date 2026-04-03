/**
 * AI 神兽建议卡片
 */
import { View, Text } from '@tarojs/components';
import type { AgentScene } from '@yiban/core';
import './AgentCard.scss';

interface AgentCardProps {
  scene: AgentScene;
  content: string;
  beastName: string;
  cached?: boolean;
}

const SCENE_LABELS: Record<AgentScene, { title: string; icon: string }> = {
  suitable_for: { title: '今日适合', icon: '☀️' },
  advice: { title: '处事建议', icon: '💡' },
  companionship: { title: '情绪陪同', icon: '🤗' },
  career: { title: '工作发展', icon: '📈' },
  emotion: { title: '情感沟通', icon: '💕' },
  fortune: { title: '财运参考', icon: '💰' },
};

export default function AgentCard({ scene, content, beastName, cached }: AgentCardProps) {
  const { title, icon } = SCENE_LABELS[scene];

  return (
    <View className="agent-card">
      <View className="agent-card__header">
        <Text className="agent-card__icon">{icon}</Text>
        <Text className="agent-card__title">{title}</Text>
        {cached && <Text className="agent-card__cached">缓存</Text>}
      </View>
      <View className="agent-card__content">
        <Text className="agent-card__text">{content}</Text>
      </View>
      <View className="agent-card__footer">
        <Text className="agent-card__beast">—— {beastName}</Text>
      </View>
    </View>
  );
}
