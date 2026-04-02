import { Outlet } from 'react-router-dom';
import TabBar from '../ui/TabBar';
import { useSettings } from '../../context/SettingsContext';

export default function PageLayout() {
  const { simplified } = useSettings();

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-lg mx-auto px-4 py-6">
        <Outlet />
      </main>
      {!simplified && <TabBar />}
    </div>
  );
}
