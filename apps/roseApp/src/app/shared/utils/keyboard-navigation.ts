export const nextRovingIndex = (key: string, current: number, length: number): number | null => {
  if (length === 0) return null;
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return current < 0 ? 0 : (current + 1) % length;
    case 'ArrowUp':
    case 'ArrowLeft':
      return current < 0 ? 0 : (current - 1 + length) % length;
    default:
      return null;
  }
};
