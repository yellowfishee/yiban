import { View, Text } from '@tarojs/components';
import { useState, useRef, type ReactNode } from 'react';
import { haptic } from '../../utils/haptic';
import './SwipeableItem.scss';

interface SwipeableItemProps {
  onDelete: () => void;
  children: ReactNode;
}

export default function SwipeableItem({ onDelete, children }: SwipeableItemProps) {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: any) => {
    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: any) => {
    if (!isSwiping.current) return;
    const diff = startX.current - e.touches[0].clientX;
    if (diff > 30 && offsetX === 0) {
      haptic.light();
      setOffsetX(-80);
    } else if (diff < -30 && offsetX < 0) {
      setOffsetX(0);
    }
  };

  const handleTouchEnd = () => {
    isSwiping.current = false;
  };

  const handleDelete = () => {
    haptic.heavy();
    setOffsetX(0);
    onDelete();
  };

  return (
    <View className="swipeable-item">
      <View 
        className="swipeable-item__content"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </View>
      <View className="swipeable-item__action" onClick={handleDelete}>
        <Text className="swipeable-item__action-text">删除</Text>
      </View>
    </View>
  );
}
