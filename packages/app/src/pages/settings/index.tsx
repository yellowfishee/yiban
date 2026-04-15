import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import type { ThemeMode } from '../../context/SettingsContext';
import './index.scss';

const THEMES: { id: ThemeMode; name: string; colors: { primary: string; text: string; bg: string } }[] = [
  { id: 'xuanqing', name: '玄青', colors: { primary: '#C73E3A', text: '#1A2B3C', bg: '#F5F0E8' } },
  { id: 'dailan', name: '黛蓝', colors: { primary: '#D4A5A5', text: '#3D5A73', bg: '#FAF8F5' } },
  { id: 'mojin', name: '墨金', colors: { primary: '#C9A84C', text: '#1C1C1C', bg: '#EDE8DC' } },
];

const FONT_SIZES = [
  { id: 'small', name: '小', scale: 0.9 },
  { id: 'medium', name: '中', scale: 1 },
  { id: 'large', name: '大', scale: 1.1 },
];

export default function SettingsPage() {
  const { theme, simplified, fontSize, setTheme, toggleSimplified, setFontSize } = useSettings();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout();
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  };

  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？这不会影响您的账号数据。',
      success: (res) => {
        if (res.confirm) {
          try {
            Taro.clearStorageSync();
            Taro.showToast({ title: '缓存已清除', icon: 'success' });
            setTimeout(() => {
              Taro.reLaunch({ url: '/pages/home/index' });
            }, 1000);
          } catch (e) {
            Taro.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      },
    });
  };

  const handleFeedback = () => {
    Taro.setClipboardData({
      data: 'https://github.com/anomalyco/yiban/issues',
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      },
    });
  };

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <View className="settings-page">
      <View className="settings-page__header">
        <Text className="settings-page__title">设置</Text>
      </View>

      {/* 用户信息 */}
      {isLoggedIn && user && (
        <View className="settings-page__card">
          <View className="settings-page__user">
            <View className="settings-page__user-avatar" style={{ background: currentTheme.colors.primary }}>
              <Text className="settings-page__user-avatar-text">{user.nickname?.charAt(0) || '易'}</Text>
            </View>
            <View className="settings-page__user-info">
              <Text className="settings-page__user-name">{user.nickname || '易伴用户'}</Text>
              <Text className="settings-page__user-id">ID: {user.id.slice(0, 8)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 主题切换 */}
      <View className="settings-page__card">
        <Text className="settings-page__card-title">主题色彩</Text>
        <View className="settings-page__themes">
          {THEMES.map((t) => {
            const isSelected = t.id === theme;
            return (
              <View
                key={t.id}
                className={`settings-page__theme-item ${isSelected ? 'settings-page__theme-item--active' : ''}`}
                onClick={() => setTheme(t.id)}
              >
                <View
                  className="settings-page__theme-preview"
                  style={{ background: t.colors.bg }}
                >
                  <View className="settings-page__theme-preview-header" style={{ background: t.colors.primary }} />
                  <View className="settings-page__theme-preview-body">
                    <View className="settings-page__theme-preview-text" style={{ background: t.colors.text }} />
                    <View className="settings-page__theme-preview-text settings-page__theme-preview-text--short" style={{ background: t.colors.text }} />
                  </View>
                </View>
                <Text className={`settings-page__theme-name ${isSelected ? 'settings-page__theme-name--active' : ''}`}>
                  {t.name}
                </Text>
                {isSelected && <View className="settings-page__theme-check">✓</View>}
              </View>
            );
          })}
        </View>
      </View>

      {/* 显示设置 */}
      <View className="settings-page__card">
        <Text className="settings-page__card-title">显示设置</Text>
        
        <View className="settings-page__item">
          <View className="settings-page__item-left">
            <Text className="settings-page__item-label">极简模式</Text>
            <Text className="settings-page__item-hint">减少动画和装饰</Text>
          </View>
          <View
            className={`settings-page__toggle ${simplified ? 'settings-page__toggle--on' : ''}`}
            onClick={toggleSimplified}
          >
            <View className={`settings-page__toggle-knob ${simplified ? 'settings-page__toggle-knob--on' : ''}`} />
          </View>
        </View>

        <View className="settings-page__item">
          <View className="settings-page__item-left">
            <Text className="settings-page__item-label">字体大小</Text>
          </View>
          <View className="settings-page__font-sizes">
            {FONT_SIZES.map((fs) => {
              const isSelected = fs.id === fontSize;
              return (
                <View
                  key={fs.id}
                  className={`settings-page__font-size ${isSelected ? 'settings-page__font-size--active' : ''}`}
                  onClick={() => setFontSize(fs.id as 'small' | 'medium' | 'large')}
                >
                  <Text className="settings-page__font-size-text">{fs.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* 数据与存储 */}
      <View className="settings-page__card">
        <Text className="settings-page__card-title">数据与存储</Text>
        
        <View className="settings-page__item settings-page__item--clickable" onClick={handleClearCache}>
          <Text className="settings-page__item-label">清除缓存</Text>
          <Text className="settings-page__item-arrow">›</Text>
        </View>
      </View>

      {/* 其他 */}
      <View className="settings-page__card">
        <Text className="settings-page__card-title">其他</Text>
        
        <View className="settings-page__item settings-page__item--clickable" onClick={handleFeedback}>
          <Text className="settings-page__item-label">意见反馈</Text>
          <Text className="settings-page__item-arrow">›</Text>
        </View>

        <View className="settings-page__item settings-page__item--clickable" onClick={() => Taro.navigateTo({ url: '/pages/agreement/index' })}>
          <Text className="settings-page__item-label">用户协议</Text>
          <Text className="settings-page__item-arrow">›</Text>
        </View>

        <View className="settings-page__item settings-page__item--clickable" onClick={() => Taro.navigateTo({ url: '/pages/privacy/index' })}>
          <Text className="settings-page__item-label">隐私政策</Text>
          <Text className="settings-page__item-arrow">›</Text>
        </View>
      </View>

      {/* 退出登录 */}
      {isLoggedIn && (
        <View className="settings-page__card settings-page__card--danger">
          <View className="settings-page__item settings-page__item--clickable" onClick={handleLogout}>
            <Text className="settings-page__item-label--danger">退出登录</Text>
          </View>
        </View>
      )}

      {/* 关于 */}
      <View className="settings-page__about">
        <Text className="settings-page__about-text">
          易伴·卦象神兽{'\n'}
          领养一只文化神兽，收获一份今日灵感
        </Text>
        <Text className="settings-page__version">v1.0.0</Text>
      </View>
    </View>
  );
}
