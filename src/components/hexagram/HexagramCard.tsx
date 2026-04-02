import type { Hexagram } from '../../types/hexagram';
import HexagramSymbol from './HexagramSymbol';

interface Props {
  hexagram: Hexagram;
}

export default function HexagramCard({ hexagram }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center gap-4 animate-float">
      <div className="animate-float-slow">
        <HexagramSymbol symbol={hexagram.symbol} hexagramId={hexagram.id} size="lg" />
      </div>
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-primary">{hexagram.name}</h2>
        <p className="text-sm text-gray-400 mt-1">{hexagram.symbol}</p>
      </div>
    </div>
  );
}
