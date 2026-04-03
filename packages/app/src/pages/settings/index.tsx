import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import type { ThemeMode } from '../../context/SettingsContext';
import './index.scss';

const THEMES: { id: ThemeMode; name: string; colors: string[] }[] = [
  { id: 'xuanqing', name: '玄青', colors: ['#1A2B3C', '#C73E3A', '#F5F0E8'] },
  { id: 'dailan', name: '黛蓝', colors: ['#3D5A73', '#D4A5A5', '#FAF8F5'] },
  { id: 'mojin', name: '墨金', colors: ['#1C1C1C', '#C9A84C', '#EDE8DC'] },
];

export default function SettingsPage() {
  const { theme, simplified, setTheme, toggleSimplified } = useSettings();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    Taro.showToast({ title: '已退出登录', icon: 'success' });
  };

  return (
    <View className="settings-page">
      <View className="settings-page__header">
        <Text className="settings-page__title">设置</Text>
      </View>

      {/* 用户信息 */}
      {isLoggedIn && user && (
        <View className="settings-page__section">
          <View className="settings-page__user">
            <Text className="settings-page__user-name">{user.nickname}</Text>
            <Text className="settings-page__user-id">ID: {user.id.slice(0, 8)}...</Text>
          </View>
        </View>
      )}

      {/* 主题切换 */}
      <View className="settings-page__section">
        <Text className="settings-page__section-title">主题色彩</Text>
        <View className="settings-page__themes">
          {THEMES.map((t) => {
            const isSelected = t.id === theme;
            return (
              <View
                key={t.id}
                className="settings-page__theme-item"
                onClick={() => setTheme(t.id)}
              >
                <View
                  className={`settings-page__theme-preview ${isSelected ? 'settings-page__theme-preview--active' : ''}`}
                  style={{
                    borderColor: isSelected ? t.colors[1] : 'transparent',
                    background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[2]})`,
                  }}
                />
                <Text className={`settings-page__theme-name ${isSelected ? 'settings-page__theme-name--active' : ''}`}>
                  {t.name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 极简模式 */}
      <View className="settings-page__section">
        <View className="settings-page__item">
          <View className="settings-page__item-info">
            <Text className="settings-page__item-label">极简模式</Text>
            <Text className="settings-page__item-hint">隐藏底部导航栏，仅保留今日页</Text>
          </View>
          <View
            className={`settings-page__toggle ${simplified ? 'settings-page__toggle--on' : ''}`}
            onClick={toggleSimplified}
          >
            <View className={`settings-page__toggle-knob ${simplified ? 'settings-page__toggle-knob--on' : ''}`} />
          </View>
        </View>
      </View>

      {/* 退出登录 */}
      <View className="settings-page__section">
        {isLoggedIn && (
          <View className="settings-page__item settings-page__item--clickable" onClick={handleLogout}>
            <Text className="settings-page__item-label--danger">退出登录</Text>
          </View>
        )}
      </View>

      {/* 关于 */}
      <View className="settings-page__section">
        <Text className="settings-page__section-title">关于易伴</Text>
        <View className="settings-page__about">
          <Text className="settings-page__about-text">
            易伴·卦象神兽{'\n'}
            领养一只文化神兽，收获一份今日灵感。{'\n\n'}
            本应用基于《周易》等传统文化典籍进行现代化、趣味化解读，旨在传播国学知识，提供文化视角的启发。
          </Text>
        </View>
      </View>

      <View className="settings-page__footer">
        <Text className="settings-page__version">易伴·卦象神兽 v1.0.0</Text>
      </View>
    </View>
  );
}
