import { View, Input, Text } from '@tarojs/components';
import './SearchBar.scss';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = '搜索卦名或神兽' }: SearchBarProps) {
  return (
    <View className="search-bar">
      <Text className="search-bar__icon">🔍</Text>
      <Input
        className="search-bar__input"
        placeholder={placeholder}
        placeholderClass="search-bar__placeholder"
        value={value}
        onInput={(e) => onChange(e.detail.value)}
      />
      {value && (
        <View className="search-bar__clear" onClick={() => onChange('')}>
          <Text className="search-bar__clear-text">×</Text>
        </View>
      )}
    </View>
  );
}
