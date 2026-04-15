export type Mood = 'work' | 'emotion' | 'inspiration' | 'encouragement';

export type BeastCategory = '龙类' | '鸟类' | '兽类' | '龟类' | '神马类' | '其他';

export const MOOD_LABELS: Record<Mood, string> = {
  work: '工作协作',
  emotion: '情感沟通',
  inspiration: '寻找灵感',
  encouragement: '需要鼓励',
};

/** JSON 数据中的 mood 条目结构 */
export interface RawMoodData {
  interpretation: string;
  encouragement: string;
}

/** JSON 数据中的原始卦象结构 */
export interface RawHexagram {
  id: string;
  name: string;
  symbol: string;
  category?: BeastCategory;
  nature: string;
  concept: string;
  source: string;
  description: string;
  rationale?: string;
  moods: Record<Mood, RawMoodData>;
}

// RawHexagram 即为最终类型，JSON 数据直接对应
export type Hexagram = RawHexagram;

export interface Inspiration {
  hexagram: RawHexagram;
  mood: Mood;
  text: string;
  date: string;
}

export interface CollectionItem {
  hexagramId: string;
  adoptedAt: string;
}

export type ThemeMode = 'xuanqing' | 'dailan' | 'mojin';
