import { View, Text, Image } from '@tarojs/components';
import './HexagramSymbol.scss';

interface Props {
  symbol: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
}

// 使用神兽名称首字作为图标
export default function HexagramSymbol({ symbol, image, size = 'md' }: Props) {
  const sizeClass = `hexagram-symbol--${size}`;
  const initial = symbol.charAt(0);

  return (
    <View className={`hexagram-symbol ${sizeClass}`}>
      {image ? (
        <Image className="hexagram-symbol__image" src={image} mode="aspectFill" />
      ) : (
        <Text className="hexagram-symbol__text">{initial}</Text>
      )}
    </View>
  );
}
