import { View, Text, Image } from '@tarojs/components';
import './HexagramGridItem.scss';

interface Props {
  hexagram: { id: string; name: string; symbol: string; image?: string };
  onClick?: () => void;
  onLongPress?: () => void;
}

export default function HexagramGridItem({ hexagram, onClick, onLongPress }: Props) {
  return (
    <View className="hexagram-grid-item" onClick={onClick} onLongPress={onLongPress}>
      {hexagram.image ? (
        <Image className="hexagram-grid-item__image" src={hexagram.image} mode="aspectFill" />
      ) : (
        <View className="hexagram-grid-item__symbol">
          <Text className="hexagram-grid-item__symbol-text">{hexagram.symbol.charAt(0)}</Text>
        </View>
      )}
      <Text className="hexagram-grid-item__name">{hexagram.name}</Text>
    </View>
  );
}
