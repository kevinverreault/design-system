/**
 * The positions of the photos a Lightbox loads ahead around the one at
 * `index`, in a Gallery of `count` photos: `preload` of them, split between
 * the photos after and before, with an odd one out going after. Nearest
 * first, the next one before the previous one. Like stepping, they wrap
 * around at both ends, and they never repeat a photo or pick the shown one,
 * so a small Gallery gets fewer.
 */
export function neighbours(index: number, count: number, preload: number): number[] {
  const wanted = Math.min(preload, count - 1);
  const positions = new Set<number>();
  const wrap = (position: number) => (position % count + count) % count;

  for (let distance = 1; positions.size < wanted; distance++) {
    positions.add(wrap(index + distance));
    if (positions.size < wanted) positions.add(wrap(index - distance));
  }

  return [...positions];
}
