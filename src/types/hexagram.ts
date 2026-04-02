export type Mood = 'work' | 'emotion' | 'inspiration' | 'encouragement';

export const MOOD_LABELS: Record<Mood, string> = {
  work: '工作协作',
  emotion: '情感沟通',
  inspiration: '寻找灵感',
  encouragement: '需要鼓励',
};

export interface Hexagram {
  id: string;
  name: string;
  symbol: string;
  interpretations: Record<Mood, string>;
}

export interface Inspiration {
  hexagram: Hexagram;
  mood: Mood;
  text: string;
  date: string;
}

export interface CollectionItem {
  hexagramId: string;
  adoptedAt: string;
}

export type ThemeMode = 'xuanqing' | 'dailan' | 'mojin';
