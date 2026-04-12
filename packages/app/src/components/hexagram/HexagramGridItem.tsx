import { View, Text } from '@tarojs/components';
import HexagramSymbol from './HexagramSymbol';
import type { RawHexagram } from '@yiban/core';
import './HexagramGridItem.scss';

interface Props {
  hexagram: RawHexagram;
  onClick?: () => void;
}

export default function HexagramGridItem({ hexagram, onClick }: Props) {
  return (
    <View className="hexagram-grid-item" onClick={onClick}>
      <HexagramSymbol symbol={hexagram.symbol} size="md" />
      <Text className="hexagram-grid-item__name">{hexagram.name}</Text>
    </View>
  );
}
