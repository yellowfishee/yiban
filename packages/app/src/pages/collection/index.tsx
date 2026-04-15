import { View, Text } from '@tarojs/components';
import { useState, useMemo } from 'react';
import { useCollection } from '../../context/CollectionContext';
import HexagramGridItem from '../../components/hexagram/HexagramGridItem';
import HexagramSymbol from '../../components/hexagram/HexagramSymbol';
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import FilterBar from './components/FilterBar';
import type { RawHexagram, BeastCategory } from '@yiban/core';
import './index.scss';

export default function CollectionPage() {
  const { adoptedHexagrams, adoptedAtMap } = useCollection();
  const [selected, setSelected] = useState<RawHexagram | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState<BeastCategory | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const uniqueSources = useMemo(() => {
    const sources = new Set(adoptedHexagrams.map((h) => h.source));
    return Array.from(sources);
  }, [adoptedHexagrams]);

  const filteredHexagrams = useMemo(() => {
    return adoptedHexagrams
      .filter((hex) => {
        if (searchText) {
          const query = searchText.toLowerCase();
          const matchesName = hex.name.toLowerCase().includes(query);
          const matchesSymbol = hex.symbol.toLowerCase().includes(query);
          if (!matchesName && !matchesSymbol) return false;
        }

        if (activeCategory !== 'all' && hex.category !== activeCategory) {
          return false;
        }

        if (selectedSource && hex.source !== selectedSource) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aTime = adoptedAtMap[a.id] || 0;
        const bTime = adoptedAtMap[b.id] || 0;

        switch (sortBy) {
          case 'newest':
            return bTime - aTime;
          case 'oldest':
            return aTime - bTime;
          case 'name':
            return a.name.localeCompare(b.name, 'zh-CN');
          default:
            return 0;
        }
      });
  }, [adoptedHexagrams, adoptedAtMap, searchText, activeCategory, selectedSource, sortBy]);

  return (
    <View className="collection-page">
      <View className="collection-page__header">
        <Text className="collection-page__title">神兽收藏</Text>
        <Text className="collection-page__count">已领养 {adoptedHexagrams.length} 只神兽</Text>
      </View>

      <SearchBar value={searchText} onChange={setSearchText} />
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      <FilterBar
        sources={uniqueSources}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {filteredHexagrams.length === 0 ? (
        <View className="collection-page__empty">
          {adoptedHexagrams.length === 0 ? (
            <>
              <Text className="collection-page__empty-icon">🌟</Text>
              <Text className="collection-page__empty-text">还没有领养过神兽</Text>
              <Text className="collection-page__empty-hint">去今日页遇见你的第一只神兽吧</Text>
            </>
          ) : (
            <>
              <Text className="collection-page__empty-icon">🔍</Text>
              <Text className="collection-page__empty-text">没有匹配的神兽</Text>
              <Text className="collection-page__empty-hint">试试其他筛选条件</Text>
            </>
          )}
        </View>
      ) : (
        <>
          <View className="collection-page__grid">
            {filteredHexagrams.map((hex) => (
              <HexagramGridItem
                key={hex.id}
                hexagram={hex}
                onClick={() => setSelected(hex)}
              />
            ))}
          </View>
          <View className="collection-page__footer">
            <Text className="collection-page__total">共 {filteredHexagrams.length} 只神兽</Text>
          </View>
        </>
      )}

      {selected && (
        <View className="collection-page__modal">
          <View className="collection-page__modal-mask" onClick={() => setSelected(null)} />
          <View className="collection-page__modal-content">
            <View className="collection-page__modal-header">
              <View className="collection-page__modal-icon">
                <HexagramSymbol symbol={selected.symbol} size="md" />
              </View>
              <View className="collection-page__modal-info">
                <Text className="collection-page__modal-name">{selected.name}</Text>
                <Text className="collection-page__modal-nature">
                  {selected.symbol} · {selected.nature}
                </Text>
              </View>
              <View className="collection-page__modal-close" onClick={() => setSelected(null)}>
                <Text className="collection-page__modal-close-text">×</Text>
              </View>
            </View>

            <View className="collection-page__modal-section">
              <Text className="collection-page__modal-label">卦象</Text>
              <Text className="collection-page__modal-text">{selected.concept}</Text>
            </View>

            <View className="collection-page__modal-section">
              <Text className="collection-page__modal-label">出处</Text>
              <Text className="collection-page__modal-text--secondary">{selected.source}</Text>
            </View>

            <View className="collection-page__modal-section">
              <Text className="collection-page__modal-label">关联阐释</Text>
              <Text className="collection-page__modal-text--secondary">
                {selected.description}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
