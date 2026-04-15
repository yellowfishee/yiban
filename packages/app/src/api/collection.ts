/**
 * 收藏 API
 */
import { get, del } from './client';
import type { RawHexagram } from '@yiban/core';

export interface CollectionItem {
  id: string;
  hexagramId: string;
  hexagram: RawHexagram;
  adoptedAt: string;
}

export interface CollectionListResponse {
  collections: CollectionItem[];
}

export const collectionApi = {
  getAll: () =>
    get<CollectionListResponse>('/api/collection', true),

  remove: (hexagramId: string) =>
    del<{ success: boolean }>(`/api/collection/${hexagramId}`, true),
};
