export const STORAGE_KEYS = {
  TODAY_DATE: 'yiban_today_date',
  TODAY_HEXAGRAM: 'yiban_today_hexagram',
  COLLECTION: 'yiban_collection',
  THEME: 'yiban_theme',
  SIMPLIFIED: 'yiban_simplified',
} as const;

export function getItem(key: string): string | null {
  return localStorage.getItem(key);
}

export function setItem(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function getJSON<T>(key: string, fallback: T): T {
  const raw = getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T): void {
  setItem(key, JSON.stringify(value));
}
