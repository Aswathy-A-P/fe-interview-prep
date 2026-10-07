export interface TextPart {
  text: string;
  match: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitByMatch(text: string, query: string): TextPart[] {
  const needle = query.trim();
  if (needle === '') {
    return [{ text, match: false }];
  }
  const pattern = new RegExp(`(${escapeRegExp(needle)})`, 'gi');
  return text
    .split(pattern)
    .map((part, index) => ({ text: part, match: index % 2 === 1 }))
    .filter((part) => part.text !== '');
}
