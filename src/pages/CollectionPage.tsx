import { useCollection } from '../context/CollectionContext';
import HexagramGridItem from '../components/hexagram/HexagramGridItem';

export default function CollectionPage() {
  const { adoptedHexagrams } = useCollection();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-2xl font-bold text-primary text-center">神兽收藏</h1>

      {adoptedHexagrams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-4">
          <span className="text-5xl">🌟</span>
          <p className="text-center">还没有领养神兽</p>
          <p className="text-sm text-center">去今日页遇见你的第一只神兽吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {adoptedHexagrams.map((hex) => (
            <HexagramGridItem
              key={hex.id}
              hexagram={hex}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
