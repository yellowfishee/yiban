import { View, Text } from '@tarojs/components';
import { useState } from 'react';
import { hexagrams } from '@yiban/core';
import HexagramGridItem from '../../components/hexagram/HexagramGridItem';
import type { RawHexagram } from '@yiban/core';
import './index.scss';

export default function StudyPage() {
  const [selected, setSelected] = useState<RawHexagram | null>(null);

  return (
    <View className="study-page">
      <View className="study-page__header">
        <Text className="study-page__title">64卦象神兽</Text>
        <Text className="study-page__subtitle">共 {hexagrams.length} 卦</Text>
      </View>

      <View className="study-page__grid">
        {hexagrams.map((h) => (
          <HexagramGridItem
            key={h.id}
            hexagram={h}
            onClick={() => setSelected(h)}
          />
        ))}
      </View>

      {/* 详情弹窗 */}
      {selected && (
        <View className="study-page__modal">
          <View
            className="study-page__modal-mask"
            onClick={() => setSelected(null)}
          />
          <View className="study-page__modal-content">
            <View className="study-page__modal-header">
              <View className="study-page__modal-titles">
                <Text className="study-page__modal-name">{selected.name}</Text>
                <Text className="study-page__modal-symbol">{selected.symbol}</Text>
              </View>
              <View
                className="study-page__modal-close"
                onClick={() => setSelected(null)}
              >
                <Text className="study-page__modal-close-text">×</Text>
              </View>
            </View>

            <View className="study-page__modal-row">
              <View className="study-page__modal-field">
                <View className="study-page__modal-section-header">
                  <View className="study-page__modal-section-icon" />
                  <Text className="study-page__modal-label">卦象</Text>
                </View>
                <Text className="study-page__modal-text">{selected.nature}</Text>
              </View>
              <View className="study-page__modal-field">
                <View className="study-page__modal-section-header">
                  <View className="study-page__modal-section-icon" />
                  <Text className="study-page__modal-label">象意</Text>
                </View>
                <Text className="study-page__modal-text">{selected.concept}</Text>
              </View>
            </View>

            <View className="study-page__modal-divider" />

            <View className="study-page__modal-section">
              <View className="study-page__modal-section-header">
                <View className="study-page__modal-section-icon" />
                <Text className="study-page__modal-label">出处</Text>
              </View>
              <Text className="study-page__modal-text--secondary">{selected.source}</Text>
            </View>

            <View className="study-page__modal-divider" />

            <View className="study-page__modal-section">
              <View className="study-page__modal-section-header">
                <View className="study-page__modal-section-icon" />
                <Text className="study-page__modal-label">神兽阐释</Text>
              </View>
              <Text className="study-page__modal-text--secondary">{selected.description}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
