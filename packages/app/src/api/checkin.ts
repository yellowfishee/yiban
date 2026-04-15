/**
 * 打卡 API
 */
import { post, get } from './client';
import type { RawHexagram } from '@yiban/core';

export interface MeihuaData {
  upperGua: string;
  lowerGua: string;
  movingLine: number;
}

export interface CheckinRecord {
  id: string;
  hexagramId: string;
  hexagram: RawHexagram;
  meihuaData: MeihuaData;
  mood: string | null;
  createdAt: string;
}

export interface CheckinResponse {
  checkin: CheckinRecord;
  collectionAdded: boolean;
}

export interface TodayCheckinResponse {
  hasCheckedIn: boolean;
  checkin: CheckinRecord | null;
}

export const checkinApi = {
  /**
   * 创建打卡记录
   * @param mood - 可选的心情标签
   */
  create: (mood?: string) =>
    post<CheckinResponse>('/api/checkin', { mood }, true),

  /**
   * 获取今日打卡状态
   */
  getToday: () =>
    get<TodayCheckinResponse>('/api/checkin/today', true),
};
