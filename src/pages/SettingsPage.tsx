import { useSettings } from '../context/SettingsContext';
import type { ThemeMode } from '../types/hexagram';

const THEMES: { id: ThemeMode; name: string; colors: string[] }[] = [
  { id: 'xuanqing', name: '玄青', colors: ['#1A2B3C', '#C73E3A', '#F5F0E8'] },
  { id: 'dailan', name: '黛蓝', colors: ['#3D5A73', '#D4A5A5', '#FAF8F5'] },
  { id: 'mojin', name: '墨金', colors: ['#1C1C1C', '#C9A84C', '#EDE8DC'] },
];

export default function SettingsPage() {
  const { theme, simplified, setTheme, toggleSimplified } = useSettings();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-primary text-center">设置</h1>

      {/* 主题切换 */}
      <div className="bg-white rounded-2xl p-4">
        <p className="text-sm font-bold text-primary mb-4">主题色彩</p>
        <div className="flex gap-6 justify-center">
          {THEMES.map((t) => {
            const isSelected = t.id === theme;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-12 h-12 rounded-full border-4 transition-all"
                  style={{
                    borderColor: isSelected ? t.colors[1] : 'transparent',
                    background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[2]})`,
                  }}
                />
                <span className={`text-xs ${isSelected ? 'font-bold text-primary' : 'text-gray-400'}`}>
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 极简模式 */}
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-primary">极简模式</p>
          <p className="text-xs text-gray-400 mt-1">隐藏底部导航栏，仅保留今日页</p>
        </div>
        <button
          onClick={toggleSimplified}
          className={`w-12 h-6 rounded-full transition-all relative ${
            simplified ? 'bg-accent' : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              simplified ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-2xl p-4">
        <p className="text-sm font-bold text-primary mb-3">关于易伴</p>
        <p className="text-xs text-gray-500 leading-6">
          易伴·卦象神兽
          <br />
          领养一只文化神兽，收获一份今日灵感。
          <br />
          <br />
          本应用基于《周易》等传统文化典籍进行现代化、趣味化解读，旨在传播国学知识，提供文化视角的启发。
        </p>
      </div>
    </div>
  );
}
