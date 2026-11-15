import { describe, expect, it } from 'vitest';
import { makeAddressLike } from '../../../../shared/utils/testing/address.fixtures';
import { pickSelection, sortByTitle } from './address.utils';

describe('address utils', () => {
  describe('sortByTitle', () => {
    it('orders Home, Work, Family, then other titles', () => {
      const sorted = sortByTitle([
        makeAddressLike({ id: '4', title: 'Gym' }),
        makeAddressLike({ id: '3', title: 'Family' }),
        makeAddressLike({ id: '2', title: 'Work' }),
        makeAddressLike({ id: '1', title: 'Home' }),
      ]);

      expect(sorted.map((a) => a.id)).toEqual(['1', '2', '3', '4']);
    });

    it('keeps the original order inside the same title and does not mutate', () => {
      const input = [
        makeAddressLike({ id: 'b', title: 'Home' }),
        makeAddressLike({ id: 'a', title: 'Home' }),
      ];

      expect(sortByTitle(input).map((a) => a.id)).toEqual(['b', 'a']);
      expect(input.map((a) => a.id)).toEqual(['b', 'a']);
    });
  });

  describe('pickSelection', () => {
    const list = [
      { id: 'a1', isPrimary: false },
      { id: 'a2', isPrimary: true },
    ];

    it('keeps the current selection when it still exists', () => {
      expect(pickSelection(list, 'a1')).toBe('a1');
    });

    it('falls back to the primary address', () => {
      expect(pickSelection(list, 'gone')).toBe('a2');
      expect(pickSelection(list, null)).toBe('a2');
    });

    it('falls back to the first address, then to null', () => {
      expect(pickSelection([{ id: 'x', isPrimary: false }], null)).toBe('x');
      expect(pickSelection([], 'a1')).toBeNull();
    });
  });
});
