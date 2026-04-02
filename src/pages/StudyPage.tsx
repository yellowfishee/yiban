import { useEffect, useState } from 'react';
import { getAllHexagrams } from '../mocks';
import KnowledgeCard from '../components/knowledge/KnowledgeCard';
import HexagramListTile from '../components/knowledge/HexagramListTile';
import type { Hexagram } from '../types/hexagram';

const KNOWLEDGE_ITEMS = [
  {
    title: '不易·变易·简易',
    content:
      '《易经》的三大原则：不易——变化的规律不变；变易——万物皆在变化；简易——大道至简。',
  },
  {
    title: '阴阳',
    content:
      '阴阳是《易经》的根基。阴阳相生相克，对立又统一，构成了宇宙运行的基本法则。',
  },
  {
    title: '八卦',
    content:
      '八卦由三个爻组成，分别是：乾（三连）、坤（三断）、震（仰盂）、巽（逊）、坎（满陷）、离（丽）、艮（覆碗）、兑（上缺）。',
  },
];

export default function StudyPage() {
  const [allHexagrams, setAllHexagrams] = useState<Hexagram[]>([]);

  useEffect(() => {
    getAllHexagrams().then(setAllHexagrams);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-primary text-center">智慧书斋</h1>

      <section>
        <p className="text-base font-bold text-primary mb-3">《易经》入门</p>
        <div className="flex flex-col gap-3">
          {KNOWLEDGE_ITEMS.map((item) => (
            <KnowledgeCard key={item.title} title={item.title} content={item.content} />
          ))}
        </div>
      </section>

      <section>
        <p className="text-base font-bold text-primary mb-3">六十四卦一览</p>
        <div className="flex flex-col gap-2">
          {allHexagrams.map((hex) => (
            <HexagramListTile key={hex.id} hexagram={hex} />
          ))}
        </div>
      </section>
    </div>
  );
}
