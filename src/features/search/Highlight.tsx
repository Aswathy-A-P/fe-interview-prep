import { splitByMatch } from './splitByMatch.ts';

interface HighlightProps {
  text: string;
  query: string;
}

function Highlight({ text, query }: HighlightProps) {
  return (
    <>
      {splitByMatch(text, query).map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded-sm bg-yellow-200 px-0.5 text-inherit">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export default Highlight;
