import { View, Text, ScrollView } from '@tarojs/components';
import type { BeastCategory } from '@yiban/core';
import './CategoryTabs.scss';

const CATEGORIES: { id: BeastCategory | 'all'; name: string }[] = [
  { id: 'all', name: '全部' },
  { id: '龙类', name: '龙类' },
  { id: '鸟类', name: '鸟类' },
  { id: '兽类', name: '兽类' },
  { id: '龟类', name: '龟类' },
  { id: '神马类', name: '神马类' },
  { id: '其他', name: '其他' },
];

interface CategoryTabsProps {
  active: BeastCategory | 'all';
  onChange: (category: BeastCategory | 'all') => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <ScrollView scrollX className="category-tabs" enhanced showScrollbar={false}>
      <View className="category-tabs__inner">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === active;
          return (
            <View
              key={cat.id}
              className={`category-tabs__item ${isActive ? 'category-tabs__item--active' : ''}`}
              onClick={() => onChange(cat.id)}
            >
              <Text className={`category-tabs__text ${isActive ? 'category-tabs__text--active' : ''}`}>
                {cat.name}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
