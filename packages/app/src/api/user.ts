/**
 * 用户 API
 */
import { get, put } from './client';

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

export interface UpdateProfileRequest {
  nickname?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  user: {
    id: string;
    nickname: string;
    avatar: string;
    isPremium: boolean;
  };
}

export const userApi = {
  /**
   * 获取用户资料和统计数据
   */
  getProfile: () =>
    get<UserProfileResponse>('/api/user/profile', true),

  /**
   * 更新用户资料
   * @param data - 昵称和/或头像
   */
  updateProfile: (data: UpdateProfileRequest) =>
    put<UpdateProfileResponse>('/api/user/profile', data, true),
};
