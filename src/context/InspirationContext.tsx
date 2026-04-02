import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Hexagram, Mood, Inspiration } from '../types/hexagram';
import { getRandomHexagram, getHexagramById, createInspiration } from '../mocks';
import { getJSON, setJSON, getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { getToday, isToday } from '../utils/date';

interface InspirationState {
  currentHexagram: Hexagram | null;
  selectedMood: Mood | null;
  inspiration: Inspiration | null;
  alreadyAdoptedToday: boolean;
  isLoading: boolean;
}

type InspirationAction =
  | { type: 'LOAD'; payload: { currentHexagram: Hexagram; inspiration: Inspiration } }
  | { type: 'SELECT_MOOD'; payload: { mood: Mood; inspiration: Inspiration } }
  | { type: 'ADOPT_SUCCESS' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: InspirationState = {
  currentHexagram: null,
  selectedMood: null,
  inspiration: null,
  alreadyAdoptedToday: false,
  isLoading: false,
};

function inspirationReducer(state: InspirationState, action: InspirationAction): InspirationState {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        currentHexagram: action.payload.currentHexagram,
        inspiration: action.payload.inspiration,
        alreadyAdoptedToday: false,
        isLoading: false,
      };
    case 'SELECT_MOOD':
      if (!state.currentHexagram) return state;
      return {
        ...state,
        selectedMood: action.payload.mood,
        inspiration: action.payload.inspiration,
      };
    case 'ADOPT_SUCCESS':
      return {
        ...state,
        alreadyAdoptedToday: true,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

interface InspirationContextValue extends InspirationState {
  loadToday: () => Promise<void>;
  selectMood: (mood: Mood) => Promise<void>;
  adopt: () => Promise<void>;
}

const InspirationContext = createContext<InspirationContextValue | null>(null);

export function InspirationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inspirationReducer, initialState);

  const loadToday = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    const savedDate = getItem(STORAGE_KEYS.TODAY_DATE);
    const today = getToday();

    if (savedDate && isToday(savedDate)) {
      // Restore today's hexagram from localStorage
      const savedHexagramId = getJSON<string | null>(STORAGE_KEYS.TODAY_HEXAGRAM, null);
      if (savedHexagramId) {
        const hexagram = await getHexagramById(savedHexagramId);
        if (hexagram) {
          // Re-create inspiration with default mood
          const mood: Mood = 'work';
          const inspiration = await createInspiration(hexagram, mood);
          dispatch({ type: 'LOAD', payload: { currentHexagram: hexagram, inspiration } });

          // Check if already adopted today
          const collection = getJSON<{ hexagramId: string; adoptedAt: string }[]>(STORAGE_KEYS.COLLECTION, []);
          const alreadyAdopted = collection.some((item) => item.hexagramId === hexagram.id && isToday(item.adoptedAt));
          if (alreadyAdopted) {
            dispatch({ type: 'ADOPT_SUCCESS' });
          }
          return;
        }
      }
    }

    // No saved hexagram for today, get a random one
    const hexagram = await getRandomHexagram();
    const mood: Mood = 'work';
    const inspiration = await createInspiration(hexagram, mood);

    // Save to localStorage
    setItem(STORAGE_KEYS.TODAY_DATE, today);
    setJSON(STORAGE_KEYS.TODAY_HEXAGRAM, hexagram.id);

    dispatch({ type: 'LOAD', payload: { currentHexagram: hexagram, inspiration } });
  }, []);

  const selectMood = useCallback(async (mood: Mood) => {
    if (!state.currentHexagram) return;
    const inspiration = await createInspiration(state.currentHexagram, mood);
    dispatch({ type: 'SELECT_MOOD', payload: { mood, inspiration } });
  }, [state.currentHexagram]);

  const adopt = useCallback(async () => {
    if (!state.currentHexagram) return;

    const collection = getJSON<{ hexagramId: string; adoptedAt: string }[]>(STORAGE_KEYS.COLLECTION, []);
    collection.push({
      hexagramId: state.currentHexagram.id,
      adoptedAt: getToday(),
    });
    setJSON(STORAGE_KEYS.COLLECTION, collection);

    dispatch({ type: 'ADOPT_SUCCESS' });
  }, [state.currentHexagram]);

  const value: InspirationContextValue = {
    ...state,
    loadToday,
    selectMood,
    adopt,
  };

  return <InspirationContext.Provider value={value}>{children}</InspirationContext.Provider>;
}

export function useInspiration(): InspirationContextValue {
  const context = useContext(InspirationContext);
  if (!context) {
    throw new Error('useInspiration must be used within an InspirationProvider');
  }
  return context;
}
