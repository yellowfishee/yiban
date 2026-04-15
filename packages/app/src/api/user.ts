/**
 * 用户 API
 */
import { get } from './client';

export interface UserStats {
  totalCheckins: number;
  totalCollections: number;
}

export interface UserProfileResponse {
  user: {
    id: string;
    nickname: string;
    avatar: string;
    isPremium: boolean;
    createdAt: string;
  };
  stats: UserStats;
}

export const userApi = {
  /**
   * 获取用户资料和统计数据
   */
  getProfile: () =>
    get<UserProfileResponse>('/api/user/profile', true),
};
