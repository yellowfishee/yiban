/**
 * API 响应类型定义
 */

import type { RawHexagram } from '@yiban/core';

// ========== 打卡相关 ==========

export interface CheckinMeihuaData {
  upperGua: string;
  lowerGua: string;
  movingLine: number;
}

export interface CheckinRecord {
  id: string;
  userId?: string;
  hexagramId: string;
  hexagram: RawHexagram;
  meihuaData: CheckinMeihuaData;
  mood: string;
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

// ========== 收藏相关 ==========

export interface CollectionRecord {
  id: string;
  hexagramId: string;
  hexagram: RawHexagram;
  adoptedAt: string;
}

export interface CollectionListResponse {
  collections: CollectionRecord[];
}

// ========== 卦象相关 ==========

export interface HexagramListResponse {
  hexagrams: RawHexagram[];
}

export interface HexagramDetailResponse {
  hexagram: RawHexagram;
}

// ========== AI Agent 相关 ==========

export type AgentScene = 'suitable_for' | 'advice' | 'companionship' | 'career' | 'emotion' | 'fortune';

export interface AgentContent {
  id: string;
  scene: AgentScene;
  content: string;
  cached: boolean;
  createdAt: string;
}

// ========== 广告激励相关 ==========

export interface AdRewardedRequest {
  userId: string;
  checkinId: string;
  scene: AgentScene;
  rewarded: boolean;
  signature: string;
}

export interface AdRewardedResponse {
  success: boolean;
  remainingQuota: number;
}

// ========== AI Agent 相关 ==========

export interface AgentGenerateResponse {
  content?: string;
  cached?: boolean;
  beastName?: string;
  scene?: AgentScene;
  requiresAd?: boolean;
  message?: string;
}

export interface AgentContentsResponse {
  contents: AgentContent[];
}

// ========== 用户相关 ==========

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
