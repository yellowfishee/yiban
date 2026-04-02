import type { Hexagram, Mood, Inspiration } from '../types/hexagram';
import { getToday } from '../utils/date';

// Import the 48-entry corpus from assets/hexagrams.json
import hexagramsDataRaw from '../../assets/hexagrams.json';

interface HexagramJsonEntry {
  id: string;
  name: string;
  symbol: string;
  moods: Record<string, { interpretation: string; encouragement: string }>;
}

interface HexagramsJson {
  hexagrams: HexagramJsonEntry[];
}

const data = hexagramsDataRaw as HexagramsJson;

const HEXAGRAMS: Hexagram[] = data.hexagrams.map((entry) => ({
  id: entry.id,
  name: entry.name,
  symbol: entry.symbol,
  interpretations: {
    work: entry.moods.work?.interpretation ?? '',
    emotion: entry.moods.emotion?.interpretation ?? '',
    inspiration: entry.moods.inspiration?.interpretation ?? '',
    encouragement: entry.moods.encouragement?.interpretation ?? '',
  } as Record<Mood, string>,
}));

export async function getAllHexagrams(): Promise<Hexagram[]> {
  return HEXAGRAMS;
}

export async function getHexagramById(id: string): Promise<Hexagram | undefined> {
  return HEXAGRAMS.find((h) => h.id === id);
}

export async function getRandomHexagram(): Promise<Hexagram> {
  const index = Math.floor(Math.random() * HEXAGRAMS.length);
  return HEXAGRAMS[index];
}

export async function createInspiration(hexagram: Hexagram, mood: Mood): Promise<Inspiration> {
  return {
    hexagram,
    mood,
    text: hexagram.interpretations[mood] ?? '',
    date: getToday(),
  };
}
