import type { Inspiration } from '../../types/hexagram';
import InspirationText from './InspirationText';
import Disclaimer from '../ui/Disclaimer';

interface Props {
  inspiration: Inspiration;
}

export default function InspirationDisplay({ inspiration }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-sm font-bold text-primary">灵感絮语</p>
      <InspirationText text={inspiration.text} />
      <Disclaimer />
    </div>
  );
}
