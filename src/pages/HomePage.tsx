import { useEffect } from 'react';
import { useInspiration } from '../context/InspirationContext';
import { useCollection } from '../context/CollectionContext';
import HexagramCard from '../components/hexagram/HexagramCard';
import MoodSelector from '../components/inspiration/MoodSelector';
import InspirationDisplay from '../components/inspiration/InspirationDisplay';

export default function HomePage() {
  const { currentHexagram, selectedMood, inspiration, alreadyAdoptedToday, isLoading, loadToday, selectMood, adopt } = useInspiration();
  const { reload } = useCollection();

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const handleAdopt = () => {
    adopt();
    reload();
  };

  if (isLoading || !currentHexagram) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-400">正在遇见神兽...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold text-primary">今日灵感</h1>
      </div>

      <HexagramCard hexagram={currentHexagram} />

      <MoodSelector selected={selectedMood} onSelect={selectMood} />

      {inspiration && <InspirationDisplay inspiration={inspiration} />}

      <div className="mt-2">
        {!alreadyAdoptedToday ? (
          <button
            onClick={handleAdopt}
            className="w-full py-3 bg-accent text-white rounded-full font-bold shadow-md hover:shadow-lg transition-shadow"
          >
            领养这只神兽
          </button>
        ) : (
          <p className="text-center text-sm text-gray-400 py-3">
            今日已领养，明日再来遇见新伙伴吧
          </p>
        )}
      </div>
    </div>
  );
}
