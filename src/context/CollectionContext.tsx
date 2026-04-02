import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Hexagram } from '../types/hexagram';
import { getAllHexagrams } from '../mocks';
import { getJSON, STORAGE_KEYS } from '../utils/storage';

interface CollectionContextValue {
  adoptedIds: string[];
  adoptedHexagrams: Hexagram[];
  reload: () => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [adoptedIds, setAdoptedIds] = useState<string[]>([]);
  const [adoptedHexagrams, setAdoptedHexagrams] = useState<Hexagram[]>([]);

  const loadCollection = useCallback(async () => {
    const collection = getJSON<{ hexagramId: string; adoptedAt: string }[]>(STORAGE_KEYS.COLLECTION, []);
    const ids = collection.map((item) => item.hexagramId);
    setAdoptedIds(ids);

    const hexagrams = await getAllHexagrams();
    const adopted = hexagrams.filter((h) => ids.includes(h.id));
    setAdoptedHexagrams(adopted);
  }, []);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const reload = useCallback(async () => {
    await loadCollection();
  }, [loadCollection]);

  const value: CollectionContextValue = {
    adoptedIds,
    adoptedHexagrams,
    reload,
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
