import { useEffect, useRef, useState } from 'react';
import { View, Text } from '@tarojs/components';
import './InspirationText.scss';

interface Props {
  text: string;
}

export default function InspirationText({ text }: Props) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <View className="inspiration-text">
      <Text className="inspiration-text__content">{displayed}</Text>
      <Text className="inspiration-text__cursor">|</Text>
    </View>
  );
}
