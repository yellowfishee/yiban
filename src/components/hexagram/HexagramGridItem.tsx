import type { Hexagram } from '../../types/hexagram';
import HexagramSymbol from './HexagramSymbol';

interface Props {
  hexagram: Hexagram;
  onClick?: () => void;
}

export default function HexagramGridItem({ hexagram, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <HexagramSymbol symbol={hexagram.symbol} hexagramId={hexagram.id} size="md" />
      <span className="text-sm font-medium text-primary truncate w-full text-center">
        {hexagram.name}
      </span>
    </button>
  );
}
