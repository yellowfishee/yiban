import type { Hexagram } from '../../types/hexagram';
import HexagramSymbol from '../hexagram/HexagramSymbol';

interface Props {
  hexagram: Hexagram;
}

export default function HexagramListTile({ hexagram }: Props) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
      <HexagramSymbol symbol={hexagram.symbol} hexagramId={hexagram.id} size="sm" />
      <div className="flex-1">
        <span className="font-medium text-primary">{hexagram.name}</span>
        <span className="text-xs text-gray-400 ml-2">{hexagram.symbol}</span>
      </div>
    </div>
  );
}
