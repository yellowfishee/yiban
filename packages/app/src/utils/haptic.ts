import Taro from '@tarojs/taro';

export const haptic = {
  light: () => {
    try {
      Taro.vibrateShort({ type: 'light' });
    } catch (e) {
      // ignore
    }
  },
  medium: () => {
    try {
      Taro.vibrateShort({ type: 'medium' });
    } catch (e) {
      // ignore
    }
  },
  heavy: () => {
    try {
      Taro.vibrateShort({ type: 'heavy' });
    } catch (e) {
      // ignore
    }
  },
  error: () => {
    try {
      Taro.vibrateLong();
    } catch (e) {
      // ignore
    }
  },
};
