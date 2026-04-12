import { View, Text } from '@tarojs/components';
import type { Inspiration } from '@yiban/core';
import InspirationText from './InspirationText';
import './InspirationDisplay.scss';

interface Props {
  inspiration: Inspiration;
}

export default function InspirationDisplay({ inspiration }: Props) {
  return (
    <View className="inspiration-display">
      <Text className="inspiration-display__title">灵感絮语</Text>
      <InspirationText text={inspiration.text} />
    </View>
  );
}
