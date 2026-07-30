import type { Item } from '../types';

// Home grid order per spec 6-1: "持ち出し中 → 最近見た → 登録が古い".
// locationVerifiedAt starts out equal to createdAt and only advances when a
// human re-confirms the item, so sorting by it descending naturally pushes
// recently-seen items up and long-untouched ones down — one field does all
// three jobs.
export function sortForBrowsing(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const outDiff = (b.status === 'out' ? 1 : 0) - (a.status === 'out' ? 1 : 0);
    if (outDiff !== 0) return outDiff;
    return b.locationVerifiedAt - a.locationVerifiedAt;
  });
}
