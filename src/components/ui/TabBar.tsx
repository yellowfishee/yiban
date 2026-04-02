import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: '今日', icon: '✨' },
  { to: '/collection', label: '收藏', icon: '📖' },
  { to: '/study', label: '书斋', icon: '📚' },
  { to: '/settings', label: '设置', icon: '⚙️' },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-gray-200 flex z-50">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
              isActive ? 'text-accent font-bold' : 'text-gray-400'
            }`
          }
        >
          <span className="text-lg">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
