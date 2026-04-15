/**
 * 收藏上下文 - 处理用户收藏的卦象
 * 改造后使用 API 替代本地存储
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { collectionApi, type CollectionItem } from '../api/collection';
import { useAuth } from './AuthContext';
import type { RawHexagram } from '@yiban/core';

interface CollectionContextValue {
  adoptedIds: string[];
  adoptedHexagrams: RawHexagram[];
  adoptedAtMap: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  remove: (hexagramId: string) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [adoptedIds, setAdoptedIds] = useState<string[]>([]);
  const [adoptedHexagrams, setAdoptedHexagrams] = useState<RawHexagram[]>([]);
  const [adoptedAtMap, setAdoptedAtMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  const loadCollection = useCallback(async () => {
    // 未登录时不加载
    if (!isLoggedIn) {
      setAdoptedIds([]);
      setAdoptedHexagrams([]);
      setAdoptedAtMap({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await collectionApi.getAll();
      
      const ids = response.collections.map((item: CollectionItem) => item.hexagramId);
      const hexagrams = response.collections.map((item: CollectionItem) => item.hexagram);
      const atMap: Record<string, number> = {};
      
      response.collections.forEach((item: CollectionItem) => {
        atMap[item.hexagramId] = new Date(item.adoptedAt).getTime();
      });

      setAdoptedIds(ids);
      setAdoptedHexagrams(hexagrams);
      setAdoptedAtMap(atMap);
    } catch (error: any) {
      console.error('Load collection failed:', error);
      setError(error.message || '加载收藏失败');
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const reload = useCallback(async () => {
    await loadCollection();
  }, [loadCollection]);

  const remove = useCallback(async (hexagramId: string) => {
    await collectionApi.remove(hexagramId);
    setAdoptedIds((prev) => prev.filter((id) => id !== hexagramId));
    setAdoptedHexagrams((prev) => prev.filter((h) => h.id !== hexagramId));
    setAdoptedAtMap((prev) => {
      const next = { ...prev };
      delete next[hexagramId];
      return next;
    });
  }, []);

  const value: CollectionContextValue = {
    adoptedIds,
    adoptedHexagrams,
    adoptedAtMap,
    isLoading,
    error,
    reload,
    remove,
  };

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
}
