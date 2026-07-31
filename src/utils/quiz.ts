import type { Item } from '../types';

// Picks a random "stored" item to quiz on, weighted so items that haven't
// been reconfirmed in a while come up more often — the quiz exists to keep
// locationVerifiedAt honest (設計思想 B), so it should spend its attention
// on the items most likely to have drifted.
export function pickQuizItem(
  items: Item[],
  random: () => number = Math.random,
): Item | undefined {
  const pool = items.filter((item) => item.status === 'stored');
  if (pool.length === 0) return undefined;

  const oldestFirst = [...pool].sort((a, b) => a.locationVerifiedAt - b.locationVerifiedAt);
  const weights = oldestFirst.map((_, i) => oldestFirst.length - i);
  const total = weights.reduce((sum, w) => sum + w, 0);

  let r = random() * total;
  for (let i = 0; i < oldestFirst.length; i++) {
    r -= weights[i];
    if (r <= 0) return oldestFirst[i];
  }
  return oldestFirst[oldestFirst.length - 1];
}
