/**
 * AI Agent API 客户端
 */
import { post, get } from './client';
import type { AgentScene } from '@yiban/core';

export interface GenerateResponse {
  content: string;
  cached: boolean;
  beastName: string;
  scene: AgentScene;
}

export interface AgentContent {
  id: string;
  scene: AgentScene;
  content: string;
  cached: boolean;
  createdAt: string;
}

export interface ContentsResponse {
  contents: AgentContent[];
}

export const agentApi = {
  /**
   * 生成 AI 建议
   * @param checkinId - 打卡记录ID
   * @param scene - 场景类型
   */
  generate: (checkinId: string, scene: AgentScene) =>
    post<GenerateResponse>('/api/agent/generate', { checkinId, scene }, true),

  /**
   * 获取指定打卡的所有 AI 内容
   * @param checkinId - 打卡记录ID
   */
  getContents: (checkinId: string) =>
    get<ContentsResponse>(`/api/agent/contents/${checkinId}`, true),

  /**
   * 上报广告观看完成
   */
  reportAdWatched: (checkinId: string, scene: AgentScene, signature: string) =>
    post<{ success: boolean; remainingQuota: number }>('/api/agent/ad-rewarded', {
      checkinId,
      scene,
      rewarded: true,
      signature,
    }, true),
};
