import { describe, expect, it } from 'vitest';
import { nextRovingIndex } from './keyboard-navigation';

describe('nextRovingIndex', () => {
  it('moves forward and wraps around', () => {
    expect(nextRovingIndex('ArrowDown', 0, 3)).toBe(1);
    expect(nextRovingIndex('ArrowRight', 2, 3)).toBe(0);
  });

  it('moves backward and wraps around', () => {
    expect(nextRovingIndex('ArrowUp', 1, 3)).toBe(0);
    expect(nextRovingIndex('ArrowLeft', 0, 3)).toBe(2);
  });

  it('starts at the first item when nothing is current', () => {
    expect(nextRovingIndex('ArrowDown', -1, 3)).toBe(0);
    expect(nextRovingIndex('ArrowUp', -1, 3)).toBe(0);
  });

  it('ignores other keys and empty lists', () => {
    expect(nextRovingIndex('Enter', 0, 3)).toBeNull();
    expect(nextRovingIndex('ArrowDown', -1, 0)).toBeNull();
  });
});
