import { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
}

export default function InspirationText({ text }: Props) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="leading-8 tracking-wide text-base">
      {displayed}
      <span className="animate-pulse">|</span>
    </p>
  );
}
