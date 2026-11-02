import { highlightSegments, normalizeSearchTerm } from './text-search';

describe('text-search', () => {
  it('normalizes case and whitespace', () => {
    expect(normalizeSearchTerm('  Red   ROSES ')).toBe('red roses');
  });

  it('returns the whole text unmatched for an empty term', () => {
    expect(highlightSegments('Lake Champlain', ' ')).toEqual([{ text: 'Lake Champlain', match: false }]);
  });

  it('marks every case-insensitive match and keeps original casing', () => {
    expect(highlightSegments('Moko Chocolate chocolate', 'CHOCOLATE')).toEqual([
      { text: 'Moko ', match: false },
      { text: 'Chocolate', match: true },
      { text: ' ', match: false },
      { text: 'chocolate', match: true },
    ]);
  });
});
