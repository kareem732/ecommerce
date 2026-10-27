export function parseGallery(cover?: string | null, gallery?: string | string[] | null): string[] {
  const images = new Set<string>();

  const add = (candidate: unknown): void => {
    if (typeof candidate !== 'string') return;
    const trimmed = candidate.trim();
    if (trimmed && !trimmed.includes('{')) images.add(trimmed);
  };

  add(cover);

  if (Array.isArray(gallery)) {
    gallery.forEach(add);
  } else if (typeof gallery === 'string') {
    const trimmed = gallery.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (Array.isArray(parsed)) parsed.forEach(add);
      } catch {
      }
    } else {
      add(trimmed);
    }
  }

  return [...images];
}