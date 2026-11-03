export interface HighlightSegment {
  text: string;
  match: boolean;
}

/** Lower-cases, trims and collapses whitespace so "  Red   ROSES" matches "red roses". */
export function normalizeSearchTerm(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

/** Splits `text` into matched / unmatched parts so the template can style matches without innerHTML. */
export function highlightSegments(text: string, term: string): HighlightSegment[] {
  const needle = normalizeSearchTerm(term);
  if (!needle) return [{ text, match: false }];

  const haystack = text.toLocaleLowerCase();
  const segments: HighlightSegment[] = [];
  let from = 0;
  for (let i = haystack.indexOf(needle); i !== -1; i = haystack.indexOf(needle, from)) {
    if (i > from) segments.push({ text: text.slice(from, i), match: false });
    segments.push({ text: text.slice(i, i + needle.length), match: true });
    from = i + needle.length;
  }
  if (from < text.length) segments.push({ text: text.slice(from), match: false });
  return segments;
}
