import { View, Text } from '@tarojs/components';
import { useState, useMemo } from 'react';
import Taro from '@tarojs/taro';
import { useCollection } from '../../context/CollectionContext';
import HexagramGridItem from '../../components/hexagram/HexagramGridItem';
import HexagramSymbol from '../../components/hexagram/HexagramSymbol';
import Skeleton from '../../components/skeleton/Skeleton';
import AnimatedModal from '../../components/modal/AnimatedModal';
import SwipeableItem from '../../components/swipeable/SwipeableItem';
import { haptic } from '../../utils/haptic';
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import FilterBar from './components/FilterBar';
import type { RawHexagram, BeastCategory } from '@yiban/core';
import './index.scss';

export default function CollectionPage() {
  const { adoptedHexagrams, adoptedAtMap, isLoading, remove } = useCollection();
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

  const handleCategoryChange = (category: BeastCategory | 'all') => {
    haptic.light();
    setActiveCategory(category);
  };

  const handleSourceChange = (source: string) => {
    haptic.light();
    setSelectedSource(source);
  };

  const handleSortChange = (sort: 'newest' | 'oldest' | 'name') => {
    haptic.light();
    setSortBy(sort);
  };

  const handleOpenModal = (hex: RawHexagram) => {
    haptic.light();
    setSelected(hex);
  };

  const handleCloseModal = () => {
    haptic.light();
    setSelected(null);
  };

  const handleLongPress = (hex: RawHexagram) => {
    haptic.medium();
    Taro.showActionSheet({
      itemList: ['分享', '移除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showShareMenu({
            withShareTicket: true,
          });
        } else if (res.tapIndex === 1) {
          handleRemove(hex.id);
        }
      },
    });
  };

  const handleRemove = async (hexagramId: string) => {
    try {
      await remove(hexagramId);
      Taro.showToast({ title: '已移除', icon: 'success' });
    } catch (e) {
      Taro.showToast({ title: '移除失败', icon: 'error' });
    }
  };

  const renderSkeletonGrid = () => (
    <View className="collection-page__grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} className="collection-page__skeleton-item">
          <Skeleton width="100%" height="100%" className="collection-page__skeleton" />
        </View>
      ))}
    </View>
  );

  return (
    <View className="collection-page">
      <View className="collection-page__header">
        <Text className="collection-page__title">神兽收藏</Text>
        <Text className="collection-page__count">已领养 {adoptedHexagrams.length} 只神兽</Text>
      </View>

      <SearchBar value={searchText} onChange={setSearchText} />
      <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
      <FilterBar
        sources={uniqueSources}
        selectedSource={selectedSource}
        onSourceChange={handleSourceChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {isLoading ? (
        renderSkeletonGrid()
      ) : filteredHexagrams.length === 0 ? (
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
              <SwipeableItem key={hex.id} onDelete={() => handleRemove(hex.id)}>
                <HexagramGridItem
                  hexagram={hex}
                  onClick={() => handleOpenModal(hex)}
                  onLongPress={() => handleLongPress(hex)}
                />
              </SwipeableItem>
            ))}
          </View>
          <View className="collection-page__footer">
            <Text className="collection-page__total">共 {filteredHexagrams.length} 只神兽</Text>
          </View>
        </>
      )}

      <AnimatedModal visible={selected !== null} onClose={handleCloseModal}>
        {selected && (
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
              <View className="collection-page__modal-close" onClick={handleCloseModal}>
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
        )}
      </AnimatedModal>
    </View>
  );
}
