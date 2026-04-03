/**
 * 分享按钮组件
 * 支持小程序和 H5 分享
 */
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import type { RawHexagram, Mood } from '@yiban/core';
import './ShareButton.scss';

interface Props {
  hexagram: RawHexagram;
  mood: Mood;
  inspirationText: string;
}

const MOOD_LABELS: Record<Mood, string> = {
  work: '工作协作',
  emotion: '情感沟通',
  inspiration: '寻找灵感',
  encouragement: '需要鼓励',
};

export default function ShareButton({ hexagram, mood, inspirationText }: Props) {
  const [copying, setCopying] = useState(false);

  const shareTitle = `易伴·${hexagram.symbol}今日指引`;
  const shareDesc = `${MOOD_LABELS[mood]}：${inspirationText}`;
  const shareUrl = `${process.env.TARO_ENV === 'weapp' ? '' : 'https://yiban.example.com'}/?from=share`;

  const handleShare = async () => {
    // H5 Web Share API
    if (process.env.TARO_ENV !== 'weapp' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDesc,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // 降级：复制链接
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareDesc}\n${shareUrl}`);
      Taro.showToast({ title: '已复制分享内容', icon: 'success' });
    } catch (err) {
      Taro.showToast({ title: '复制失败', icon: 'none' });
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  };

  // 小程序环境不渲染此按钮（使用原生分享菜单）
  if (process.env.TARO_ENV === 'weapp') {
    return null;
  }

  return (
    <View className="share-button" onClick={handleShare}>
      <Text className="share-button__text">{copying ? '已复制' : '分享给好友'}</Text>
    </View>
  );
}
