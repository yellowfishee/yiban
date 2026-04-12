import { View, Text } from '@tarojs/components';
import HexagramSymbol from './HexagramSymbol';
import type { RawHexagram } from '@yiban/core';
import './HexagramCard.scss';

interface Props {
  hexagram: RawHexagram;
}

export default function HexagramCard({ hexagram }: Props) {
  return (
    <View className="hexagram-card">
      {/* 背景纹理 */}
      <View className="hexagram-card__bg" />

      {/* 云纹装饰 - 使用文字代替SVG */}
      <Text className="hexagram-card__cloud">☁</Text>

      {/* 神兽图标 */}
      <View className="hexagram-card__icon">
        <HexagramSymbol symbol={hexagram.symbol} size="lg" />
      </View>

      {/* 名称 */}
      <View className="hexagram-card__info">
        <Text className="hexagram-card__name">{hexagram.name}</Text>
        <Text className="hexagram-card__symbol">{hexagram.symbol}</Text>
      </View>
    </View>
  );
}
