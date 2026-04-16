import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { reportApi, type ReportListItem } from '../../api/report';
import Skeleton from '../../components/skeleton/Skeleton';
import { haptic } from '../../utils/haptic';
import './index.scss';

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}年${MONTH_NAMES[parseInt(month, 10) - 1]}`;
}

export default function ReportListPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reportApi.getList();
      setReports(result.reports);
    } catch (err) {
      setError('加载失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleGenerate = useCallback(async () => {
    haptic.medium();
    setIsGenerating(true);
    try {
      const result = await reportApi.generate();
      Taro.navigateTo({ url: `/pages/report/detail?yearMonth=${result.report.yearMonth}` });
    } catch (err: any) {
      const message = err?.message || '生成失败';
      if (message.includes('already exists')) {
        Taro.showToast({ title: '本月报告已存在', icon: 'none' });
      } else if (message.includes('No checkins')) {
        Taro.showToast({ title: '本月暂无打卡记录', icon: 'none' });
      } else {
        Taro.showToast({ title: message, icon: 'none' });
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleItemClick = useCallback((yearMonth: string) => {
    haptic.light();
    Taro.navigateTo({ url: `/pages/report/detail?yearMonth=${yearMonth}` });
  }, []);

  const renderSkeleton = () => (
    <View className="report-list__skeleton">
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} className="report-list__skeleton-item">
          <Skeleton width="60%" height="24px" className="report-list__skeleton-title" />
          <Skeleton width="40%" height="18px" className="report-list__skeleton-subtitle" />
        </View>
      ))}
    </View>
  );

  return (
    <View className="report-list">
      <View className="report-list__header">
        <Text className="report-list__title">月度报告</Text>
        <Text className="report-list__subtitle">回顾每月的卦象旅程</Text>
      </View>

      <View
        className={`report-list__generate-btn ${isGenerating ? 'report-list__generate-btn--disabled' : ''}`}
        onClick={isGenerating ? undefined : handleGenerate}
      >
        <Text className="report-list__generate-btn-text">
          {isGenerating ? '生成中...' : '生成本月报告'}
        </Text>
      </View>

      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        <View className="report-list__error">
          <Text className="report-list__error-text">{error}</Text>
          <View className="report-list__retry-btn" onClick={loadReports}>
            <Text className="report-list__retry-btn-text">重试</Text>
          </View>
        </View>
      ) : reports.length === 0 ? (
        <View className="report-list__empty">
          <Text className="report-list__empty-icon">📊</Text>
          <Text className="report-list__empty-text">暂无历史报告</Text>
          <Text className="report-list__empty-hint">开始打卡后，每月可生成报告</Text>
        </View>
      ) : (
        <ScrollView className="report-list__content" scrollY>
          {reports.map((report) => (
            <View
              key={report.id}
              className="report-list__item"
              onClick={() => handleItemClick(report.yearMonth)}
            >
              <View className="report-list__item-info">
                <Text className="report-list__item-month">{formatMonthLabel(report.yearMonth)}</Text>
                <Text className="report-list__item-days">打卡 {report.checkinDays} 天</Text>
              </View>
              <Text className="report-list__item-arrow">›</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
