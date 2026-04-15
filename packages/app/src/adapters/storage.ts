/**
 * 存储适配器 - 封装Taro存储API
 * Taro的存储API在H5和小程序中都能工作
 */
import Taro from '@tarojs/taro';

export const storage = {
  get: <T = any>(key: string): T | null => {
    try {
      const value = Taro.getStorageSync(key);
      return value || null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      Taro.setStorageSync(key, value);
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  remove: (key: string): void => {
    try {
      Taro.removeStorageSync(key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },

  clear: (): void => {
    try {
      Taro.clearStorageSync();
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  },
};

// 存储键名
export const STORAGE_KEYS = {
  TODAY_DATE: 'yiban_today_date',
  TODAY_HEXAGRAM: 'yiban_today_hexagram',
  COLLECTION: 'yiban_collection',
  THEME: 'yiban_theme',
  SIMPLIFIED: 'yiban_simplified',
  DEVMODE: 'yiban_dev_mode',
  // 梅花易数打卡
  CHECKIN_TIMESTAMP: 'yiban_checkin_timestamp',
  MAIN_HEXAGRAM_ID: 'yiban_main_hexagram_id',
  HAS_MOVING_LINE: 'yiban_has_moving_line',
  MOVING_LINE: 'yiban_moving_line',
  UPPER_GUA: 'yiban_upper_gua',
  LOWER_GUA: 'yiban_lower_gua',
  // 心情选择
  SELECTED_MOOD: 'yiban_selected_mood',
  // 认证相关
  AUTH_TOKEN: 'yiban_auth_token',
  USER_ID: 'yiban_user_id',
  // 用户协议
  AGREEMENT_ACCEPTED: 'yiban_agreement_accepted',
  // 字体大小
  FONT_SIZE: 'yiban_font_size',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
