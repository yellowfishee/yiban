export const STORAGE_KEYS = {
  TODAY_DATE: 'yiban_today_date',
  TODAY_HEXAGRAM: 'yiban_today_hexagram',
  COLLECTION: 'yiban_collection',
  THEME: 'yiban_theme',
  SIMPLIFIED: 'yiban_simplified',
  DEVMODE: 'yiban_devmode',
  // 梅花打卡
  CHECKIN_TIMESTAMP: 'yiban_checkin_timestamp',
  MAIN_HEXAGRAM_ID: 'yiban_main_hexagram_id',
  HAS_MOVING_LINE: 'yiban_has_moving_line',
  MOVING_LINE: 'yiban_moving_line',
  UPPER_GUA: 'yiban_upper_gua',
  LOWER_GUA: 'yiban_lower_gua',
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
