import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import './InspirationText.scss';

interface Props {
  text: string;
  speed?: number; // ms per character, default 30
}

export default function InspirationText({ text, speed = 30 }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const skip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayed(text);
    setDone(true);
  }, [text]);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current!);
        setDone(true);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed]);

  return (
    <View className="inspiration-text" onClick={!done ? skip : undefined}>
      <Text className="inspiration-text__content">{displayed}</Text>
      {!done && <Text className="inspiration-text__cursor">|</Text>}
    </View>
  );
}
