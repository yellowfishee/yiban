import type { Mood } from '../../types/hexagram';
import { MOOD_LABELS } from '../../types/hexagram';

interface Props {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
}

export default function MoodSelector({ selected, onSelect }: Props) {
  const moods = Object.keys(MOOD_LABELS) as Mood[];

  return (
    <div className="bg-white rounded-2xl p-4">
      <p className="text-sm font-bold text-primary mb-3">今日心境</p>
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => {
          const isSelected = mood === selected;
          return (
            <button
              key={mood}
              onClick={() => onSelect(mood)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {MOOD_LABELS[mood]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
