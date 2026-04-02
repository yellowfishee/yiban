import { useState } from 'react';

const EMOJI_MAP: Record<string, string> = {
  龙: '🐉',
  牛: '🐂',
  麒麟: '🦒',
  龟: '🐢',
  鹿: '🦌',
  鲲: '🐋',
  虎: '🐅',
  狐: '🦊',
  凤: '🦅',
  鹤: '🦢',
  狮: '🦁',
  虹: '🌈',
};

interface Props {
  symbol: string;
  hexagramId: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-28 h-28 text-6xl',
};

export default function HexagramSymbol({ symbol, hexagramId, size = 'md' }: Props) {
  const [imgError, setImgError] = useState(false);
  const emoji = EMOJI_MAP[symbol] ?? '✨';
  const sizeClass = SIZE_CLASSES[size];

  if (imgError) {
    return (
      <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center`}>
        <span>{emoji}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden`}>
      <img
        src={`/hexagrams/${hexagramId}.png`}
        alt={symbol}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
