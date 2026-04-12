import { View, Text } from '@tarojs/components';
import type { Mood } from '@yiban/core';
import './MoodSelector.scss';

const MOOD_LABELS: Record<Mood, string> = {
  work: '工作协作',
  emotion: '情感沟通',
  inspiration: '寻找灵感',
  encouragement: '需要鼓励',
};

const MOODS: Mood[] = ['work', 'emotion', 'inspiration', 'encouragement'];

interface Props {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
}

export default function MoodSelector({ selected, onSelect }: Props) {
  return (
    <View className="mood-selector">
      <Text className="mood-selector__title">今日心境</Text>
      <View className="mood-selector__list">
        {MOODS.map((mood) => {
          const isSelected = mood === selected;
          return (
            <View
              key={mood}
              className={`mood-selector__item ${isSelected ? 'mood-selector__item--active' : ''}`}
              onClick={() => onSelect(mood)}
            >
              <Text className={`mood-selector__text ${isSelected ? 'mood-selector__text--active' : ''}`}>
                {MOOD_LABELS[mood]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
