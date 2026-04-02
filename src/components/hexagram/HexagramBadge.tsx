import HexagramSymbol from './HexagramSymbol';

interface Props {
  name: string;
  symbol: string;
  hexagramId: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function HexagramBadge({ name, symbol, hexagramId, size = 'md' }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <HexagramSymbol symbol={symbol} hexagramId={hexagramId} size={size} />
      <span className="font-serif font-bold text-primary">{name}</span>
      <span className="text-xs text-gray-400">{symbol}</span>
    </div>
  );
}
