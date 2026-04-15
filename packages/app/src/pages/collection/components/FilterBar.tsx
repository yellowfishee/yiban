import { View, Text, Picker } from '@tarojs/components';
import './FilterBar.scss';

const SORT_OPTIONS = [
  { value: 'newest', label: '最新收藏' },
  { value: 'oldest', label: '最早收藏' },
  { value: 'name', label: '名称排序' },
];

interface FilterBarProps {
  sources: string[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
  sortBy: 'newest' | 'oldest' | 'name';
  onSortChange: (sort: 'newest' | 'oldest' | 'name') => void;
}

export default function FilterBar({
  sources,
  selectedSource,
  onSourceChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  const sourceOptions = ['全部出处', ...sources];
  const sourceIndex = selectedSource ? sourceOptions.indexOf(selectedSource) : 0;
  const sortIndex = SORT_OPTIONS.findIndex((s) => s.value === sortBy);

  return (
    <View className="filter-bar">
      <Picker
        mode="selector"
        range={sourceOptions}
        value={sourceIndex >= 0 ? sourceIndex : 0}
        onChange={(e) => {
          const idx = e.detail.value as number;
          onSourceChange(idx === 0 ? '' : sourceOptions[idx]);
        }}
      >
        <View className="filter-bar__item">
          <Text className="filter-bar__label">出处</Text>
          <Text className="filter-bar__value">{selectedSource || '全部'}</Text>
          <Text className="filter-bar__arrow">▼</Text>
        </View>
      </Picker>

      <Picker
        mode="selector"
        range={SORT_OPTIONS.map((s) => s.label)}
        value={sortIndex >= 0 ? sortIndex : 0}
        onChange={(e) => {
          const option = SORT_OPTIONS[e.detail.value as number];
          if (option) onSortChange(option.value as 'newest' | 'oldest' | 'name');
        }}
      >
        <View className="filter-bar__item">
          <Text className="filter-bar__label">排序</Text>
          <Text className="filter-bar__value">
            {SORT_OPTIONS.find((s) => s.value === sortBy)?.label || '最新收藏'}
          </Text>
          <Text className="filter-bar__arrow">▼</Text>
        </View>
      </Picker>
    </View>
  );
}
