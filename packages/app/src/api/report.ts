import { get, post } from './client';

export interface UserStats {
  totalCheckins: number;
  monthCheckins: number;
  maxConsecutive: number;
  currentConsecutive: number;
}

export interface ReportListItem {
  id: string;
  yearMonth: string;
  checkinDays: number;
  createdAt: string;
}

export interface ReportDetail {
  id: string;
  yearMonth: string;
  summaryData: {
    checkinDays: number;
    consecutiveDays: number;
    checkinRate: number;
    hexagramDistribution: Record<string, number>;
    topScenes: string[];
  };
  storyContent: string;
  createdAt: string;
}

export const reportApi = {
  getStats: () => get<{ stats: UserStats }>('/api/report/stats', true),

  getList: () => get<{ reports: ReportListItem[] }>('/api/report/list', true),

  getDetail: (yearMonth: string) =>
    get<{ report: ReportDetail }>(`/api/report/${yearMonth}`, true),

  generate: () => post<{ report: ReportDetail }>('/api/report/generate', {}, true),
};
