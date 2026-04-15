/**
 * 卦象 API
 */
import { get } from './client';
import type { RawHexagram } from '@yiban/core';

export interface HexagramListResponse {
  hexagrams: RawHexagram[];
}

export interface HexagramDetailResponse {
  hexagram: RawHexagram;
}

export const hexagramApi = {
  /**
   * 获取所有卦象列表
   */
  getAll: () =>
    get<HexagramListResponse>('/api/hexagrams'),

  /**
   * 根据 ID 获取卦象详情
   * @param id - 卦象 ID
   */
  getById: (id: string) =>
    get<HexagramDetailResponse>(`/api/hexagram/${id}`),
};
