interface Props {
  title: string;
  content: string;
}

export default function KnowledgeCard({ title, content }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-sm font-bold text-primary mb-2">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  );
}
