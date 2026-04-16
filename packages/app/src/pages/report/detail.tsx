import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useCallback, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { reportApi, type ReportDetail } from '../../api/report';
import Skeleton from '../../components/skeleton/Skeleton';
import { haptic } from '../../utils/haptic';
import { hexagrams } from '@yiban/core';
import './index.scss';

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const SCENE_NAMES: Record<string, string> = {
  suitable_for: '今日适合',
  advice: '处事建议',
  companionship: '情绪陪同',
  career: '事业发展',
  emotion: '情感沟通',
  fortune: '财运参考',
};

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}年${MONTH_NAMES[parseInt(month, 10) - 1]}`;
}

function getHexagramName(id: string): string {
  const hex = hexagrams.find((h) => h.id === id);
  return hex?.name || id;
}

export default function ReportDetailPage() {
  const router = useRouter();
  const yearMonth = router.params.yearMonth || '';

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!yearMonth) {
      setError('参数错误');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await reportApi.getDetail(yearMonth);
      setReport(result.report);
    } catch (err) {
      setError('加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [yearMonth]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleBack = useCallback(() => {
    haptic.light();
    Taro.navigateBack();
  }, []);

  const renderSkeleton = () => (
    <View className="report-detail__skeleton">
      <Skeleton width="50%" height="32px" className="report-detail__skeleton-title" />
      <View className="report-detail__skeleton-stats">
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} className="report-detail__skeleton-stat">
            <Skeleton width="40px" height="40px" circle />
            <Skeleton width="60%" height="20px" />
          </View>
        ))}
      </View>
      <Skeleton width="100%" height="200px" className="report-detail__skeleton-content" />
    </View>
  );

  if (isLoading) {
    return (
      <View className="report-detail">
        {renderSkeleton()}
      </View>
    );
  }

  if (error || !report) {
    return (
      <View className="report-detail report-detail--error">
        <Text className="report-detail__error-text">{error || '报告不存在'}</Text>
        <View className="report-detail__back-btn" onClick={handleBack}>
          <Text className="report-detail__back-btn-text">返回</Text>
        </View>
      </View>
    );
  }

  const { summaryData, storyContent } = report;
  const hexagramEntries = Object.entries(summaryData.hexagramDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <ScrollView className="report-detail" scrollY>
      <View className="report-detail__header">
        <Text className="report-detail__title">{formatMonthLabel(report.yearMonth)}</Text>
        <Text className="report-detail__subtitle">月度报告</Text>
      </View>

      <View className="report-detail__stats">
        <View className="report-detail__stat">
          <Text className="report-detail__stat-value">{summaryData.checkinDays}</Text>
          <Text className="report-detail__stat-label">打卡天数</Text>
        </View>
        <View className="report-detail__stat">
          <Text className="report-detail__stat-value">{summaryData.consecutiveDays}</Text>
          <Text className="report-detail__stat-label">连续天数</Text>
        </View>
        <View className="report-detail__stat">
          <Text className="report-detail__stat-value">{Math.round(summaryData.checkinRate * 100)}%</Text>
          <Text className="report-detail__stat-label">打卡率</Text>
        </View>
      </View>

      {hexagramEntries.length > 0 && (
        <View className="report-detail__section">
          <Text className="report-detail__section-title">卦象分布</Text>
          <View className="report-detail__hexagrams">
            {hexagramEntries.map(([id, count]) => (
              <View key={id} className="report-detail__hexagram">
                <Text className="report-detail__hexagram-name">{getHexagramName(id)}</Text>
                <Text className="report-detail__hexagram-count">{count} 次</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {summaryData.topScenes.length > 0 && (
        <View className="report-detail__section">
          <Text className="report-detail__section-title">热门场景</Text>
          <View className="report-detail__scenes">
            {summaryData.topScenes.map((scene, i) => (
              <View key={scene} className="report-detail__scene">
                <Text className="report-detail__scene-index">{i + 1}</Text>
                <Text className="report-detail__scene-name">{SCENE_NAMES[scene] || scene}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {storyContent && (
        <View className="report-detail__section">
          <Text className="report-detail__section-title">神兽寄语</Text>
          <Text className="report-detail__story">{storyContent}</Text>
        </View>
      )}

      <View className="report-detail__footer">
        <View className="report-detail__back-btn" onClick={handleBack}>
          <Text className="report-detail__back-btn-text">返回列表</Text>
        </View>
      </View>
    </ScrollView>
  );
}
