import { View, Text } from '@tarojs/components';
import './HexagramSymbol.scss';

interface Props {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

// 使用神兽名称首字作为图标
export default function HexagramSymbol({ symbol, size = 'md' }: Props) {
  const sizeClass = `hexagram-symbol--${size}`;
  const initial = symbol.charAt(0);

  return (
    <View className={`hexagram-symbol ${sizeClass}`}>
      <Text className="hexagram-symbol__text">{initial}</Text>
    </View>
  );
}
