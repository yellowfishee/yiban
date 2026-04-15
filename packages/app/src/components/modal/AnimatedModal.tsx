import { View } from '@tarojs/components';
import { useState, useEffect, type ReactNode } from 'react';
import './AnimatedModal.scss';

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function AnimatedModal({ visible, onClose, children }: AnimatedModalProps) {
  const [render, setRender] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setRender(true);
      setTimeout(() => setAnimating(true), 10);
    } else if (render) {
      setAnimating(false);
      setTimeout(() => setRender(false), 300);
    }
  }, [visible]);

  if (!render) return null;

  return (
    <View className={`animated-modal ${animating ? 'animated-modal--visible' : ''}`}>
      <View className="animated-modal__mask" onClick={onClose} />
      <View className="animated-modal__content">
        {children}
      </View>
    </View>
  );
}
