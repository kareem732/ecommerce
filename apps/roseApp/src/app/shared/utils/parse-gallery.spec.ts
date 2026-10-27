import { describe, expect, it } from 'vitest';
import { parseGallery } from './parse-gallery';

describe('parseGallery', () => {
  it('returns only the cover when there is no gallery', () => {
    expect(parseGallery('a.jpg')).toEqual(['a.jpg']);
    expect(parseGallery('a.jpg', null)).toEqual(['a.jpg']);
  });

  it('returns an empty list when nothing is given', () => {
    expect(parseGallery()).toEqual([]);
    expect(parseGallery(null, null)).toEqual([]);
  });

  it('parses a JSON string gallery after the cover', () => {
    expect(parseGallery('cover.jpg', JSON.stringify(['1.jpg', '2.jpg']))).toEqual([
      'cover.jpg',
      '1.jpg',
      '2.jpg',
    ]);
  });

  it('supports a plain array gallery', () => {
    expect(parseGallery('cover.jpg', ['1.jpg', '2.jpg'])).toEqual(['cover.jpg', '1.jpg', '2.jpg']);
  });

  it('supports a single url string gallery', () => {
    expect(parseGallery('cover.jpg', '1.jpg')).toEqual(['cover.jpg', '1.jpg']);
  });

  it('removes duplicates and keeps the order', () => {
    expect(parseGallery('a.jpg', ['b.jpg', 'a.jpg', 'b.jpg'])).toEqual(['a.jpg', 'b.jpg']);
  });

  it('falls back to the cover when the JSON is malformed', () => {
    expect(parseGallery('cover.jpg', '[bad json')).toEqual(['cover.jpg']);
  });

  it('ignores blank values, non strings and template placeholders', () => {
    const gallery = ['  ', '{{placeholder}}', 42, 'ok.jpg'] as unknown as string[];

    expect(parseGallery('', gallery)).toEqual(['ok.jpg']);
  });

  it('trims the urls', () => {
    expect(parseGallery('  a.jpg  ', ['  b.jpg'])).toEqual(['a.jpg', 'b.jpg']);
  });
});